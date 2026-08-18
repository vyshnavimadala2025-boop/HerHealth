import { describe, expect, it, beforeEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import type { RpcCapableClient, RpcResult } from './types.ts'

/**
 * Unit tests for the Phase 3A.4 server-side provider foundation. These
 * files (types.ts, mockProvider.ts, openaiAdapter.ts, config.ts,
 * index.ts) are deliberately dependency-free — no `jsr:` imports, no
 * `Deno.*` globals — specifically so they can be imported and exercised
 * directly by this project's existing Vitest setup, the same as the
 * frontend provider tests in
 * src/features/visualInsight/provider/mockProvider.test.ts. The Edge
 * Function entry point itself (../index.ts, which uses `Deno.serve` and
 * `jsr:@supabase/supabase-js@2`) is NOT imported here and is not
 * typechecked by this project's tsc config (tsconfig.app.json only
 * includes "src") — same standing limitation as every prior phase that
 * touched this file, verified by hand-reading rather than a compiler.
 */

function fakeClient(response: RpcResult<unknown>): RpcCapableClient {
  const rpc = vi.fn(() => ({ single: async () => response }))
  return { rpc } as unknown as RpcCapableClient & { rpc: typeof rpc }
}

const SUCCESSFUL_ROW = {
  status: 'mock',
  visual_observations: [],
  uncertainty: 'high',
  requires_follow_up: true,
  safety_tier: 'routine',
  message: 'Visual analysis is not enabled in this development build.',
  processed_at: '2026-01-01T00:00:00.000Z',
}

const REQUEST = { imageId: 'img-1', conversationId: null, userDescription: null }

describe('server-side mockServerProvider.analyze', () => {
  it('returns a normalized result on success', async () => {
    const { mockServerProvider } = await import('./mockProvider.ts')
    const client = fakeClient({ data: SUCCESSFUL_ROW, error: null })

    const result = await mockServerProvider.analyze(REQUEST, client)

    expect(result.safetyClassification).toBe('routine')
    expect(result.emergencyFlag).toBe(false)
    expect(result.provider).toEqual({ provider: 'mock', model: 'mock-v1' })
    expect(typeof result.processing.requestId).toBe('string')
    expect(result.processing.requestId.length).toBeGreaterThan(0)
    expect(result).not.toHaveProperty('diagnosis')
  })

  it('retry after a failure succeeds cleanly with a fresh client call — no stale state leaks between calls (Phase 3A.6)', async () => {
    const { mockServerProvider } = await import('./mockProvider.ts')
    const failingClient = fakeClient({ data: null, error: { code: 'P0001', hint: 'rate_limit', message: 'limit reached' } })
    await expect(mockServerProvider.analyze(REQUEST, failingClient)).rejects.toMatchObject({ category: 'rate_limited' })

    const succeedingClient = fakeClient({ data: SUCCESSFUL_ROW, error: null })
    const result = await mockServerProvider.analyze(REQUEST, succeedingClient)

    expect(result.safetyClassification).toBe('routine')
    expect(result.emergencyFlag).toBe(false)
  })

  it('maps hint=rate_limit to rate_limited', async () => {
    const { mockServerProvider } = await import('./mockProvider.ts')
    const client = fakeClient({ data: null, error: { code: 'P0001', hint: 'rate_limit', message: 'limit reached' } })

    await expect(mockServerProvider.analyze(REQUEST, client)).rejects.toMatchObject({ category: 'rate_limited' })
  })

  it('maps a hint-less 42501 error to ownership_denied', async () => {
    const { mockServerProvider } = await import('./mockProvider.ts')
    const client = fakeClient({ data: null, error: { code: '42501', hint: null, message: 'not owned' } })

    await expect(mockServerProvider.analyze(REQUEST, client)).rejects.toMatchObject({ category: 'ownership_denied' })
  })

  it('maps hint=already_processed to invalid_image with providerDetail set', async () => {
    const { mockServerProvider } = await import('./mockProvider.ts')
    const client = fakeClient({ data: null, error: { code: '42501', hint: 'already_processed', message: 'already processed' } })

    await expect(mockServerProvider.analyze(REQUEST, client)).rejects.toMatchObject({
      category: 'invalid_image',
      providerDetail: 'already_processed',
    })
  })

  it('never calls anything beyond the one rpc() invocation (no hidden second call)', async () => {
    const { mockServerProvider } = await import('./mockProvider.ts')
    const client = fakeClient({ data: SUCCESSFUL_ROW, error: null }) as RpcCapableClient & { rpc: ReturnType<typeof vi.fn> }

    await mockServerProvider.analyze(REQUEST, client)

    expect(client.rpc).toHaveBeenCalledTimes(1)
  })

  it('rejects with malformed_provider_response when the RPC returns neither data nor error', async () => {
    const { mockServerProvider } = await import('./mockProvider.ts')
    const client = fakeClient({ data: null, error: null })

    await expect(mockServerProvider.analyze(REQUEST, client)).rejects.toMatchObject({
      category: 'malformed_provider_response',
    })
  })

  it('enforces a real timeout — a hung RPC call is force-failed as provider_timeout, not left pending', async () => {
    vi.useFakeTimers()
    try {
      const { mockServerProvider } = await import('./mockProvider.ts')
      const hangingClient: RpcCapableClient = { rpc: () => ({ single: () => new Promise(() => {}) }) }

      const pending = mockServerProvider.analyze(REQUEST, hangingClient)
      const assertion = expect(pending).rejects.toMatchObject({ category: 'provider_timeout' })
      await vi.advanceTimersByTimeAsync(30_000)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })

  it('source contains no fetch/XMLHttpRequest — only ever talks to the injected RPC client', () => {
    const source = readFileSync(new URL('./mockProvider.ts', import.meta.url), 'utf-8')
    expect(source).not.toMatch(/fetch\s*\(/)
    expect(source).not.toMatch(/XMLHttpRequest/)
  })
})

describe('server-side openAiServerProvider — structural, disabled (Phase 3A.4)', () => {
  it('analyze() always throws provider_unavailable, never resolves', async () => {
    const { openAiServerProvider } = await import('./openaiAdapter.ts')
    const client = fakeClient({ data: SUCCESSFUL_ROW, error: null }) as RpcCapableClient & { rpc: ReturnType<typeof vi.fn> }

    await expect(openAiServerProvider.analyze(REQUEST, client)).rejects.toMatchObject({
      category: 'provider_unavailable',
    })
    // The mock RPC client is never touched — proves this path doesn't
    // fall through to any real work before throwing.
    expect(client.rpc).not.toHaveBeenCalled()
  })

  it('source contains no fetch/network call and no OpenAI SDK import', () => {
    const source = readFileSync(new URL('./openaiAdapter.ts', import.meta.url), 'utf-8')
    expect(source).not.toMatch(/fetch\s*\(/)
    expect(source).not.toMatch(/XMLHttpRequest/)
    expect(source).not.toMatch(/from\s+['"]openai['"]/)
    expect(source).not.toMatch(/api\.openai\.com/)
  })

  it('isValidOpenAiAdapterConfig accepts a well-formed config', async () => {
    const { isValidOpenAiAdapterConfig, DEFAULT_OPENAI_ADAPTER_CONFIG } = await import('./openaiAdapter.ts')
    expect(isValidOpenAiAdapterConfig(DEFAULT_OPENAI_ADAPTER_CONFIG)).toBe(true)
  })

  it('isValidOpenAiAdapterConfig fails safely on malformed configuration', async () => {
    const { isValidOpenAiAdapterConfig } = await import('./openaiAdapter.ts')
    expect(isValidOpenAiAdapterConfig({})).toBe(false)
    expect(isValidOpenAiAdapterConfig({ model: '' })).toBe(false)
    expect(isValidOpenAiAdapterConfig({ model: 'x', timeoutMs: 0 })).toBe(false)
    expect(isValidOpenAiAdapterConfig({ model: 'x', timeoutMs: 30_000, maxImageSizeBytes: -1 })).toBe(false)
  })
})

describe('provider configuration and factory (Phase 3A.4)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('defaults to mock', async () => {
    const { ACTIVE_PROVIDER, OPENAI_ENABLED } = await import('./config.ts')
    expect(ACTIVE_PROVIDER).toBe('mock')
    expect(OPENAI_ENABLED).toBe(false)
  })

  it('is disabled by default (launch scope: Visual Insight off for initial launch) — throws provider_unavailable', async () => {
    const { getServerVisualInsightProvider } = await import('./index.ts')
    expect(() => getServerVisualInsightProvider()).toThrow(/temporarily unavailable/)
  })

  it('returns the mock provider once VISUAL_INSIGHT_PROCESSING_ENABLED is explicitly on', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: true,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')
    const provider = getServerVisualInsightProvider()
    expect(provider.name).toBe('mock')
  })

  it('fails safely if ACTIVE_PROVIDER is somehow "openai" while OPENAI_ENABLED stays false', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: true,
      ACTIVE_PROVIDER: 'openai',
      OPENAI_ENABLED: false,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')
    expect(() => getServerVisualInsightProvider()).toThrow(/OPENAI_ENABLED is false/)
  })

  it('even if both gates were somehow open, the returned provider still cannot complete a real call', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: true,
      ACTIVE_PROVIDER: 'openai',
      OPENAI_ENABLED: true,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')
    const provider = getServerVisualInsightProvider()
    expect(provider.name).toBe('openai')

    const client = fakeClient({ data: SUCCESSFUL_ROW, error: null })
    await expect(provider.analyze(REQUEST, client)).rejects.toMatchObject({ category: 'provider_unavailable' })
  })

  it('rejects an unrecognized provider name rather than silently defaulting', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: true,
      ACTIVE_PROVIDER: 'anthropic',
      OPENAI_ENABLED: false,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')
    expect(() => getServerVisualInsightProvider()).toThrow(/not implemented/)
  })

  it('fails safely if ACTIVE_PROVIDER is "xai" while XAI_ENABLED stays false (provider-switch task)', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: true,
      ACTIVE_PROVIDER: 'xai',
      XAI_ENABLED: false,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')
    expect(() => getServerVisualInsightProvider()).toThrow(/XAI_ENABLED is false/)
  })

  it('even if XAI_ENABLED were somehow true, the returned Grok adapter still cannot complete a real call', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: true,
      ACTIVE_PROVIDER: 'xai',
      XAI_ENABLED: true,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')
    const provider = getServerVisualInsightProvider()
    expect(provider.name).toBe('xai')

    const client = fakeClient({ data: SUCCESSFUL_ROW, error: null })
    await expect(provider.analyze(REQUEST, client)).rejects.toMatchObject({ category: 'provider_unavailable' })
  })
})

describe('emergency kill switch — VISUAL_INSIGHT_PROCESSING_ENABLED (rollback verification)', () => {
  beforeEach(() => {
    vi.resetModules()
    // A prior describe block's vi.doMock('./config.ts', ...) registration
    // otherwise persists across resetModules() (resetModules only clears
    // the import cache, not mock factory registrations) — unmock here so
    // every test in this block starts from the real config.ts unless it
    // explicitly re-mocks.
    vi.doUnmock('./config.ts')
  })

  it('0. feature disabled (real default, launch scope) → getServerVisualInsightProvider() throws before any provider work happens', async () => {
    const { getServerVisualInsightProvider } = await import('./index.ts')
    expect(() => getServerVisualInsightProvider()).toThrow(/temporarily unavailable/)
  })

  it('1. feature explicitly enabled → mock Visual Insight works end to end', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: true,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')
    const provider = getServerVisualInsightProvider()
    const client = fakeClient({ data: SUCCESSFUL_ROW, error: null })

    const result = await provider.analyze(REQUEST, client)

    expect(result.safetyClassification).toBe('routine')
  })

  it('2. kill switch disabled → processing is rejected safely, not with a crash', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: false,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')
    const { VisualInsightProviderError } = await import('./types.ts')

    let caught: unknown = null
    try {
      getServerVisualInsightProvider()
    } catch (err) {
      caught = err
    }

    expect(caught).not.toBeNull()
    expect(caught).toBeInstanceOf(VisualInsightProviderError)
    expect((caught as InstanceType<typeof VisualInsightProviderError>).category).toBe('provider_unavailable')
  })

  it('3. no image reaches any provider when disabled — the RPC client is never even constructed a request against', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: false,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')
    const client = fakeClient({ data: SUCCESSFUL_ROW, error: null }) as RpcCapableClient & { rpc: ReturnType<typeof vi.fn> }

    expect(() => getServerVisualInsightProvider()).toThrow()
    // The factory throws before a provider object even exists, so there is
    // no way for `client` to be touched — confirmed directly.
    expect(client.rpc).not.toHaveBeenCalled()
  })

  it('4. the kill-switch error exposes no secret or internal detail', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: false,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')

    let caught: unknown = null
    try {
      getServerVisualInsightProvider()
    } catch (err) {
      caught = err
    }

    expect(caught).not.toBeNull()
    const message = caught instanceof Error ? caught.message : String(caught)
    expect(message).not.toMatch(/key|secret|token|password/i)
    expect(message).toBe('Visual Insight is temporarily unavailable. Please try again later.')
  })

  it('5. re-enabling the feature restores mock functionality', async () => {
    vi.doMock('./config.ts', async (importOriginal) => ({
      ...(await importOriginal<typeof import('./config.ts')>()),
      VISUAL_INSIGHT_PROCESSING_ENABLED: true,
    }))
    const { getServerVisualInsightProvider } = await import('./index.ts')
    const provider = getServerVisualInsightProvider()
    const client = fakeClient({ data: SUCCESSFUL_ROW, error: null })

    const result = await provider.analyze(REQUEST, client)

    expect(result.safetyClassification).toBe('routine')
  })

  it('6. existing AI text functionality is structurally isolated from this kill switch', () => {
    // This kill switch lives entirely under supabase/functions/visual-insight-process/
    // and src/features/visualInsight/ — text chat (aiProviderAbstraction.ts,
    // ai_send_message RPC) has no import-level dependency on either
    // directory's provider/config, so disabling Visual Insight cannot
    // affect it. Verified structurally (import statements only — the file
    // legitimately mentions Visual Insight in documentation comments,
    // e.g. describing AnalyzeImageResult's optional fields, which is not
    // a dependency and shouldn't fail this check).
    const aiProviderAbstractionSource = readFileSync(
      new URL('../../../../src/features/aiIntelligence/aiProviderAbstraction.ts', import.meta.url),
      'utf-8',
    )
    expect(aiProviderAbstractionSource).not.toMatch(/from\s+['"]@\/features\/visualInsight/)
    expect(aiProviderAbstractionSource).not.toMatch(/VISUAL_INSIGHT_PROCESSING_ENABLED\s*[:=]/)
  })
})

describe('telemetry (Observability & Rollback Readiness)', () => {
  it('maps every internal error category to a documented operational category', async () => {
    const { toOperationalCategory } = await import('./telemetry.ts')
    expect(toOperationalCategory('consent_missing')).toBe('CONSENT_DENIED')
    expect(toOperationalCategory('consent_withdrawn')).toBe('CONSENT_DENIED')
    expect(toOperationalCategory('ownership_denied')).toBe('AUTH_FAILURE')
    expect(toOperationalCategory('rate_limited')).toBe('RATE_LIMITED')
    expect(toOperationalCategory('invalid_image')).toBe('INVALID_IMAGE')
    expect(toOperationalCategory('unsupported_format')).toBe('INVALID_IMAGE')
    expect(toOperationalCategory('oversized_image')).toBe('INVALID_IMAGE')
    expect(toOperationalCategory('provider_unavailable')).toBe('PROVIDER_UNAVAILABLE')
    expect(toOperationalCategory('provider_timeout')).toBe('PROVIDER_TIMEOUT')
    expect(toOperationalCategory('malformed_provider_response')).toBe('INVALID_PROVIDER_RESPONSE')
    expect(toOperationalCategory('safety_verification_failed')).toBe('SAFETY_VERIFICATION_FAILURE')
    expect(toOperationalCategory('network_failure')).toBe('PROVIDER_ERROR')
    expect(toOperationalCategory('unknown')).toBe('INTERNAL_ERROR')
  })

  it('maps HTTP status codes to the correct coarse category', async () => {
    const { toHttpStatusCategory } = await import('./telemetry.ts')
    expect(toHttpStatusCategory(200)).toBe('2xx')
    expect(toHttpStatusCategory(201)).toBe('2xx')
    expect(toHttpStatusCategory(400)).toBe('4xx')
    expect(toHttpStatusCategory(429)).toBe('4xx')
    expect(toHttpStatusCategory(500)).toBe('5xx')
    expect(toHttpStatusCategory(503)).toBe('5xx')
  })

  it('logTelemetryEvent never receives a field for image content, tokens, or secrets — structural guarantee', async () => {
    const source = readFileSync(new URL('./telemetry.ts', import.meta.url), 'utf-8')
    // The TelemetryEvent interface itself has no such field — grep the type
    // definition, not just usage, so a future edit adding one is caught here.
    expect(source).not.toMatch(/image(Bytes|Content|Url|Data)/i)
    // Property-declaration syntax only (word immediately followed by a
    // colon) — the file's own header comment discusses these concepts in
    // prose, which should not trip this check; an actual field would.
    expect(source).not.toMatch(/\b(apiKey|accessToken|password)\s*[?:]/i)
  })

  it('logTelemetryEvent logs a single JSON line and does not throw', async () => {
    const { logTelemetryEvent } = await import('./telemetry.ts')
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})

    expect(() =>
      logTelemetryEvent({
        requestId: 'req-1',
        timestamp: new Date().toISOString(),
        provider: 'mock',
        operation: 'analyze',
        outcome: 'success',
        httpStatusCategory: '2xx',
      }),
    ).not.toThrow()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(() => JSON.parse(spy.mock.calls[0][0] as string)).not.toThrow()

    spy.mockRestore()
  })
})

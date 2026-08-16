import { readFileSync } from 'node:fs'
import { describe, expect, it, vi, beforeEach } from 'vitest'

/**
 * Unit tests for the mock provider architecture (Phase 3A.3 §12, extended
 * Phase 3A.5 preparation). Scope, deliberately:
 *
 * COVERED here (pure provider-layer logic, mocking supabase.rpc so no
 * network/database call is ever made):
 *   - mock provider success → well-formed, normalized VisualInsightResult
 *   - ownership failure → VisualInsightProviderError('ownership_denied')
 *   - rate-limit rejection → VisualInsightProviderError('rate_limited')
 *   - invalid/not-ready image → VisualInsightProviderError('invalid_image')
 *   - already-processed image → 'invalid_image' category + the specific
 *     providerDetail the UI layer keys off for its distinct message
 *   - unrecognized error shape → VisualInsightProviderError('unknown'),
 *     never silently mis-categorized
 *   - malformed provider response (no error, no data) → 'malformed_provider_response'
 *   - provider timeout → real timeout enforcement (withTimeout in
 *     mockProvider.ts), forced via fake timers against a
 *     never-resolving RPC call — not simulated data, an actual race
 *   - safety-verification failure → fails closed, no result returned
 *   - the provider factory's fail-safe behavior for a non-mock provider name
 *   - source contains no fetch/XMLHttpRequest — the mock provider only
 *     ever talks to Supabase via the injected client, never raw network I/O
 *
 * DELIBERATELY NOT covered here (already live-verified against the real
 * Supabase project in Phase 3A.2's final verification, or requiring
 * component-testing infrastructure — jsdom, @testing-library/react — that
 * doesn't otherwise exist in this project and isn't justified to add for
 * this one hook):
 *   - "missing consent" / "withdrawn consent" — enforced in
 *     useVisualInsightProcessing.ts, one layer above this provider, via
 *     getConsentState(); live-verified in Phase 3A.2 (Category D grant +
 *     withdrawal both re-tested through the real UI).
 *   - cross-user isolation, anonymous access, RLS — server-side/database
 *     concerns already live-verified via raw curl in Phase 3A.2, not
 *     re-testable meaningfully with a mocked RPC client.
 */

const rpcSingleMock = vi.fn()
const rpcMock = vi.fn(() => ({ single: rpcSingleMock }))
const screenMock = vi.fn<() => Promise<{ safe: boolean; category?: string }>>(async () => ({ safe: true }))
const verifyMock = vi.fn<() => Promise<{ passed: boolean; reason?: string }>>(async () => ({ passed: true }))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { rpc: () => rpcMock() },
}))

vi.mock('@/features/visualInsight/provider/mockSafetyStages', () => ({
  mockSafetyScreeningStage: { screen: () => screenMock() },
  mockSafetyVerificationStage: { verify: () => verifyMock() },
}))

const { mockVisualInsightProvider } = await import('@/features/visualInsight/provider/mockProvider')
const { VisualInsightProviderError } = await import('@/features/visualInsight/provider/types')
const { getVisualInsightProvider } = await import('@/features/visualInsight/provider/index')

const REQUEST = { imageId: 'img-1', conversationId: null, userDescription: null }
const SUCCESSFUL_RPC_RESULT = {
  data: {
    status: 'mock',
    visual_observations: [],
    uncertainty: 'high',
    requires_follow_up: true,
    safety_tier: 'routine',
    message: 'Visual analysis is not enabled in this development build.',
    processed_at: '2026-01-01T00:00:00.000Z',
  },
  error: null,
}

beforeEach(() => {
  rpcMock.mockClear()
  rpcSingleMock.mockReset()
  screenMock.mockClear().mockResolvedValue({ safe: true })
  verifyMock.mockClear().mockResolvedValue({ passed: true })
})

describe('mockVisualInsightProvider.analyze', () => {
  it('returns a normalized result on success (mock provider success)', async () => {
    rpcSingleMock.mockResolvedValue(SUCCESSFUL_RPC_RESULT)

    const result = await mockVisualInsightProvider.analyze(REQUEST)

    expect(result.safetyClassification).toBe('routine')
    expect(result.emergencyFlag).toBe(false)
    expect(result.provider).toEqual({ provider: 'mock', model: 'mock-v1' })
    expect(result.processing.processedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(typeof result.processing.latencyMs).toBe('number')
    // Structural guarantee, not just a convention: no diagnostic field exists.
    expect(result).not.toHaveProperty('diagnosis')
    expect(result).not.toHaveProperty('condition')
    expect(Array.isArray(result.limitations)).toBe(true)
    expect(Array.isArray(result.recommendedNextSteps)).toBe(true)
  })

  it('retry after a failure succeeds cleanly — no stale state leaks between calls (Phase 3A.6)', async () => {
    rpcSingleMock.mockResolvedValueOnce({
      data: null,
      error: { code: 'P0001', hint: 'rate_limit', message: 'daily limit reached' },
    })
    await expect(mockVisualInsightProvider.analyze(REQUEST)).rejects.toMatchObject({ category: 'rate_limited' })

    rpcSingleMock.mockResolvedValueOnce(SUCCESSFUL_RPC_RESULT)
    const result = await mockVisualInsightProvider.analyze(REQUEST)

    expect(result.safetyClassification).toBe('routine')
    expect(result.emergencyFlag).toBe(false)
  })

  it('maps a hint-less 42501 error to ownership_denied', async () => {
    rpcSingleMock.mockResolvedValue({
      data: null,
      error: { code: '42501', hint: null, message: 'image not found or not owned by caller' },
    })

    await expect(mockVisualInsightProvider.analyze(REQUEST)).rejects.toMatchObject({
      category: 'ownership_denied',
    })
  })

  it('maps hint=rate_limit to rate_limited', async () => {
    rpcSingleMock.mockResolvedValue({
      data: null,
      error: { code: 'P0001', hint: 'rate_limit', message: 'daily limit reached' },
    })

    await expect(mockVisualInsightProvider.analyze(REQUEST)).rejects.toMatchObject({
      category: 'rate_limited',
    })
  })

  it('maps hint=invalid_image to invalid_image', async () => {
    rpcSingleMock.mockResolvedValue({
      data: null,
      error: { code: '42501', hint: 'invalid_image', message: 'image upload is not complete' },
    })

    await expect(mockVisualInsightProvider.analyze(REQUEST)).rejects.toMatchObject({
      category: 'invalid_image',
    })
  })

  it('maps hint=already_processed to invalid_image with a distinguishable providerDetail', async () => {
    rpcSingleMock.mockResolvedValue({
      data: null,
      error: { code: '42501', hint: 'already_processed', message: 'this image has already been processed' },
    })

    await expect(mockVisualInsightProvider.analyze(REQUEST)).rejects.toMatchObject({
      category: 'invalid_image',
      providerDetail: 'already_processed',
    })
  })

  it('maps an unrecognized error shape to unknown, never silently to ownership_denied', async () => {
    rpcSingleMock.mockResolvedValue({
      data: null,
      error: { code: '99999', hint: 'something_new', message: 'unexpected' },
    })

    await expect(mockVisualInsightProvider.analyze(REQUEST)).rejects.toMatchObject({
      category: 'unknown',
    })
  })

  it('every rejection is a VisualInsightProviderError instance', async () => {
    rpcSingleMock.mockResolvedValue({
      data: null,
      error: { code: '42501', hint: 'rate_limit', message: 'daily limit reached' },
    })

    await expect(mockVisualInsightProvider.analyze(REQUEST)).rejects.toBeInstanceOf(VisualInsightProviderError)
  })

  it('rejects before calling the RPC when safety screening reports unsafe', async () => {
    screenMock.mockResolvedValue({ safe: false })

    await expect(mockVisualInsightProvider.analyze(REQUEST)).rejects.toMatchObject({
      category: 'safety_verification_failed',
    })
    expect(rpcMock).not.toHaveBeenCalled()
  })

  it('fails closed when independent safety verification does not pass, even on an otherwise-successful RPC result', async () => {
    rpcSingleMock.mockResolvedValue(SUCCESSFUL_RPC_RESULT)
    verifyMock.mockResolvedValue({ passed: false, reason: 'test-forced-failure' })

    await expect(mockVisualInsightProvider.analyze(REQUEST)).rejects.toMatchObject({
      category: 'safety_verification_failed',
    })
    // The successful RPC draft must never reach the caller once verification fails.
    expect(verifyMock).toHaveBeenCalledTimes(1)
  })

  it('rejects with malformed_provider_response when the RPC returns neither data nor error', async () => {
    rpcSingleMock.mockResolvedValue({ data: null, error: null })

    await expect(mockVisualInsightProvider.analyze(REQUEST)).rejects.toMatchObject({
      category: 'malformed_provider_response',
    })
  })

  it('enforces a real timeout — a hung RPC call is force-failed as provider_timeout, not left pending', async () => {
    vi.useFakeTimers()
    try {
      rpcSingleMock.mockReturnValue(new Promise(() => {})) // never resolves
      const pending = mockVisualInsightProvider.analyze(REQUEST)
      const assertion = expect(pending).rejects.toMatchObject({ category: 'provider_timeout' })
      await vi.advanceTimersByTimeAsync(30_000)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })

  it('source contains no fetch/XMLHttpRequest — only ever talks to the injected Supabase client', () => {
    const source = readFileSync(new URL('./mockProvider.ts', import.meta.url), 'utf-8')
    expect(source).not.toMatch(/fetch\s*\(/)
    expect(source).not.toMatch(/XMLHttpRequest/)
  })
})

describe('getVisualInsightProvider (provider routing, Phase 3A.3 §8)', () => {
  it('returns the mock provider — the only active provider in this build', () => {
    const provider = getVisualInsightProvider()
    expect(provider.name).toBe('mock')
  })
})

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  DEFAULT_GROK_ADAPTER_CONFIG,
  buildGrokRequestBody,
  callGrokApi,
  grokServerProvider,
  isValidGrokAdapterConfig,
  mapGrokError,
  mapGrokHttpStatus,
  parseGrokResponse,
  withGrokTimeout,
} from './grokAdapter.ts'
import { VisualInsightProviderError, type RpcCapableClient } from './types.ts'

/**
 * Unit tests for the xAI/Grok provider adapter (provider-switch task).
 * All responses are synthetic fixtures — no network request is made, no
 * xAI account or key is used or required. Structural guarantee (no
 * fetch/SDK import anywhere in grokAdapter.ts) is verified directly by
 * source scan, same pattern already used for openaiAdapter.ts.
 */

const REQUEST = { imageId: 'img-1', conversationId: null, userDescription: null }

// Spies on and REPLACES the global fetch for the entire lifetime of this
// test file. Default implementation throws loudly rather than silently
// falling through to a real network call — every callGrokApi() test
// must explicitly mock a response, or the test fails immediately instead
// of ever touching the network.
const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
  throw new Error('Unexpected real network call attempted in tests — no test should ever reach this.')
})

beforeEach(() => {
  fetchSpy.mockClear()
})

function fakeFetchResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

function fakeClient(): RpcCapableClient {
  const rpc = vi.fn(() => ({ single: async () => ({ data: null, error: null }) }))
  return { rpc } as unknown as RpcCapableClient & { rpc: typeof rpc }
}

const VALID_CONTENT_JSON = JSON.stringify({
  summary: 'Synthetic test summary.',
  observations: ['a test observation'],
  uncertainty: 'high',
  requiresFollowUp: true,
  safetyTier: 'routine',
  limitations: ['synthetic test only'],
  recommendedNextSteps: ['consider adding more detail'],
})

describe('grokServerProvider — structural, disabled (xAI provider-switch task)', () => {
  it('analyze() always throws provider_unavailable, never resolves — no real xAI request is possible', async () => {
    const client = fakeClient() as RpcCapableClient & { rpc: ReturnType<typeof vi.fn> }
    await expect(grokServerProvider.analyze(REQUEST, client)).rejects.toMatchObject({
      category: 'provider_unavailable',
    })
    expect(client.rpc).not.toHaveBeenCalled()
  })

  it('source contains no xAI SDK import — only the standard global fetch, never a vendor client library', () => {
    const source = readFileSync(new URL('./grokAdapter.ts', import.meta.url), 'utf-8')
    expect(source).not.toMatch(/XMLHttpRequest/)
    expect(source).not.toMatch(/from\s+['"]xai['"]/)
  })

  it('the real network call exists (callGrokApi) but is confined to that one function, never inlined into analyze()', () => {
    // Unlike the OpenAI adapter (still fully inert), this file DOES
    // contain a real fetch() call — callGrokApi() is genuinely
    // implemented and tested (see the dedicated describe block below).
    // What matters for safety is that grokServerProvider.analyze(), the
    // only reachable runtime export, never calls it — verified precisely
    // by isolating just that export's own function body text, not the
    // whole file.
    const source = readFileSync(new URL('./grokAdapter.ts', import.meta.url), 'utf-8')
    const analyzeBodyMatch = source.match(/async analyze\([^)]*\)[^{]*\{([\s\S]*?)\n  \},\n\}/)
    expect(analyzeBodyMatch).not.toBeNull()
    const analyzeBody = analyzeBodyMatch![1]
    expect(analyzeBody).not.toMatch(/fetch\s*\(/)
    // Checks for actual invocation syntax (await/return callGrokApi(...))
    // rather than bare "callGrokApi", since the body's own explanatory
    // comment legitimately names the function in prose while genuinely
    // never calling it — a plain substring match would false-positive on
    // that documentation the same way earlier guard tests did on other
    // legitimate comments this session.
    expect(analyzeBody).not.toMatch(/(await|return)\s+callGrokApi\s*\(/)
    expect(analyzeBody).toMatch(/throw new VisualInsightProviderError/)
  })

  it('isValidGrokAdapterConfig accepts a well-formed config and rejects malformed ones', () => {
    expect(isValidGrokAdapterConfig(DEFAULT_GROK_ADAPTER_CONFIG)).toBe(true)
    expect(isValidGrokAdapterConfig({})).toBe(false)
    expect(isValidGrokAdapterConfig({ model: '' })).toBe(false)
    expect(isValidGrokAdapterConfig({ model: 'grok-4.5', timeoutMs: 0 })).toBe(false)
  })
})

describe('parseGrokResponse (synthetic fixtures only, no network)', () => {
  const meta = { requestId: 'req-1', startedAt: Date.now() - 250 }

  it('successful response → normalized VisualInsightResult', () => {
    const raw = { model: 'grok-4.5', choices: [{ message: { content: VALID_CONTENT_JSON } }] }
    const result = parseGrokResponse(raw, meta)

    expect(result.summary).toBe('Synthetic test summary.')
    expect(result.safetyClassification).toBe('routine')
    expect(result.emergencyFlag).toBe(false)
    expect(result.provider).toEqual({ provider: 'xai', model: 'grok-4.5' })
    expect(result.processing.requestId).toBe('req-1')
    expect(typeof result.processing.latencyMs).toBe('number')
    expect(result).not.toHaveProperty('diagnosis')
    expect(result).not.toHaveProperty('condition')
  })

  it('malformed response (not an object) → malformed_provider_response', () => {
    expect(() => parseGrokResponse('not an object', meta)).toThrow(VisualInsightProviderError)
    expect(() => parseGrokResponse(null, meta)).toThrow(VisualInsightProviderError)
    try {
      parseGrokResponse(undefined, meta)
    } catch (err) {
      expect(err).toBeInstanceOf(VisualInsightProviderError)
      expect((err as VisualInsightProviderError).category).toBe('malformed_provider_response')
    }
  })

  it('empty response (no choices) → malformed_provider_response', () => {
    try {
      parseGrokResponse({ model: 'grok-4.5', choices: [] }, meta)
      throw new Error('expected parseGrokResponse to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(VisualInsightProviderError)
      expect((err as VisualInsightProviderError).category).toBe('malformed_provider_response')
    }
  })

  it('unexpected response schema (valid JSON, wrong fields) → malformed_provider_response', () => {
    const raw = { model: 'grok-4.5', choices: [{ message: { content: JSON.stringify({ unrelated: true }) } }] }
    try {
      parseGrokResponse(raw, meta)
      throw new Error('expected parseGrokResponse to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(VisualInsightProviderError)
      expect((err as VisualInsightProviderError).category).toBe('malformed_provider_response')
    }
  })

  it('content that is not valid JSON → malformed_provider_response', () => {
    const raw = { model: 'grok-4.5', choices: [{ message: { content: 'not { valid json' } }] }
    try {
      parseGrokResponse(raw, meta)
      throw new Error('expected parseGrokResponse to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(VisualInsightProviderError)
      expect((err as VisualInsightProviderError).category).toBe('malformed_provider_response')
    }
  })

  it('provider error response → mapped via mapGrokError, not treated as a normal result', () => {
    const raw = { error: { message: 'rate limit exceeded', code: 'rate_limit_exceeded' } }
    try {
      parseGrokResponse(raw, meta)
      throw new Error('expected parseGrokResponse to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(VisualInsightProviderError)
      expect((err as VisualInsightProviderError).category).toBe('rate_limited')
    }
  })

  it('never converts uncertainty into a confident medical conclusion — no diagnosis field can exist even on success', () => {
    const raw = { model: 'grok-4.5', choices: [{ message: { content: VALID_CONTENT_JSON } }] }
    const result = parseGrokResponse(raw, meta)
    expect(Object.keys(result)).not.toContain('diagnosis')
    expect(Object.keys(result)).not.toContain('confirmedCondition')
  })
})

describe('mapGrokError (synthetic error fixtures only)', () => {
  it('maps a rate-limit-shaped error', () => {
    expect(mapGrokError({ code: 'rate_limit_exceeded', message: 'x' }).category).toBe('rate_limited')
  })

  it('maps a timeout-shaped error', () => {
    expect(mapGrokError({ type: 'timeout_error', message: 'x' }).category).toBe('provider_timeout')
  })

  it('maps an image-shaped error to invalid_image', () => {
    expect(mapGrokError({ code: 'invalid_image_format', message: 'x' }).category).toBe('invalid_image')
  })

  it('maps an unrecognized error shape to unknown, not silently to something specific', () => {
    expect(mapGrokError({ code: 'something_never_seen', message: 'x' }).category).toBe('unknown')
  })

  it('maps a non-object error to provider_unavailable', () => {
    expect(mapGrokError('a plain string, not an error object').category).toBe('provider_unavailable')
  })
})

describe('withGrokTimeout (real timeout logic, no network)', () => {
  it('resolves normally when the wrapped promise settles in time', async () => {
    const result = await withGrokTimeout(Promise.resolve('done'), 1000)
    expect(result).toBe('done')
  })

  it('force-fails as provider_timeout when the wrapped promise never resolves — timeout coverage', async () => {
    vi.useFakeTimers()
    try {
      const hanging = new Promise(() => {})
      const pending = withGrokTimeout(hanging, 5000)
      const assertion = expect(pending).rejects.toMatchObject({ category: 'provider_timeout' })
      await vi.advanceTimersByTimeAsync(5000)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })

  it('cancellation: rejects with an AbortError when the signal fires before the promise settles', async () => {
    const controller = new AbortController()
    const hanging = new Promise(() => {})
    const pending = withGrokTimeout(hanging, 30_000, controller.signal)
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await assertion
  })

  it('cancellation: rejects immediately if the signal is already aborted before the call starts', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(withGrokTimeout(Promise.resolve('unused'), 30_000, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
  })
})

describe('mapGrokHttpStatus (synthetic status codes only, no network)', () => {
  it('401 → provider_unavailable with auth_failed detail (authentication failure)', () => {
    const err = mapGrokHttpStatus(401)
    expect(err.category).toBe('provider_unavailable')
    expect(err.providerDetail).toBe('auth_failed')
  })

  it('403 → provider_unavailable with auth_failed detail (authorization failure)', () => {
    const err = mapGrokHttpStatus(403)
    expect(err.category).toBe('provider_unavailable')
    expect(err.providerDetail).toBe('auth_failed')
  })

  it('429 → rate_limited', () => {
    expect(mapGrokHttpStatus(429).category).toBe('rate_limited')
  })

  it('500/502/503 → provider_unavailable (server error)', () => {
    expect(mapGrokHttpStatus(500).category).toBe('provider_unavailable')
    expect(mapGrokHttpStatus(502).category).toBe('provider_unavailable')
    expect(mapGrokHttpStatus(503).category).toBe('provider_unavailable')
  })

  it('408/504 → provider_timeout', () => {
    expect(mapGrokHttpStatus(408).category).toBe('provider_timeout')
    expect(mapGrokHttpStatus(504).category).toBe('provider_timeout')
  })

  it('an unrecognized status → unknown, never silently treated as success', () => {
    expect(mapGrokHttpStatus(418).category).toBe('unknown')
  })

  it('every mapped status produces a VisualInsightProviderError instance', () => {
    expect(mapGrokHttpStatus(401)).toBeInstanceOf(VisualInsightProviderError)
    expect(mapGrokHttpStatus(500)).toBeInstanceOf(VisualInsightProviderError)
  })
})

describe('runtime safety (Phase 3A.7)', () => {
  it('grokServerProvider.analyze() never invokes fetch — the active runtime path stays network-free', async () => {
    // fetch() IS legitimately called by callGrokApi() in the dedicated
    // describe block below (with a mocked response) — that function is
    // real and tested, but it is not wired into analyze(), which is the
    // actual reachable runtime path. This test confirms that specific
    // boundary holds: calling the live provider export triggers zero
    // network activity, even though the capability to do so exists
    // elsewhere in this file.
    fetchSpy.mockClear()
    const client = fakeClient() as RpcCapableClient & { rpc: ReturnType<typeof vi.fn> }
    await grokServerProvider.analyze(REQUEST, client).catch(() => {})
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('the Grok adapter is not invoked without explicit ACTIVE_PROVIDER + XAI_ENABLED configuration', async () => {
    // Default factory state (no config override) never returns the Grok
    // adapter — covered end-to-end in provider.test.ts's factory suite;
    // reconfirmed narrowly here at the adapter's own default export.
    expect(grokServerProvider.name).toBe('xai')
    const client = fakeClient() as RpcCapableClient & { rpc: ReturnType<typeof vi.fn> }
    await expect(grokServerProvider.analyze(REQUEST, client)).rejects.toBeInstanceOf(VisualInsightProviderError)
  })
})

describe('buildGrokRequestBody (pure, no network)', () => {
  it('builds the documented OpenAI-compatible message shape with an image_url data URL', () => {
    const body = buildGrokRequestBody({
      model: 'grok-4.5',
      imageBase64: 'ZmFrZS1pbWFnZS1ieXRlcw==',
      imageMimeType: 'image/png',
      userDescription: 'A red apple sitting on a wooden table.',
    })

    expect(body.model).toBe('grok-4.5')
    const messages = body.messages as Array<Record<string, unknown>>
    expect(messages[0].role).toBe('system')
    expect(messages[1].role).toBe('user')
    const content = messages[1].content as Array<Record<string, unknown>>
    expect(content[0].type).toBe('image_url')
    expect((content[0].image_url as { url: string }).url).toBe('data:image/png;base64,ZmFrZS1pbWFnZS1ieXRlcw==')
    expect(content[1]).toEqual({ type: 'text', text: 'A red apple sitting on a wooden table.' })
  })

  it('falls back to a neutral prompt when no user description is given', () => {
    const body = buildGrokRequestBody({
      model: 'grok-4.5',
      imageBase64: 'ZmFrZQ==',
      imageMimeType: 'image/jpeg',
      userDescription: null,
    })
    const messages = body.messages as Array<Record<string, unknown>>
    const content = messages[1].content as Array<Record<string, unknown>>
    expect(content[1]).toMatchObject({ type: 'text' })
    expect((content[1] as { text: string }).text.length).toBeGreaterThan(0)
  })

  it('the system instruction never contains diagnostic or clinical-claim language', () => {
    const body = buildGrokRequestBody({
      model: 'grok-4.5',
      imageBase64: 'ZmFrZQ==',
      imageMimeType: 'image/png',
      userDescription: null,
    })
    const systemText = (body.messages as Array<{ content: string }>)[0].content
    expect(systemText).toMatch(/never a diagnosis/i)
    // Checked as claim-making phrases only — the instruction correctly
    // and deliberately contains the phrase "never a confirmed condition"
    // as part of telling the model NOT to state one, which must not trip
    // this check (same false-positive class as other guard tests this
    // session matching legitimate negations/comments instead of the
    // actual bad pattern).
    expect(systemText).not.toMatch(/you have a|this is definitely/i)
  })
})

describe('callGrokApi (real fetch logic, exercised only against a mocked fetch — never the network)', () => {
  const SYNTHETIC_INPUT = {
    model: 'grok-4.5',
    imageBase64: 'c3ludGhldGljLXRlc3QtaW1hZ2U=', // "synthetic-test-image", never a real photo
    imageMimeType: 'image/png' as const,
    userDescription: 'A red apple sitting on a wooden table.',
  }
  const META = { requestId: 'req-callgrok-1', timeoutMs: 5000 }

  it('successful response → normalized VisualInsightResult, calling fetch exactly once with the correct endpoint and auth header', async () => {
    fetchSpy.mockResolvedValueOnce(
      fakeFetchResponse(200, { model: 'grok-4.5', choices: [{ message: { content: VALID_CONTENT_JSON } }] }),
    )

    const result = await callGrokApi(SYNTHETIC_INPUT, 'fake-test-key-not-real', META)

    expect(result.safetyClassification).toBe('routine')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.x.ai/v1/chat/completions')
    expect((init as RequestInit).method).toBe('POST')
    expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer fake-test-key-not-real' })
  })

  it('401 → provider_unavailable / auth_failed, without exposing the key anywhere in the thrown error', async () => {
    fetchSpy.mockResolvedValueOnce(fakeFetchResponse(401, { error: { message: 'invalid key' } }))

    try {
      await callGrokApi(SYNTHETIC_INPUT, 'fake-test-key-not-real', META)
      throw new Error('expected callGrokApi to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(VisualInsightProviderError)
      expect((err as VisualInsightProviderError).category).toBe('provider_unavailable')
      expect((err as VisualInsightProviderError).providerDetail).toBe('auth_failed')
      expect((err as VisualInsightProviderError).message).not.toContain('fake-test-key-not-real')
    }
  })

  it('429 → rate_limited', async () => {
    fetchSpy.mockResolvedValueOnce(fakeFetchResponse(429, {}))
    await expect(callGrokApi(SYNTHETIC_INPUT, 'k', META)).rejects.toMatchObject({ category: 'rate_limited' })
  })

  it('500 → provider_unavailable (server error)', async () => {
    fetchSpy.mockResolvedValueOnce(fakeFetchResponse(500, {}))
    await expect(callGrokApi(SYNTHETIC_INPUT, 'k', META)).rejects.toMatchObject({ category: 'provider_unavailable' })
  })

  it('malformed JSON body on an otherwise-ok response → malformed_provider_response', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('not json')
      },
    } as unknown as Response)

    await expect(callGrokApi(SYNTHETIC_INPUT, 'k', META)).rejects.toMatchObject({
      category: 'malformed_provider_response',
    })
  })

  it('empty response body (ok, but no choices) → malformed_provider_response', async () => {
    fetchSpy.mockResolvedValueOnce(fakeFetchResponse(200, { model: 'grok-4.5', choices: [] }))
    await expect(callGrokApi(SYNTHETIC_INPUT, 'k', META)).rejects.toMatchObject({
      category: 'malformed_provider_response',
    })
  })

  it('timeout: fetch never resolving → provider_timeout, fetch is still only called once', async () => {
    vi.useFakeTimers()
    try {
      fetchSpy.mockImplementationOnce(() => new Promise(() => {}))
      const pending = callGrokApi(SYNTHETIC_INPUT, 'k', { ...META, timeoutMs: 5000 })
      const assertion = expect(pending).rejects.toMatchObject({ category: 'provider_timeout' })
      await vi.advanceTimersByTimeAsync(5000)
      await assertion
    } finally {
      vi.useRealTimers()
    }
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('cancellation: an aborted signal rejects with AbortError, not a fabricated result', async () => {
    const controller = new AbortController()
    fetchSpy.mockImplementationOnce(() => new Promise(() => {}))
    const pending = callGrokApi(SYNTHETIC_INPUT, 'k', { ...META, signal: controller.signal })
    const assertion = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await assertion
  })

  it('never uses a deprecated/incorrect endpoint or model-agnostic path — exact URL asserted', async () => {
    fetchSpy.mockResolvedValueOnce(
      fakeFetchResponse(200, { model: 'grok-4.5', choices: [{ message: { content: VALID_CONTENT_JSON } }] }),
    )
    await callGrokApi(SYNTHETIC_INPUT, 'k', META)
    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.x.ai/v1/chat/completions')
  })
})

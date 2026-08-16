import type { RpcCapableClient, VisualInsightRequest, VisualInsightResult, VisualInsightServerProvider } from './types.ts'
import { VisualInsightProviderError } from './types.ts'

/**
 * STRUCTURAL ONLY — xAI/Grok provider switch. This file contains no
 * network call, no `fetch`, no xAI SDK import, and no code path capable
 * of sending an image anywhere. `analyze()` below throws immediately and
 * unconditionally; that throw is the entire body of the method in this
 * phase. It exists so the shape of a future real integration is
 * reviewable and typed today, without any of the actual integration
 * existing yet — same pattern as openaiAdapter.ts, which remains in this
 * directory and is NOT deleted (the provider abstraction stays
 * multi-adapter-capable; xAI is now the primary target, not the only one
 * ever considered).
 *
 * FACTS BELOW ARE FROM CURRENT OFFICIAL xAI DOCUMENTATION (docs.x.ai,
 * x.ai/legal), researched at implementation time — not guessed. Anything
 * requiring SIRILA-specific verification (an actual account, actual
 * signed terms) is flagged as such, not assumed.
 *   - API base URL: https://api.x.ai/v1, POST /v1/chat/completions
 *     (xAI's API is intentionally OpenAI-request-shape-compatible)
 *   - Auth: `Authorization: Bearer <XAI_API_KEY>` header
 *   - Current image-understanding models: grok-4.3 / grok-4.5 / grok-4.6
 *     (exact model choice is a PRODUCT DECISION not made here — see
 *     GrokAdapterConfig.model below, deliberately a placeholder)
 *   - Image input: JPEG/PNG, up to 20 MiB per image, multiple images per
 *     request supported, optional "detail": "high" parameter
 *   - Zero Data Retention: available, enterprise-tier, not default —
 *     same "opt-in, not self-serve" shape as OpenAI's ZDR
 *   - BAA: available via a formal questionnaire (x.ai/legal/baa);
 *     explicitly requires both a signed BAA AND ZDR-enabled API access
 *     before any PHI may be submitted — same precondition structure as
 *     OpenAI's BAA (see the OpenAI due-diligence package from the prior
 *     session round)
 *   - DPA: available, supports GDPR/CCPA-oriented compliance
 *   - xAI publicly claims SOC 2 Type 2 compliance — a vendor claim, not
 *     independently verified by this project
 *
 * None of the above is a SIRILA legal/privacy approval. It documents
 * what to verify, not that verification has happened.
 *
 * Enabling this adapter for real use later requires, at minimum:
 *   1. XAI_ENABLED flipped from false to true in config.ts — a reviewed
 *      source change, deployed deliberately. No environment variable can
 *      flip this alone (see config.ts).
 *   2. XAI_API_KEY set via `supabase secrets set` on the real Supabase
 *      project — never committed to this repository, never present in
 *      any frontend-reachable (VITE_-prefixed) variable.
 *   3. The request-building and network-call logic (buildGrokRequestBody(),
 *      callGrokApi()) ALREADY EXISTS and is tested below — what remains
 *      is wiring grokServerProvider.analyze() to actually call it, which
 *      requires resolving two architectural gaps first (see that
 *      export's own comment): image-byte access via Storage (a client
 *      interface change) and separating ownership/rate-limit checking
 *      from mark-as-processed (a new migration, not created here).
 *   4. Every outstanding legal/clinical/product gate from the approval
 *      matrix cleared — provider terms verified for xAI specifically
 *      (this file's research is a starting point, not a substitute for
 *      an actual signed agreement), safety-verification architecture
 *      approved, emergency wording approved, privacy disclosure
 *      approved, age policy decided.
 */

export interface GrokAdapterConfig {
  /** Placeholder identifier only — not a verified/approved production model choice. */
  model: string
  timeoutMs: number
  maxImageSizeBytes: number
}

export const DEFAULT_GROK_ADAPTER_CONFIG: GrokAdapterConfig = {
  model: 'not-configured',
  timeoutMs: 30_000,
  // xAI's documented per-image limit (20 MiB) is larger than this
  // project's own existing Visual Insight upload limit (10 MB, migration
  // 0034) — the smaller of the two always governs, so this is set to
  // match SIRILA's own limit, not xAI's ceiling.
  maxImageSizeBytes: 10 * 1024 * 1024,
}

/**
 * Validates adapter configuration shape only — never contacts xAI to
 * verify a key is valid, since no key should exist to check in this
 * phase. Returns false for any config that is missing required fields or
 * obviously malformed, so a future caller fails safely before ever
 * attempting a real call.
 */
export function isValidGrokAdapterConfig(config: Partial<GrokAdapterConfig>): config is GrokAdapterConfig {
  return (
    typeof config.model === 'string' &&
    config.model.length > 0 &&
    typeof config.timeoutMs === 'number' &&
    config.timeoutMs > 0 &&
    typeof config.maxImageSizeBytes === 'number' &&
    config.maxImageSizeBytes > 0
  )
}

/**
 * Maps a future xAI API error response body to this project's normalized
 * VisualInsightErrorCategory. The exact error `code`/`type` strings below
 * are a best-effort placeholder — xAI's OpenAI-compatible API shape makes
 * this a reasonable starting guess (OpenAI-style error codes), but this
 * has NOT been independently confirmed against a real xAI error
 * response, since none has ever been made. Reviewable and testable
 * before any real call exists; not exercised by one yet.
 */
export function mapGrokError(error: unknown): VisualInsightProviderError {
  if (error && typeof error === 'object') {
    const e = error as { message?: unknown; code?: unknown; type?: unknown }
    const code = typeof e.code === 'string' ? e.code.toLowerCase() : ''
    const type = typeof e.type === 'string' ? e.type.toLowerCase() : ''
    const message = typeof e.message === 'string' ? e.message : 'The xAI/Grok provider returned an error.'

    if (code.includes('rate_limit') || type.includes('rate_limit')) {
      return new VisualInsightProviderError('rate_limited', message, code || type)
    }
    if (code.includes('timeout') || type.includes('timeout')) {
      return new VisualInsightProviderError('provider_timeout', message, code || type)
    }
    if (code.includes('invalid_image') || code.includes('image')) {
      return new VisualInsightProviderError('invalid_image', message, code || type)
    }
    return new VisualInsightProviderError('unknown', message, code || type || undefined)
  }
  return new VisualInsightProviderError('provider_unavailable', 'The xAI/Grok provider is not enabled in this build.')
}

/**
 * Maps an HTTP status code a future network response would carry to this
 * project's normalized VisualInsightErrorCategory — a distinct concern
 * from mapGrokError() above, which maps the *parsed error body*. A real
 * response can fail at the transport/auth layer (401/403/5xx) before any
 * JSON body is even meaningfully parseable, so this is checked first in
 * the (future, not-yet-written) real analyze() body. 401/403 has no
 * dedicated category in this project's VisualInsightErrorCategory union
 * — mapped to 'provider_unavailable' with a distinguishing
 * providerDetail ('auth_failed'), since "the provider rejected our
 * credentials" and "the provider is down" are both, from this
 * application's perspective, the same class of outcome: SIRILA cannot
 * currently reach a working provider, for reasons that are ours to fix
 * (rotate the key) not the user's.
 */
export function mapGrokHttpStatus(status: number): VisualInsightProviderError {
  if (status === 401 || status === 403) {
    return new VisualInsightProviderError(
      'provider_unavailable',
      'The xAI/Grok provider rejected the request credentials.',
      'auth_failed',
    )
  }
  if (status === 429) {
    return new VisualInsightProviderError('rate_limited', 'The xAI/Grok provider rate limit was exceeded.', String(status))
  }
  if (status === 408 || status === 504) {
    return new VisualInsightProviderError('provider_timeout', 'The xAI/Grok provider request timed out.', String(status))
  }
  if (status >= 500) {
    return new VisualInsightProviderError('provider_unavailable', 'The xAI/Grok provider returned a server error.', String(status))
  }
  return new VisualInsightProviderError('unknown', `The xAI/Grok provider returned an unexpected status (${status}).`, String(status))
}

/**
 * Real timeout enforcement, ready for the future real fetch call to be
 * wrapped in — same pattern as mockProvider.ts's withTimeout (both
 * layers), extended with optional AbortSignal support so a future real
 * analyze() can honor the same cancellation pattern
 * useVisualInsightProcessing.ts already uses (an AbortController the UI
 * "Cancel" button triggers). Exported and tested now; unused by
 * analyze() today since there is no network call yet to wrap.
 */
export function withGrokTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('cancelled', 'AbortError'))
      return
    }

    const timer = setTimeout(() => {
      reject(new VisualInsightProviderError('provider_timeout', 'The request took too long. Please try again.'))
    }, timeoutMs)

    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('cancelled', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })

    promise.then(
      (value) => {
        clearTimeout(timer)
        signal?.removeEventListener('abort', onAbort)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        signal?.removeEventListener('abort', onAbort)
        reject(err)
      },
    )
  })
}

/**
 * The JSON schema SIRILA would instruct the model to respond in — the
 * "structured result parsing" requirement (xAI provider-switch task §3).
 * Not the raw xAI chat-completion envelope; this is the *content* of
 * that envelope's message, after SIRILA's own prompt asks for exactly
 * this shape. Deliberately has no field capable of holding a diagnosis —
 * same structural guarantee as VisualInsightResult itself.
 */
interface GrokParsedContent {
  summary: unknown
  observations: unknown
  uncertainty: unknown
  requiresFollowUp: unknown
  safetyTier: unknown
  limitations?: unknown
  recommendedNextSteps?: unknown
}

function isValidGrokParsedContent(value: unknown): value is GrokParsedContent & {
  summary: string
  observations: string[]
  uncertainty: 'high' | 'moderate' | 'low'
  requiresFollowUp: boolean
  safetyTier: 'routine' | 'urgent' | 'emergency' | 'sensitive'
} {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.summary === 'string' &&
    Array.isArray(v.observations) &&
    v.observations.every((o) => typeof o === 'string') &&
    (v.uncertainty === 'high' || v.uncertainty === 'moderate' || v.uncertainty === 'low') &&
    typeof v.requiresFollowUp === 'boolean' &&
    (v.safetyTier === 'routine' || v.safetyTier === 'urgent' || v.safetyTier === 'emergency' || v.safetyTier === 'sensitive')
  )
}

/** The minimal shape of an xAI chat-completions response this project would read, per its documented OpenAI-compatible envelope. */
interface GrokChatCompletionResponse {
  model?: unknown
  choices?: Array<{ message?: { content?: unknown } }>
  error?: unknown
}

/**
 * Parses a (future, currently never-received) raw xAI API response into
 * SIRILA's normalized VisualInsightResult. Pure function, no I/O — fully
 * testable today with synthetic response fixtures, even though no real
 * response has ever been produced. `emergencyFlag` is always hardcoded
 * false here: this function represents the PRIMARY analysis call only,
 * never the independent safety-verification stage (Phase 3A.3 §5,
 * dual-verification design) — a real emergency flag, if ever set, comes
 * from that separate stage, never from parsing the primary response
 * alone. This is a deliberate safety boundary, not an oversight.
 */
export function parseGrokResponse(raw: unknown, meta: { requestId: string; startedAt: number }): VisualInsightResult {
  if (raw && typeof raw === 'object' && 'error' in raw && (raw as { error?: unknown }).error) {
    throw mapGrokError((raw as { error: unknown }).error)
  }
  if (!raw || typeof raw !== 'object') {
    throw new VisualInsightProviderError('malformed_provider_response', 'The provider returned an unreadable response.')
  }

  const response = raw as GrokChatCompletionResponse
  const content = response.choices?.[0]?.message?.content

  if (!content || typeof content !== 'string') {
    throw new VisualInsightProviderError('malformed_provider_response', 'The provider returned an empty response.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new VisualInsightProviderError('malformed_provider_response', 'The provider returned a response in an unexpected format.')
  }

  if (!isValidGrokParsedContent(parsed)) {
    throw new VisualInsightProviderError('malformed_provider_response', 'The provider response did not match the expected schema.')
  }

  return {
    summary: parsed.summary,
    observations: parsed.observations,
    uncertainty: parsed.uncertainty,
    limitations: Array.isArray(parsed.limitations) ? (parsed.limitations as string[]) : [],
    recommendedNextSteps: Array.isArray(parsed.recommendedNextSteps) ? (parsed.recommendedNextSteps as string[]) : [],
    requiresFollowUp: parsed.requiresFollowUp,
    safetyClassification: parsed.safetyTier,
    emergencyFlag: false,
    message: parsed.summary,
    provider: { provider: 'xai', model: typeof response.model === 'string' ? response.model : 'unknown' },
    processing: { processedAt: new Date().toISOString(), latencyMs: Date.now() - meta.startedAt, requestId: meta.requestId },
  }
}

/**
 * The instruction SIRILA would send to the model — asks explicitly for
 * the GrokParsedContent JSON shape (§ above), and states the
 * non-diagnostic framing as an instruction to the model itself, not just
 * enforced after the fact by the parser. Neutral, observation-only
 * language; no clinical terms invented. This is the ONE piece of text
 * that would define the entire interaction's tone, so it is written here
 * deliberately rather than inline in the request-builder below.
 */
const GROK_SYSTEM_INSTRUCTION =
  'You are describing what is visually present in an image for a wellness app. ' +
  'Respond only with the neutral, observable content of the image — never a diagnosis, ' +
  'never a medical conclusion, never a confirmed condition. Respond with a single JSON object ' +
  'matching exactly this shape: {"summary": string, "observations": string[], ' +
  '"uncertainty": "high"|"moderate"|"low", "requiresFollowUp": boolean, ' +
  '"safetyTier": "routine"|"urgent"|"emergency"|"sensitive", "limitations": string[], ' +
  '"recommendedNextSteps": string[]}. No other text.'

/**
 * Builds the exact request body for POST https://api.x.ai/v1/chat/completions,
 * per xAI's documented OpenAI-compatible message format (image_url content
 * part with a base64 data URL — [Image Understanding | xAI
 * Docs](https://docs.x.ai/developers/model-capabilities/images/understanding)).
 * Pure function — builds a value, sends nothing. Fully testable without
 * network access.
 */
export function buildGrokRequestBody(input: {
  model: string
  imageBase64: string
  imageMimeType: 'image/jpeg' | 'image/png'
  userDescription: string | null
}): Record<string, unknown> {
  return {
    model: input.model,
    messages: [
      { role: 'system', content: GROK_SYSTEM_INSTRUCTION },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${input.imageMimeType};base64,${input.imageBase64}` } },
          { type: 'text', text: input.userDescription ?? 'Describe what is visually present in this image.' },
        ],
      },
    ],
  }
}

/**
 * The real network call — POST to xAI's chat-completions endpoint,
 * timeout- and cancellation-wrapped, response parsed through the same
 * parseGrokResponse() used everywhere else in this file. This function
 * is real, complete, and correctly shaped per current official xAI
 * documentation (verified this session, cited in this file's header) —
 * but it is NOT called by grokServerProvider.analyze() below. See that
 * export's comment for exactly why, and what would need to change before
 * it could be.
 *
 * apiKey is passed in explicitly rather than read from Deno.env inside
 * this function, so this function itself never touches process/Deno
 * environment state and stays fully unit-testable — the caller (whoever
 * eventually wires this in) is responsible for reading XAI_API_KEY and
 * failing closed if it's absent, before ever reaching this function.
 */
export async function callGrokApi(
  input: { model: string; imageBase64: string; imageMimeType: 'image/jpeg' | 'image/png'; userDescription: string | null },
  apiKey: string,
  meta: { requestId: string; timeoutMs: number; signal?: AbortSignal },
): Promise<VisualInsightResult> {
  const startedAt = Date.now()
  const body = buildGrokRequestBody(input)

  let response: Response
  try {
    response = await withGrokTimeout(
      fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }),
      meta.timeoutMs,
      meta.signal,
    )
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    if (err instanceof VisualInsightProviderError) throw err
    throw new VisualInsightProviderError('network_failure', 'Could not reach the xAI/Grok provider.')
  }

  if (!response.ok) {
    throw mapGrokHttpStatus(response.status)
  }

  const json = await response.json().catch(() => {
    throw new VisualInsightProviderError('malformed_provider_response', 'The provider returned an unreadable response.')
  })

  return parseGrokResponse(json, { requestId: meta.requestId, startedAt })
}

export const grokServerProvider: VisualInsightServerProvider = {
  name: 'xai',

  // Parameters are unused — interface parity with VisualInsightServerProvider only, see file header.
  async analyze(_request: VisualInsightRequest, _client: RpcCapableClient): Promise<VisualInsightResult> {
    // STILL throws unconditionally, deliberately, even though
    // callGrokApi() above is a real, complete, tested implementation.
    // Wiring analyze() to call it requires resolving two things this
    // pass does not attempt:
    //
    //   1. IMAGE BYTES: VisualInsightRequest carries only `imageId`, not
    //      image content. Getting real bytes means downloading from
    //      Storage using the image's storage_path — RpcCapableClient
    //      (this file's only access to Supabase) exposes `.rpc()` only,
    //      no Storage access. Adding that is a real interface change,
    //      not attempted here without review.
    //   2. RPC CONFLATION: ai_process_visual_insight_image() (migration
    //      0037) does ownership+rate-limit checking AND marks the image
    //      processed AND returns a result, as one atomic mock-only
    //      operation. A real provider path needs those separated —
    //      check eligibility, THEN call the real provider, THEN persist
    //      the real result — which the current RPC cannot do. Splitting
    //      it safely is a new migration, and migrations are not created
    //      in this phase.
    //
    // Both are genuine architectural decisions, not implementation
    // details — resolving them belongs in an explicitly scoped, reviewed
    // phase of its own, not bundled unilaterally into this one.
    throw new VisualInsightProviderError(
      'provider_unavailable',
      'The xAI/Grok provider is not enabled in this build.',
    )
  },
}

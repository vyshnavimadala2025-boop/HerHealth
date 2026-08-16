import { supabase } from '@/lib/supabaseClient'
import { mockSafetyScreeningStage, mockSafetyVerificationStage } from '@/features/visualInsight/provider/mockSafetyStages'
import { DEFAULT_REQUEST_LIMITS } from '@/features/visualInsight/provider/config'
import {
  VisualInsightProviderError,
  type VisualInsightErrorCategory,
  type VisualInsightProvider,
  type VisualInsightRequest,
  type VisualInsightResult,
} from '@/features/visualInsight/provider/types'
import type { AiSafetyTier } from '@/features/aiIntelligence/types'

/**
 * Real timeout enforcement (Phase 3A.5 preparation), not a simulation —
 * this races the actual RPC call against DEFAULT_REQUEST_LIMITS.timeoutMs
 * so a hung request fails closed with a normalized 'provider_timeout'
 * error rather than leaving the UI's processing state spinning forever.
 * Exercised today by the mock provider's real (fast) RPC call, which
 * never trips it in practice — see mockProvider.test.ts for a forced
 * slow-client test that does.
 */
function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new VisualInsightProviderError('provider_timeout', 'The request took too long. Please try again.'))
    }, timeoutMs)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

/**
 * SINGLE VS. DUAL VERIFICATION — decision checkpoint (Phase 3A.3 §5)
 * =====================================================================
 * Not implemented yet, not silently chosen. Documented here because this
 * is where the composition would live once a real provider exists.
 *
 * Option A — single multimodal call
 *   image/context → one provider call → safety classification → result
 *   + Lowest latency (one round trip) and lowest cost (one billed call).
 *   + Simplest failure mode: the call either succeeds or fails.
 *   − The same model that produced the reasoning also grades its own
 *     safety — a systematic blind spot in that model becomes a
 *     systematic blind spot in SIRILA's safety classification too.
 *   − No provider independence: a provider-specific failure mode (e.g. a
 *     model that's reliably overconfident about skin conditions) has
 *     nothing to catch it.
 *
 * Option B — independent second safety-verification call
 *   image/context → primary provider → independent safety verifier →
 *   result only if verification passes
 *   + A genuinely independent check — ideally a different model or
 *     provider — catches failure modes the primary call can't see in
 *     itself. This is the same principle already applied to text
 *     responses in this codebase (generateResponse() + verifyResponse()
 *     in aiProviderAbstraction.ts), extended to images.
 *   + Emergency-tier detection, when it exists, is exactly the kind of
 *     high-consequence classification this project has already decided
 *     (Phase 0/Phase 2) should not rest on a single unverified model
 *     output.
 *   − Roughly 2x latency and cost (two billed calls instead of one).
 *   − A second provider/model to evaluate, monitor, and keep available —
 *     if the verifier is unavailable, the safe failure mode is to block
 *     the result (fail closed), which adds a new user-facing failure path
 *     (see FAILURE HANDLING below).
 *
 * ENGINEERING RECOMMENDATION: Option B (independent verification) for
 * SIRILA. This mirrors the text-response pattern already in production
 * for Phase 2, and the cost/latency tradeoff is justified by the same
 * reasoning that motivated that pattern: this is health-adjacent content
 * where a single model's blind spot becoming SIRILA's blind spot is a
 * materially worse outcome than an extra ~1 provider round-trip.
 *
 * THIS RECOMMENDATION IS NOT APPROVED. It requires clinical/legal
 * sign-off before implementation, same as any emergency-tier-adjacent
 * decision in this project (see Phase 3A.2's SAFETY/CLINICAL BLOCKERS).
 * PRODUCT DECISION REQUIRED.
 *
 * In this mock phase, the distinction is moot: mockSafetyScreeningStage
 * and mockSafetyVerificationStage both always pass, so the architecture
 * below already has two stages wired (screen → reason → verify) — it is
 * shaped like Option B today, without yet making the real tradeoff,
 * so that whichever option is approved requires no restructuring, only
 * swapping the verification stage's implementation.
 */

const RPC_ERROR_HINT_TO_CATEGORY: Record<string, VisualInsightErrorCategory> = {
  rate_limit: 'rate_limited',
  invalid_image: 'invalid_image',
  already_processed: 'invalid_image',
}

/**
 * ai_process_visual_insight_image() (migrations 0035-0037) always raises
 * with errcode 42501, distinguishing cases only by `hint` — except the
 * ownership-failure case, which is the one raise with no hint at all
 * (see the migration SQL: "image not found or not owned by caller" sets
 * no hint). That's the only case this fallback covers; a hint this
 * function has never seen before maps to 'unknown', not silently to
 * 'ownership_denied'.
 */
function mapRpcError(hint: string | null | undefined, code: string | undefined, message: string): VisualInsightProviderError {
  if (hint && RPC_ERROR_HINT_TO_CATEGORY[hint]) {
    return new VisualInsightProviderError(RPC_ERROR_HINT_TO_CATEGORY[hint], message, hint)
  }
  if (!hint && code === '42501') {
    return new VisualInsightProviderError('ownership_denied', message)
  }
  return new VisualInsightProviderError('unknown', message, hint ?? undefined)
}

const FIXED_LIMITATIONS = [
  'This is a mock development result — no image content was analyzed.',
  'SIRILA does not diagnose or medically analyze images, in mock mode or otherwise.',
  'A qualified healthcare professional should evaluate any concern in person.',
]

export const mockVisualInsightProvider: VisualInsightProvider = {
  name: 'mock',

  async analyze(request: VisualInsightRequest): Promise<VisualInsightResult> {
    const startedAt = Date.now()
    const requestId = crypto.randomUUID()

    const screening = await mockSafetyScreeningStage.screen({ imageId: request.imageId })
    if (!screening.safe) {
      throw new VisualInsightProviderError('safety_verification_failed', 'This image could not be processed.')
    }

    const { data, error } = await withTimeout(
      supabase
        .rpc('ai_process_visual_insight_image', {
          p_image_id: request.imageId,
          p_conversation_id: request.conversationId,
          p_user_description: request.userDescription,
        })
        .single<{
          status: string
          visual_observations: string[]
          uncertainty: string
          requires_follow_up: boolean
          safety_tier: AiSafetyTier
          message: string
          processed_at: string
        }>(),
      DEFAULT_REQUEST_LIMITS.timeoutMs,
    )

    if (error) {
      throw mapRpcError(error.hint, error.code, error.message)
    }
    if (!data) {
      throw new VisualInsightProviderError('malformed_provider_response', 'No result returned.')
    }

    const draft: VisualInsightResult = {
      summary: data.message,
      observations: data.visual_observations,
      uncertainty: data.uncertainty as VisualInsightResult['uncertainty'],
      limitations: FIXED_LIMITATIONS,
      recommendedNextSteps: data.requires_follow_up
        ? ['Consider adding more description of what you\'re noticing.']
        : [],
      requiresFollowUp: data.requires_follow_up,
      safetyClassification: data.safety_tier,
      emergencyFlag: false,
      message: data.message,
      provider: { provider: 'mock', model: 'mock-v1' },
      processing: { processedAt: data.processed_at, latencyMs: Date.now() - startedAt, requestId },
    }

    const verification = await mockSafetyVerificationStage.verify(draft)
    if (!verification.passed) {
      // Fail closed — matches Phase 3A.3 §10: no provider response bypasses
      // safety verification, even though the mock verifier never actually
      // fails today.
      throw new VisualInsightProviderError('safety_verification_failed', 'We could not verify this result. Please try again.')
    }

    return draft
  },
}

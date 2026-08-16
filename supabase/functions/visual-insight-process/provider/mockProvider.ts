import type {
  RpcCapableClient,
  VisualInsightRequest,
  VisualInsightResult,
  VisualInsightServerProvider,
} from './types.ts'
import { VisualInsightProviderError, type VisualInsightErrorCategory } from './types.ts'
import { DEFAULT_REQUEST_LIMITS } from './config.ts'

/**
 * Real timeout enforcement (Phase 3A.5 preparation) — races the actual
 * RPC call against DEFAULT_REQUEST_LIMITS.timeoutMs. See the frontend
 * mirror of this same helper in
 * src/features/visualInsight/provider/mockProvider.ts for the identical
 * rationale.
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
 * Server-side mock provider (Phase 3A.4). Requires no secret, makes no
 * external request — it calls the same, already live-verified
 * ai_process_visual_insight_image() RPC that the frontend's mock provider
 * (src/features/visualInsight/provider/mockProvider.ts) calls, via the
 * caller-scoped Supabase client passed in by index.ts. Ownership and rate
 * limiting are enforced inside that RPC, not duplicated here — same
 * "delegate to the RPC" principle documented in index.ts's PIPELINE SHAPE
 * comment.
 *
 * This is the DEFAULT provider (see config.ts) and the only one usable
 * without any configuration.
 */

const RPC_ERROR_HINT_TO_CATEGORY: Record<string, VisualInsightErrorCategory> = {
  rate_limit: 'rate_limited',
  invalid_image: 'invalid_image',
  already_processed: 'invalid_image',
}

interface RpcRow {
  status: string
  visual_observations: string[]
  uncertainty: string
  requires_follow_up: boolean
  safety_tier: string
  message: string
  processed_at: string
}

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

export const mockServerProvider: VisualInsightServerProvider = {
  name: 'mock',

  async analyze(request: VisualInsightRequest, client: RpcCapableClient): Promise<VisualInsightResult> {
    const startedAt = Date.now()
    const requestId = crypto.randomUUID()

    const { data, error } = await withTimeout(
      client
        .rpc('ai_process_visual_insight_image', {
          p_image_id: request.imageId,
          p_conversation_id: request.conversationId,
          p_user_description: request.userDescription,
        })
        .single<RpcRow>(),
      DEFAULT_REQUEST_LIMITS.timeoutMs,
    )

    if (error) {
      throw mapRpcError(error.hint, error.code, error.message)
    }
    if (!data) {
      throw new VisualInsightProviderError('malformed_provider_response', 'No result returned.')
    }

    return {
      summary: data.message,
      observations: data.visual_observations,
      uncertainty: data.uncertainty as VisualInsightResult['uncertainty'],
      limitations: FIXED_LIMITATIONS,
      recommendedNextSteps: data.requires_follow_up
        ? ["Consider adding more description of what you're noticing."]
        : [],
      requiresFollowUp: data.requires_follow_up,
      safetyClassification: data.safety_tier as VisualInsightResult['safetyClassification'],
      emergencyFlag: false,
      message: data.message,
      provider: { provider: 'mock', model: 'mock-v1' },
      processing: { processedAt: data.processed_at, latencyMs: Date.now() - startedAt, requestId },
    }
  },
}

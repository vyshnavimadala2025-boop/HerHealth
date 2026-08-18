import { VISUAL_INSIGHT_MAX_SIZE_BYTES } from '@/features/visualInsight/types'
import type { ProviderName, ProviderRequestLimits } from '@/features/visualInsight/provider/types'

/**
 * Provider routing (Phase 3A.3 §8). Hardcoded, not environment-driven —
 * the frontend must never be the thing deciding which real provider is
 * active, since that decision belongs next to the secret that authorizes
 * it, and secrets never reach the frontend (see SECRET MANAGEMENT below).
 * Changing this constant is the only way to change providers, and today
 * it is only ever 'mock'.
 */
export const ACTIVE_PROVIDER: ProviderName = 'mock'

/**
 * PROVIDER TARGET NOTE: 'xai' (see supabase/functions/visual-insight-process/provider/grokAdapter.ts)
 * is the current primary real-provider target, changed from an earlier
 * 'openai' target. Both adapters exist server-side; neither is enabled.
 * This constant governs the frontend's own provider selection
 * separately (see index.ts) and remains 'mock' regardless of which real
 * provider is targeted, since no real provider is authorized yet.
 */

/**
 * EMERGENCY KILL SWITCH (Phase — Observability & Rollback Readiness).
 * Independent of ACTIVE_PROVIDER: this disables Visual Insight
 * processing entirely — mock or real, whichever ACTIVE_PROVIDER would
 * otherwise select — with a single flip. This is the fastest rollback
 * lever in the codebase: no provider-selection reasoning needed, no
 * secret rotation needed, just "is processing allowed right now at
 * all." See ROLLBACK_RUNBOOK.md (supabase/functions/visual-insight-process/)
 * for when to use this versus reverting ACTIVE_PROVIDER to 'mock'
 * (reverting to mock is a downgrade; this is a full stop).
 *
 * getVisualInsightProvider() (./index.ts) checks this FIRST, before any
 * provider-name logic — so flipping this to false is sufficient on its
 * own, deploying is the only step, no other file needs to change.
 *
 * LAUNCH SCOPE: false — Visual Insight is disabled for the initial
 * launch (post-launch feature). See FEATURE_VISUAL_INSIGHT in
 * src/features/aiIntelligence/constants.ts, which gates the UI route;
 * this switch independently gates processing itself even if that route
 * guard were ever bypassed.
 */
export const VISUAL_INSIGHT_PROCESSING_ENABLED = false as const

/**
 * Per-request operational limits (Phase 3A.3 §11). These are architecture
 * placeholders for a future real provider call, not currently enforced
 * anywhere beyond maxImageSizeBytes (which already matches the existing,
 * live-verified Storage bucket / CHECK-constraint limit from migration
 * 0034). timeoutMs/maxRetries have no effect today because the mock
 * provider is a single fast Postgres round trip with nothing to time out.
 *
 * PRODUCT DECISION REQUIRED: none of these numbers (nor the existing
 * visual_insight_daily_processing_limit / visual_insight_daily_image_limit
 * = 5/day, unchanged by this phase) have been reviewed against real
 * provider pricing or expected usage. Do not treat them as approved
 * production values.
 */
export const DEFAULT_REQUEST_LIMITS: ProviderRequestLimits = {
  timeoutMs: 30_000,
  maxImageSizeBytes: VISUAL_INSIGHT_MAX_SIZE_BYTES,
  maxRequestSizeBytes: VISUAL_INSIGHT_MAX_SIZE_BYTES + 64 * 1024, // image + small JSON envelope
  maxRetries: 0,
}

/**
 * SECRET MANAGEMENT (Phase 3A.3 §7) — documentation only, nothing below
 * this comment reads any of these values. No .env file in this repo
 * defines them, and none should until a real provider is actually
 * connected (a decision this phase does not make).
 *
 * Intended flow once a real provider exists:
 *   Supabase Edge Function (Deno runtime, NOT this frontend)
 *     reads → Deno.env.get('VISUAL_INSIGHT_PROVIDER')          e.g. "xai" (current target; was "openai")
 *             Deno.env.get('VISUAL_INSIGHT_PROVIDER_API_KEY')  never logged, never returned to client
 *             Deno.env.get('VISUAL_INSIGHT_PROVIDER_TIMEOUT_MS')
 *     → calls the provider SDK server-side
 *     → returns only the normalized VisualInsightResult to the browser
 *
 * Those secrets would be set via `supabase secrets set`, the same
 * mechanism already documented (unused) in
 * supabase/functions/visual-insight-process/index.ts — never committed
 * to this repository, never present in any frontend bundle.
 */
export const REQUIRED_FUTURE_EDGE_FUNCTION_ENV_VARS = [
  'VISUAL_INSIGHT_PROVIDER',
  'VISUAL_INSIGHT_PROVIDER_API_KEY',
  'VISUAL_INSIGHT_PROVIDER_TIMEOUT_MS',
] as const

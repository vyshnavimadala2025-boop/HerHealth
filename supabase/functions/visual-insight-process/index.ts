// SIRILA Visual Insight — trusted server boundary, MOCK PROCESSING ONLY
// (created Phase 3A.2, pipeline shape documented Phase 3A.3, routed
// through a real provider-abstraction factory Phase 3A.4 — still no
// provider connected in any of those phases)
//
// This function does NOT call any AI provider, does NOT read or analyze
// image content, and does NOT return anything resembling a diagnostic or
// medical assessment. It calls getServerVisualInsightProvider()
// (./provider/index.ts), which today always returns the mock provider
// (./provider/mockProvider.ts) — a thin, authenticated wrapper around
// public.ai_process_visual_insight_image() (migration 0035/0036/0037),
// which is itself the real, live-testable enforcement point for
// ownership and rate limiting. This function adds no additional trust
// boundary beyond what that RPC already provides; the provider/
// subdirectory exists so a future real provider call has somewhere
// typed, tested, and reviewable to live that isn't the browser — see
// ./provider/openaiAdapter.ts, whose analyze() throws unconditionally
// and contains no network call in this phase.
//
// PIPELINE SHAPE (Phase 3A.3 §1) — the intended full shape once a real
// provider exists, mapped against what this function does TODAY:
//
//   1. authenticated request         → IMPLEMENTED BELOW (auth.getUser())
//   2. consent verification          → NOT POSSIBLE HERE, see CONSENT NOTE
//   3. ownership verification        → DELEGATED to the RPC (SECURITY DEFINER)
//   4. rate-limit verification       → DELEGATED to the RPC
//   5. input validation              → DELEGATED to the RPC (image eligibility)
//   6. safety preprocessing          → MOCK today, see
//                                       src/features/visualInsight/provider/mockSafetyStages.ts
//                                       (SafetyScreeningStage) — a real
//                                       implementation would run this
//                                       HERE, before step 7, against the
//                                       stored image's actual bytes
//   7. provider abstraction/call     → MOCK today — the RPC returns a
//                                       fixed payload instead of calling
//                                       VisualInsightProvider.analyze()
//                                       (src/features/visualInsight/provider/types.ts).
//                                       A real implementation replaces
//                                       this one RPC call with: fetch the
//                                       image from Storage → construct a
//                                       VisualInsightRequest → call
//                                       getVisualInsightProvider().analyze()
//   8. independent safety verification → MOCK today, see
//                                       mockSafetyStages.ts
//                                       (SafetyVerificationStage) — see
//                                       Phase 3A.3 §5 for the single-vs-
//                                       dual-verification decision
//                                       (NOT YET APPROVED, PRODUCT
//                                       DECISION REQUIRED)
//   9. normalized result              → the RPC's fixed mock shape today;
//                                       would become VisualInsightResult
//   10. persistence                   → DELEGATED to the RPC (UPDATE ...
//                                       processing_status/processed_at)
//   11. response                      → IMPLEMENTED BELOW (jsonResponse)
//
// Deployment (not done by this migration/commit — requires the Supabase
// CLI, which this assistant does not have access to in this environment):
//   supabase functions deploy visual-insight-process
//
// Provider API keys, when a provider is eventually selected, belong in
// this function's environment (Supabase Edge Function secrets,
// `supabase secrets set`) — NEVER in frontend code, NEVER committed to
// this repository. Nothing here reads or references any such secret yet.
// See src/features/visualInsight/provider/config.ts for the documented
// (unused) list of env var names this function would read once a real
// provider exists.
//
// CONSENT NOTE: Category D (image analysis) consent, like every other
// SIRILA Intelligence consent category, is stored client-side
// (localStorage) and enforced in the UI before this function is ever
// called (see useVisualInsightProcessing.ts) — this function has no way
// to independently verify it, the same accepted, documented limitation
// that applies to Category A/B/C consent throughout this project. It is
// not silently assumed to be enforced here.
//
// What this function deliberately does NOT do:
//   - Call OpenAI, Anthropic, Google, or any other AI provider
//   - Read the image's actual pixel content
//   - Return any diagnostic, medical, or emergency-related language
//   - Perform real moderation, safety classification, or red-flag
//     detection (all explicitly deferred to Phase 3A.4+)
//   - Verify consent (client-side only, see note above)

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { getServerVisualInsightProvider, VisualInsightProviderError } from './provider/index.ts'
import { logTelemetryEvent, toHttpStatusCategory, toOperationalCategory } from './provider/telemetry.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

interface ProcessRequest {
  imageId?: string
  conversationId?: string | null
  userDescription?: string | null
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method not allowed' }, 405)
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Fails closed — matches the platform-wide rule that a broken/missing
    // safety-relevant dependency must never silently degrade to an
    // unverified response.
    return jsonResponse({ error: 'server misconfigured' }, 500)
  }

  const requestId = crypto.randomUUID()
  const requestStartedAt = Date.now()

  function logAndRespond(status: number, body: unknown, event: {
    provider: 'mock' | 'openai' | 'none'
    model?: string
    latencyMs?: number
    outcome: 'success' | 'error'
    errorCategory?: ReturnType<typeof toOperationalCategory>
    safetyVerificationStatus?: 'passed' | 'failed' | 'not_run'
  }): Response {
    logTelemetryEvent({
      requestId,
      timestamp: new Date().toISOString(),
      operation: 'analyze',
      httpStatusCategory: toHttpStatusCategory(status),
      ...event,
    })
    return jsonResponse(body, status)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return logAndRespond(401, { error: 'authentication required' }, {
      provider: 'none',
      outcome: 'error',
      errorCategory: 'AUTH_FAILURE',
    })
  }

  // Scoped to the calling user's own JWT — this client can only ever act
  // as that user, subject to the exact same RLS/RPC grants as a direct
  // client call. No service-role key is used or referenced anywhere in
  // this function.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return logAndRespond(401, { error: 'authentication required' }, {
      provider: 'none',
      outcome: 'error',
      errorCategory: 'AUTH_FAILURE',
    })
  }

  let body: ProcessRequest
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'invalid request body' }, 400)
  }

  if (!body.imageId || typeof body.imageId !== 'string') {
    return jsonResponse({ error: 'imageId is required' }, 400)
  }

  // Ownership, image-eligibility, conversation-ownership, and rate-limit
  // checks all happen inside ai_process_visual_insight_image(), as
  // SECURITY DEFINER, exactly as they would if the frontend called it
  // directly — the mock provider below (see provider/mockProvider.ts)
  // adds no additional authorization logic of its own, it only forwards
  // to that RPC. getServerVisualInsightProvider() always returns the
  // mock provider today (provider/config.ts: ACTIVE_PROVIDER = 'mock',
  // OPENAI_ENABLED = false, VISUAL_INSIGHT_PROCESSING_ENABLED = true) —
  // this is the provider-abstraction seam a real implementation would
  // use, not yet a real implementation. Moved inside the try block below
  // (unlike earlier phases) so the kill switch's throw — when
  // VISUAL_INSIGHT_PROCESSING_ENABLED is flipped false — is caught,
  // logged, and answered with a clean response instead of an unhandled
  // exception.
  try {
    const provider = getServerVisualInsightProvider()

    const result = await provider.analyze(
      {
        imageId: body.imageId,
        conversationId: body.conversationId ?? null,
        userDescription: body.userDescription ?? null,
      },
      supabase,
    )

    return logAndRespond(200, result, {
      provider: result.provider.provider,
      model: result.provider.model,
      latencyMs: result.processing.latencyMs,
      outcome: 'success',
      safetyVerificationStatus: 'passed',
    })
  } catch (err) {
    if (err instanceof VisualInsightProviderError) {
      const operationalCategory = toOperationalCategory(err.category)
      const commonEvent = {
        provider: 'mock' as const,
        latencyMs: Date.now() - requestStartedAt,
        outcome: 'error' as const,
        errorCategory: operationalCategory,
        safetyVerificationStatus: err.category === 'safety_verification_failed' ? ('failed' as const) : undefined,
      }

      if (err.providerDetail === 'already_processed') {
        return logAndRespond(400, { error: 'image has already been processed' }, commonEvent)
      }
      if (err.category === 'rate_limited') {
        return logAndRespond(429, { error: 'daily processing limit reached' }, commonEvent)
      }
      if (err.category === 'invalid_image') {
        return logAndRespond(400, { error: 'image is not ready to be processed' }, commonEvent)
      }
      if (err.category === 'provider_unavailable') {
        return logAndRespond(503, { error: 'Visual Insight is temporarily unavailable' }, commonEvent)
      }
      // Ownership failures and anything else — never echo the raw
      // provider/Postgres error text to the client, matching this
      // project's established rule.
      return logAndRespond(403, { error: 'unable to process this image' }, commonEvent)
    }

    return logAndRespond(500, { error: 'unable to process this image' }, {
      provider: 'none',
      latencyMs: Date.now() - requestStartedAt,
      outcome: 'error',
      errorCategory: 'INTERNAL_ERROR',
    })
  }
})

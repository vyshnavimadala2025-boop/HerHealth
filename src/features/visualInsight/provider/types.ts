import type { AiSafetyTier } from '@/features/aiIntelligence/types'

/**
 * SIRILA Visual Insight — provider-neutral architecture (Phase 3A.3).
 *
 * Nothing in this file calls, imports, or references any real AI vendor
 * SDK. It exists so the rest of the application (the processing hook, the
 * future Edge Function, safety-event logging) can depend on a stable,
 * vendor-agnostic shape today, with a real provider substituted later
 * without touching any calling code — the same pattern already used for
 * text capabilities in aiProviderAbstraction.ts, refined here specifically
 * for multimodal (image) input.
 *
 * WHERE THIS RUNS TODAY VS. IN THE FUTURE:
 * Today (mock-only), the "provider" is a thin wrapper around the already
 * live-verified ai_process_visual_insight_image() RPC, called directly
 * from the browser — safe only because it never reads image content or
 * calls anything external. Once a real provider is connected, this exact
 * interface is what the trusted server boundary (a Supabase Edge Function
 * — see supabase/functions/visual-insight-process/index.ts) implements
 * instead; the browser would then call that Edge Function, never a
 * provider SDK directly, and the provider API key would live only in that
 * function's server-side environment. Nothing about this file changes
 * when that happens — only which side of the network boundary implements
 * VisualInsightProvider.
 */

// ---------------------------------------------------------------------------
// Request contract — privacy / data-minimization boundary (Phase 3A.3 §6)
// ---------------------------------------------------------------------------

/**
 * The complete set of information a future multimodal provider call is
 * permitted to receive. This is a closed contract, not an extensible bag —
 * adding a field here is a deliberate decision, not an accident of some
 * caller passing extra data through.
 *
 * MAY be included (all already ownership/consent-checked before this type
 * is ever constructed):
 *   - the single image being analyzed (via imageId → resolved server-side)
 *   - the user's own free-text description of what they're noticing
 *   - the conversation this request is attached to, IF the caller supplied
 *     one AND that conversation is verified-owned by the caller (existing
 *     ai_process_visual_insight_image() behavior, unchanged)
 *
 * MUST NOT be included, ever, regardless of caller convenience:
 *   - the user's full profile
 *   - other conversations or messages
 *   - symptom journal / cycle-tracking / wellness data not explicitly
 *     attached to this request
 *   - ai_memory contents
 *   - any other user's data
 *   - authentication secrets, service-role credentials, or internal
 *     database identifiers beyond the image/conversation IDs needed to
 *     fetch the one permitted image
 *
 * A future provider integration that wants to include more context (e.g.
 * "recent symptom history") must extend this type explicitly and update
 * this comment — not smuggle it in via a generic metadata field.
 */
export interface VisualInsightRequest {
  imageId: string
  conversationId: string | null
  userDescription: string | null
}

// ---------------------------------------------------------------------------
// Normalized response contract (Phase 3A.3 §3)
// ---------------------------------------------------------------------------

/**
 * SIRILA never represents visual output as a confirmed diagnosis. This
 * contract enforces that distinction structurally, not just by convention:
 * there is no field anywhere in this type that could hold a diagnostic
 * claim, and `possibleConcern`/`emergencyFlag` are explicitly named to
 * signal "possible", never "confirmed".
 *
 *   OBSERVATION      → `observations` — what is visually present, described
 *                       neutrally (e.g. "reported redness"), never an
 *                       assessment of what it means medically.
 *   DIAGNOSIS        → does not exist as a concept in this contract. There
 *                       is no field named `diagnosis`, `condition`, or
 *                       similar, by design.
 *   POSSIBLE CONCERN → `safetyClassification` / `emergencyFlag` — a
 *                       routing signal for how urgently a human should be
 *                       involved, never a clinical claim about what is
 *                       wrong.
 *   CONFIRMED CONDITION → does not exist as a concept in this contract,
 *                       for the same reason as DIAGNOSIS above.
 */
export interface VisualInsightResult {
  /** One-sentence, neutral summary. Never a diagnostic statement. */
  summary: string
  /** Neutral, descriptive observations only — never an assessment of cause or severity. */
  observations: string[]
  /** How confident the (mock or future real) analysis is in its own observations. */
  uncertainty: 'high' | 'moderate' | 'low'
  /** Fixed, always-shown limitations of what this feature can and cannot do. */
  limitations: string[]
  /** Non-prescriptive suggestions (e.g. "consider tracking this over time"), never treatment instructions. */
  recommendedNextSteps: string[]
  /** Whether the analysis suggests a follow-up question would help — mirrors the existing requiresFollowUp field. */
  requiresFollowUp: boolean
  /** Routing signal only — see AiSafetyTier. Never a medical claim. */
  safetyClassification: AiSafetyTier
  /**
   * True only when the safety pipeline's independent verification stage
   * (see SafetyVerificationStage below) flags the input as needing urgent
   * human attention. Always false in this mock-only phase — the mock
   * safety stages never raise it, by design (Phase 3A.0 Section 15: no
   * emergency-tier wording is created or approved in this phase).
   */
  emergencyFlag: boolean
  /** Fixed, neutral message shown alongside the result — matches the Edge Function's mock message today. */
  message: string
  provider: ProviderMetadata
  processing: ProcessingMetadata
}

export interface ProviderMetadata {
  /** 'mock' is the only value ever produced by this phase. */
  provider: ProviderName
  /** Model identifier, when the provider is real. Always 'mock-v1' today. */
  model: string
}

export interface ProcessingMetadata {
  processedAt: string
  /** Wall-clock time for the provider call itself, in milliseconds. */
  latencyMs: number
  /**
   * Generated fresh per request (Phase 3A.4 §3/§9) — safe to log alongside
   * provider/model/latency/error-category for observability, since it
   * carries no user identity or image content on its own. Not a database
   * primary key of any kind.
   */
  requestId: string
  /** Present only when a real provider reports it — always undefined in mock mode. */
  tokenUsage?: { promptTokens: number; completionTokens: number }
  /** Present only when a real provider's pricing is known — always undefined in mock mode. */
  estimatedCostUsd?: number
}

// ---------------------------------------------------------------------------
// Provider identity & configuration (Phase 3A.3 §8, §11)
// ---------------------------------------------------------------------------

export type ProviderName = 'mock' | 'openai' | 'anthropic' | 'google' | 'xai'

/**
 * Per-request operational limits a provider call must respect. These are
 * the future Edge Function's config, not the frontend's — the frontend
 * never sees or sets these; they exist here so the shape is defined before
 * a real provider needs it. Numeric values here are architecture
 * placeholders only, not approved production limits — see
 * PRODUCT DECISION REQUIRED note in providerConfig.ts.
 */
export interface ProviderRequestLimits {
  timeoutMs: number
  maxImageSizeBytes: number
  maxRequestSizeBytes: number
  maxRetries: number
}

// ---------------------------------------------------------------------------
// Errors (Phase 3A.3 §10)
// ---------------------------------------------------------------------------

export type VisualInsightErrorCategory =
  | 'consent_missing'
  | 'consent_withdrawn'
  | 'ownership_denied'
  | 'rate_limited'
  | 'invalid_image'
  | 'unsupported_format'
  | 'oversized_image'
  | 'provider_timeout'
  | 'provider_unavailable'
  | 'malformed_provider_response'
  | 'safety_verification_failed'
  | 'network_failure'
  | 'unknown'

/**
 * The only error shape any caller (UI, Edge Function) should handle.
 * `category` drives user-facing messaging; `providerDetail` exists for
 * server-side logging only and must never be forwarded to the browser
 * verbatim (matches this project's existing "never echo the raw Postgres
 * error text to the client" rule in visual-insight-process/index.ts).
 */
export class VisualInsightProviderError extends Error {
  category: VisualInsightErrorCategory
  providerDetail?: string

  constructor(category: VisualInsightErrorCategory, message: string, providerDetail?: string) {
    super(message)
    this.name = 'VisualInsightProviderError'
    this.category = category
    this.providerDetail = providerDetail
  }
}

// ---------------------------------------------------------------------------
// Safety pipeline stages (Phase 3A.3 §4)
// ---------------------------------------------------------------------------
//
//   INPUT
//     → safety screening        (SafetyScreeningStage)
//     → multimodal reasoning    (the provider's own analyze() call)
//     → independent safety verification (SafetyVerificationStage)
//     → response filtering      (applied by the provider before returning)
//     → user response
//
// Both stages below are MOCK in this phase: safety screening always
// reports "safe", verification always passes. No emergency-tier wording is
// created or approved by either mock implementation — see
// mockSafetyStages.ts. A real implementation swaps the function bodies
// only; the stage boundary itself does not change.

export interface SafetyScreeningStage {
  screen(input: { imageId: string }): Promise<{ safe: boolean; category?: string }>
}

export interface SafetyVerificationStage {
  verify(result: VisualInsightResult): Promise<{ passed: boolean; reason?: string }>
}

// ---------------------------------------------------------------------------
// The provider interface itself
// ---------------------------------------------------------------------------

export interface VisualInsightProvider {
  readonly name: ProviderName
  analyze(request: VisualInsightRequest): Promise<VisualInsightResult>
}

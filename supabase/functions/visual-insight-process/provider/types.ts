/**
 * SIRILA Visual Insight — server-side provider architecture (Phase 3A.4
 * §"Create the minimum Deno-compatible provider architecture").
 *
 * This is the trusted-server-boundary counterpart to the frontend's
 * src/features/visualInsight/provider/types.ts (Phase 3A.3). The two are
 * NOT the same module — Deno Edge Functions and the Vite/Node frontend
 * are different runtimes with no shared build step in this project, so
 * this file is a hand-kept mirror of the frontend contract's shape, not
 * an import of it. Keep them in sync by hand when either changes; each
 * file's header points at the other.
 *
 * DEPENDENCY-FREE BY DESIGN: nothing in this provider/ directory imports
 * `jsr:@supabase/supabase-js@2`, `Deno.*`, or anything else that only
 * exists in the Edge Function runtime. That is what makes every file in
 * this directory importable and unit-testable directly by this project's
 * existing Vitest setup (see provider/*.test.ts) rather than requiring a
 * Deno test harness this project doesn't have. The one place that needs
 * to call `supabase.rpc(...)` (mockProvider.ts) accepts a minimal
 * structurally-typed client (RpcCapableClient below) instead of importing
 * the real SDK's types — the real Supabase client satisfies that shape
 * naturally, so index.ts can pass it through unchanged.
 */

// ---------------------------------------------------------------------------
// Request / response contract — mirrors frontend provider/types.ts
// ---------------------------------------------------------------------------

export interface VisualInsightRequest {
  imageId: string
  conversationId: string | null
  userDescription: string | null
}

export type ProviderName = 'mock' | 'openai' | 'xai'

export interface ProviderMetadata {
  provider: ProviderName
  model: string
}

export interface ProcessingMetadata {
  processedAt: string
  latencyMs: number
  /** Generated fresh per request — safe to log, carries no identity or image content on its own. */
  requestId: string
  tokenUsage?: { promptTokens: number; completionTokens: number }
  estimatedCostUsd?: number
}

export type SafetyTier = 'routine' | 'urgent' | 'emergency' | 'sensitive'

/**
 * No field here can hold a diagnostic claim — same structural guarantee
 * as the frontend contract. `emergencyFlag` is a routing signal only,
 * never a clinical statement, and is never set true by any mock stage in
 * this phase (see mockProvider.ts).
 */
export interface VisualInsightResult {
  summary: string
  observations: string[]
  uncertainty: 'high' | 'moderate' | 'low'
  limitations: string[]
  recommendedNextSteps: string[]
  requiresFollowUp: boolean
  safetyClassification: SafetyTier
  emergencyFlag: boolean
  message: string
  provider: ProviderMetadata
  processing: ProcessingMetadata
}

// ---------------------------------------------------------------------------
// Errors
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
// Minimal structural client type — see header. Only the shape mockProvider.ts
// actually calls (`rpc(name, args).single()`) is declared.
// ---------------------------------------------------------------------------

export interface RpcResult<T> {
  data: T | null
  error: { code?: string; hint?: string | null; message: string } | null
}

export interface RpcCapableClient {
  rpc(fn: string, args: Record<string, unknown>): { single<T>(): PromiseLike<RpcResult<T>> }
}

// ---------------------------------------------------------------------------
// The provider interface itself
// ---------------------------------------------------------------------------

export interface VisualInsightServerProvider {
  readonly name: ProviderName
  analyze(request: VisualInsightRequest, client: RpcCapableClient): Promise<VisualInsightResult>
}

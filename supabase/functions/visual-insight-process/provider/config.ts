import type { ProviderName } from './types.ts'

/**
 * Provider routing (Phase 3A.4, provider target changed from OpenAI to
 * xAI/Grok in a later round). Hardcoded, not environment-driven — same
 * rule as the frontend's identical config file
 * (src/features/visualInsight/provider/config.ts): the decision to
 * activate a real provider must be a reviewed source change, deployed
 * deliberately, never a runtime-flippable environment variable. An
 * XAI_API_KEY or OPENAI_API_KEY existing in this function's environment
 * is NOT, by itself, sufficient to activate either provider — see
 * XAI_ENABLED/OPENAI_ENABLED below, which gate on this constant, not on
 * secret presence.
 *
 * xAI/Grok is the current primary target (see grokAdapter.ts). The
 * OpenAI adapter (openaiAdapter.ts) remains in this directory,
 * unremoved — the provider abstraction stays multi-adapter-capable
 * rather than assuming any one vendor is permanent.
 */
export const ACTIVE_PROVIDER: ProviderName = 'mock'

/**
 * Separate from ACTIVE_PROVIDER on purpose: even if ACTIVE_PROVIDER were
 * edited to 'openai' by mistake, OPENAI_ENABLED being false is a second,
 * independent gate the factory (index.ts) checks before ever returning
 * the OpenAI adapter. Both must be changed, deliberately, for a real
 * provider to become reachable. Today, and until every outstanding
 * legal/clinical/product gate is cleared, this is false.
 */
export const OPENAI_ENABLED = false as const

/**
 * Same independent-gate pattern as OPENAI_ENABLED above, for the xAI/Grok
 * adapter (grokAdapter.ts). Today, and until every outstanding
 * legal/clinical/product gate is cleared for xAI specifically, this is
 * false.
 */
export const XAI_ENABLED = false as const

/**
 * EMERGENCY KILL SWITCH (Observability & Rollback Readiness phase).
 * Independent of ACTIVE_PROVIDER/OPENAI_ENABLED: disables Visual Insight
 * processing entirely — mock or (hypothetically) real — with a single
 * flip. getServerVisualInsightProvider() (./index.ts) checks this FIRST.
 * This is the fastest rollback lever for this function: flip to false,
 * deploy, done — see ../ROLLBACK_RUNBOOK.md for when to use this versus
 * reverting ACTIVE_PROVIDER to 'mock' (that's a downgrade; this is a
 * full stop).
 *
 * LAUNCH SCOPE: false — Visual Insight is disabled for the initial
 * launch (post-launch feature). Mirrors the frontend kill switch
 * (src/features/visualInsight/provider/config.ts).
 */
export const VISUAL_INSIGHT_PROCESSING_ENABLED = false as const

/**
 * Documented, never read here, never set here. Would be read via
 * Deno.env.get('OPENAI_API_KEY') only inside a real, enabled adapter —
 * which does not exist in this phase (see openaiAdapter.ts, whose
 * analyze() throws unconditionally and never touches Deno.env at all).
 * Set via `supabase secrets set OPENAI_API_KEY=...` on the real project,
 * never committed to this repository, never present in any
 * frontend-reachable (VITE_-prefixed) variable, never logged.
 */
export const REQUIRED_OPENAI_ENV_VARS = ['OPENAI_API_KEY'] as const

/**
 * Documented, never read here, never set here. Would be read via
 * Deno.env.get('XAI_API_KEY') only inside a real, enabled adapter —
 * which does not exist in this phase (see grokAdapter.ts, whose
 * analyze() throws unconditionally and never touches Deno.env at all).
 * Set via `supabase secrets set XAI_API_KEY=...` on the real project,
 * never committed to this repository, never present in any
 * frontend-reachable (VITE_-prefixed) variable, never logged. Not
 * requested from or configured by anyone in this session — see the xAI
 * provider-switch task's explicit boundary.
 */
export const REQUIRED_XAI_ENV_VARS = ['XAI_API_KEY'] as const

/**
 * Mirrors the frontend's DEFAULT_REQUEST_LIMITS
 * (src/features/visualInsight/provider/config.ts) — architecture
 * placeholder values, not reviewed production limits. timeoutMs is
 * actually enforced today (see mockProvider.ts's withTimeout), even
 * though the mock RPC call never comes close to tripping it.
 */
export const DEFAULT_REQUEST_LIMITS = {
  timeoutMs: 30_000,
  maxImageSizeBytes: 10 * 1024 * 1024,
  maxRequestSizeBytes: 10 * 1024 * 1024 + 64 * 1024,
  maxRetries: 0,
} as const

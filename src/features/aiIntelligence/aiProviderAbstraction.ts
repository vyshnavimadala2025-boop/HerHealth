import type { AiCapability, AiContextSnapshot, AiSafetyTier } from '@/features/aiIntelligence/types'
import { classifySafetyTierClientSide } from '@/features/aiIntelligence/redFlagScreen'

/**
 * SIRILA Intelligence — AI provider abstraction (Phase 0 Section 9 / Phase
 * 2 Section 11).
 *
 * No AI provider has been selected yet — this is a deliberate, still-open
 * decision (see PHASE 0 DELIVERY SPECIFICATION and the Phase 1 approved
 * decisions: "AI provider: NOT SELECTED. Keep the provider abstract.").
 * Everything in this file exists so the rest of the application (UI,
 * database writes, safety-event logging) can be built and tested against a
 * stable interface today, with the real implementation swapped in later
 * without touching any calling code.
 *
 * PROVIDER EVALUATION CRITERIA (to be completed before a production
 * provider is selected — not evaluated here, this is the checklist only):
 *   - Quality: multimodal reasoning quality, wellness/health-domain
 *     behavior, refusal/caution behavior on medical-sounding claims.
 *   - Latency: time-to-first-token and full-response latency from India,
 *     since that's this platform's primary market.
 *   - Cost: per-request cost at expected message volume, given the
 *     multi-tier routing this architecture assumes (Phase 0 Section 15).
 *   - Privacy/data handling: explicit no-training-on-API-data commitment
 *     required, non-negotiable given the content involved (Phase 0
 *     Section 5).
 *   - Multimodal capability: not required for Phase 2 (text-only MVP,
 *     image analysis explicitly deferred), but relevant for the V1.1
 *     Visual Insight phase.
 *   - Rate limits: provider-side rate limits must accommodate this
 *     application's own per-user limits (Section 12) without the provider
 *     becoming the bottleneck.
 *
 * REAL INTEGRATION WILL REQUIRE NEW INFRASTRUCTURE: this project has no
 * server-side function today (frontend + Supabase Postgres/RLS/RPC only).
 * A real provider call cannot happen from the browser (no API key in
 * frontend code, ever) and cannot happen from a plain Postgres RPC either
 * (no outbound HTTP to a third-party API from plpgsql in this project's
 * setup) — it will need a Supabase Edge Function holding the provider key
 * as a server-side secret. That Edge Function would then likely call
 * ai_send_message() (or a variant of it) itself, authenticated as the
 * calling user, rather than the browser calling it directly as it does in
 * this mock phase.
 */

export interface SafetyScreenInput {
  rawUserInput: string
}

export interface SafetyScreenResult {
  tier: AiSafetyTier
}

export interface RetrieveContextInput {
  permittedCategories: string[]
  currentTopic: string
}

export interface GenerateResponseInput {
  capability: AiCapability
  userContent: string
  safetyTier: AiSafetyTier
  context: AiContextSnapshot | null
}

export interface GenerateResponseResult {
  content: string
  modelUsed: string
}

export interface VerifyResponseInput {
  draftContent: string
}

export interface VerifyResponseResult {
  passed: boolean
  violatedRules: string[]
}

export interface AiProvider {
  safetyScreen(input: SafetyScreenInput): Promise<SafetyScreenResult>
  retrieveContext(input: RetrieveContextInput): Promise<AiContextSnapshot | null>
  generateResponse(input: GenerateResponseInput): Promise<GenerateResponseResult>
  verifyResponse(input: VerifyResponseInput): Promise<VerifyResponseResult>
}

/** Response-format prohibited phrases (Phase 0 Section 4 / Section 8) — a coarse, mock-grade check. */
const PROHIBITED_PATTERNS = [
  /you have\s+\w+/i,
  /this is definitely/i,
  /i diagnose/i,
  /take \d+\s*mg/i,
  /nothing to worry about/i,
]

function buildAskSirilaReply(userContent: string, tier: AiSafetyTier): string {
  const lead =
    tier === 'sensitive'
      ? 'Thank you for sharing something this personal — that took courage.'
      : `What I notice: you mentioned "${userContent.slice(0, 120)}${userContent.length > 120 ? '…' : ''}."`

  return [
    lead,
    '',
    'Possible explanations (not a diagnosis): there are a few general wellness factors that can relate to what you’re describing — this is a placeholder mock response, not a real generated analysis, so treat this section as a structural example only.',
    '',
    'Questions worth answering: when did this start, and has anything changed recently in your sleep, stress, or routine?',
    '',
    'What you could consider: rest, hydration, and tracking this over the next few days can help build a clearer picture.',
    '',
    tier === 'urgent'
      ? 'When to seek care: please consider checking in with a healthcare professional soon.'
      : 'When to seek care: if this persists, worsens, or concerns you, a healthcare professional can help you understand it more precisely than SIRILA can.',
    '',
    'Sources: SIRILA Intelligence is running in mock mode for Phase 2 — no real knowledge base is connected yet, so no sources are cited in this response.',
  ].join('\n')
}

function buildSymptomInsightReply(userContent: string, tier: AiSafetyTier): string {
  return [
    `Let's understand what you're noticing: "${userContent.slice(0, 120)}${userContent.length > 120 ? '…' : ''}."`,
    '',
    'This is a mock response (Phase 2 has no real AI provider connected yet) standing in for what SIRILA Intelligence would eventually help you organize — when it started, how it feels, and what, if anything, seems to affect it.',
    '',
    tier === 'urgent'
      ? 'Given what you described, it may be worth checking in with a healthcare professional sooner rather than later.'
      : 'Would you like to save this to your symptom journal so you can track it over time?',
  ].join('\n')
}

/**
 * The mock provider. Deterministic, zero cost, zero external calls —
 * satisfies the AiProvider interface so every other layer (UI, RLS,
 * safety-event logging, rate limiting) can be built and tested against a
 * real shape today. See file header for what changes when a real provider
 * is selected.
 */
export const mockAiProvider: AiProvider = {
  async safetyScreen({ rawUserInput }) {
    await new Promise((resolve) => setTimeout(resolve, 120))
    return { tier: classifySafetyTierClientSide(rawUserInput) }
  },

  async retrieveContext({ permittedCategories, currentTopic }) {
    if (permittedCategories.length === 0) return null
    return {
      categories: permittedCategories,
      summary: `(mock) would retrieve recent ${permittedCategories.join(', ')} data relevant to "${currentTopic}"`,
    }
  },

  async generateResponse({ capability, userContent, safetyTier }) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const content =
      capability === 'symptom_insight'
        ? buildSymptomInsightReply(userContent, safetyTier)
        : buildAskSirilaReply(userContent, safetyTier)
    return { content, modelUsed: 'mock-v1' }
  },

  async verifyResponse({ draftContent }) {
    const violatedRules = PROHIBITED_PATTERNS.filter((pattern) => pattern.test(draftContent)).map(
      (pattern) => pattern.source,
    )
    return { passed: violatedRules.length === 0, violatedRules }
  },
}

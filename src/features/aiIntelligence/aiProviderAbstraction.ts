import { supabase } from '@/lib/supabaseClient'
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

/**
 * Visual Insight additions (Phase 3A.2). moderateImage() is the
 * pre-processing safety stage — content-policy moderation, never medical
 * risk assessment (Phase 3A.0 Section 15) — and is a mock passthrough
 * here (always "safe") since real moderation requires a real provider.
 * analyzeImage() deliberately does NOT mirror generateResponse()'s
 * "client computes a draft, server independently verifies/overrides"
 * shape: unlike a text message, there's no meaningful client-side draft
 * to compute for an image — the mock result IS the server RPC's fixed
 * output, so this method is a thin, honest wrapper around
 * ai_process_visual_insight_image() rather than a parallel client-side
 * fabrication of one.
 */
export interface ModerateImageInput {
  imageId: string
}

export interface ModerateImageResult {
  safe: boolean
  category?: string
}

export interface AnalyzeImageInput {
  imageId: string
  conversationId: string | null
  userDescription: string | null
}

export interface AnalyzeImageResult {
  status: 'mock'
  visualObservations: string[]
  uncertainty: 'high' | 'moderate' | 'low'
  requiresFollowUp: boolean
  safetyTier: AiSafetyTier
  message: string
  processedAt: string
  /**
   * Optional (Phase 3A.6 hardening) — populated by the real producer of
   * this shape today, useVisualInsightProcessing.ts, from the richer
   * VisualInsightResult contract (src/features/visualInsight/provider/types.ts).
   * Optional rather than required so the unused mockAiProvider.analyzeImage()
   * below (dead code since the Phase 3A.3 provider-abstraction rewiring,
   * kept only for AiProvider interface completeness, not deleted here —
   * out of scope for this Visual-Insight-focused hardening pass) doesn't
   * need to change.
   */
  limitations?: string[]
  recommendedNextSteps?: string[]
}

export interface AiProvider {
  safetyScreen(input: SafetyScreenInput): Promise<SafetyScreenResult>
  retrieveContext(input: RetrieveContextInput): Promise<AiContextSnapshot | null>
  generateResponse(input: GenerateResponseInput): Promise<GenerateResponseResult>
  verifyResponse(input: VerifyResponseInput): Promise<VerifyResponseResult>
  moderateImage(input: ModerateImageInput): Promise<ModerateImageResult>
  analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageResult>
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

  async moderateImage(_input) {
    // Mock passthrough — real content-policy moderation requires a real
    // provider (Phase 3A.3+). Never assesses medical risk, by design
    // (Phase 3A.0 Section 15) — that's a different, harder problem this
    // mock does not pretend to solve either.
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { safe: true }
  },

  async analyzeImage({ imageId, conversationId, userDescription }) {
    const { data, error } = await supabase
      .rpc('ai_process_visual_insight_image', {
        p_image_id: imageId,
        p_conversation_id: conversationId,
        p_user_description: userDescription,
      })
      .single<{
        status: string
        visual_observations: string[]
        uncertainty: string
        requires_follow_up: boolean
        safety_tier: AiSafetyTier
        message: string
        processed_at: string
      }>()

    if (error) {
      if (error.hint === 'rate_limit') {
        throw new Error("You've reached today's Visual Insight processing limit. Please try again tomorrow.")
      }
      if (error.hint === 'invalid_image') {
        throw new Error('This image is not ready to be processed. Please try uploading it again.')
      }
      if (error.hint === 'already_processed') {
        throw new Error('This image has already been processed.')
      }
      throw new Error('We could not process this image. Please try again.')
    }

    return {
      status: 'mock',
      visualObservations: data.visual_observations,
      uncertainty: data.uncertainty as AnalyzeImageResult['uncertainty'],
      requiresFollowUp: data.requires_follow_up,
      safetyTier: data.safety_tier,
      message: data.message,
      processedAt: data.processed_at,
    }
  },
}

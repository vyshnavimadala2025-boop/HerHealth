import type { SafetyScreeningStage, SafetyVerificationStage, VisualInsightResult } from '@/features/visualInsight/provider/types'

/**
 * Mock implementations of the two safety-pipeline stages (Phase 3A.3 §4).
 * Both are deliberately trivial passthroughs — no real content-policy
 * moderation and no real safety classification exist yet. Swapping either
 * for a real implementation later does not require any change to the
 * stage interfaces in provider/types.ts, only to the function bodies here.
 *
 * Neither stage creates, approves, or references emergency-tier wording.
 * `mockSafetyVerificationStage` never sets `emergencyFlag`; that remains
 * hardcoded false at the VisualInsightResult level (see mockProvider.ts)
 * until a real, clinically-reviewed verification stage exists.
 */
export const mockSafetyScreeningStage: SafetyScreeningStage = {
  async screen(_input) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { safe: true }
  },
}

export const mockSafetyVerificationStage: SafetyVerificationStage = {
  async verify(_result: VisualInsightResult) {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return { passed: true }
  },
}

import type { AiCapability } from '@/features/aiIntelligence/types'

/**
 * SIRILA Intelligence is gated to development builds only until two
 * explicit, still-open Phase 0 blockers are resolved: (1) the Privacy
 * Page's existing "your journal is never analyzed" language contradicts
 * what this feature does, and (2) emergency-tier response wording has not
 * gone through clinical/legal sign-off — see 0029_ai_send_message.sql's
 * placeholder text. Flip this only after both are genuinely resolved, not
 * to unblock testing — testing should happen in dev builds, where this is
 * already true.
 */
export const AI_INTELLIGENCE_PREVIEW_ONLY = import.meta.env.DEV

/** Matches the server-enforced limit in ai_send_message() (0029) — display copy only, not the enforcement. */
export const AI_DAILY_MESSAGE_LIMIT = 50

export const AI_MESSAGE_MAX_LENGTH = 4000

export interface AiCapabilityMeta {
  value: AiCapability
  label: string
  tagline: string
  description: string
}

export const AI_CAPABILITIES: AiCapabilityMeta[] = [
  {
    value: 'ask_sirila',
    label: 'Ask SIRILA',
    tagline: 'Understand what you’re experiencing.',
    description:
      'Share what you’re noticing, and SIRILA can help you make sense of it — grounded in general wellness information, never a diagnosis.',
  },
  {
    value: 'symptom_insight',
    label: 'Symptom Insight',
    tagline: 'Let’s understand what you’re noticing.',
    description:
      'Describe a symptom — what, when, how severe — and SIRILA will help you organize it into something clearer.',
  },
]

export const AI_FEEDBACK_REASON_OPTIONS: { value: string; label: string }[] = [
  { value: 'inaccurate', label: 'Inaccurate' },
  { value: 'confusing', label: 'Confusing' },
  { value: 'too_generic', label: 'Too generic' },
  { value: 'unsafe', label: 'Felt unsafe' },
  { value: 'irrelevant', label: 'Not relevant' },
  { value: 'missing_information', label: 'Missing information' },
  { value: 'other', label: 'Something else' },
]

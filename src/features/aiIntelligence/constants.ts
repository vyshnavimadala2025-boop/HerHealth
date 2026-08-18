import type { AiCapability } from '@/features/aiIntelligence/types'

/**
 * Launch scope decision: SIRILA Intelligence conversational chat is
 * ENABLED for the initial production launch — an explicit product
 * decision, made with full knowledge of the item below, not a claim
 * that it's been resolved.
 *
 * KNOWN, ACCEPTED, STILL-OPEN GAP (found during the Phase 5
 * safety-wording audit, NOT fixed by this flag or anything else in this
 * codebase): the emergency-tier override in
 * supabase/migrations/0029_ai_send_message.sql substitutes a literal,
 * explicitly-unreviewed placeholder string ("[Placeholder — pending
 * clinical/legal sign-off, not approved emergency guidance] ...") for
 * any message classified emergency-tier. No later migration replaces
 * it — it is what ai_send_message() returns today, to real users, now
 * that this flag is true. Replacing it requires a new migration
 * carrying reviewed, approved wording (never invent that wording in
 * code) — out of scope for this change, which only touches this flag.
 *
 * The Privacy Page journal-analysis contradiction (the other Phase 0
 * blocker) was confirmed resolved separately.
 *
 * Visual Insight (image upload/analysis) is a SEPARATE flag —
 * FEATURE_VISUAL_INSIGHT below — and remains disabled regardless of
 * this flag's state, developed further as a post-launch feature. It is
 * deliberately not bundled with this constant: the two features have no
 * UI coupling and no reason to share one on/off switch.
 */
export const FEATURE_SIRILA_CHAT = true

/**
 * Visual Insight — disabled for the initial launch. The full
 * architecture (provider abstraction, mock provider, server-side
 * boundary, migrations, tests) is preserved untouched; only the UI entry
 * points (route, nav link) and the processing kill switches are turned
 * off. Re-enabling later is a matter of flipping this back to true plus
 * the two VISUAL_INSIGHT_PROCESSING_ENABLED switches
 * (src/features/visualInsight/provider/config.ts and
 * supabase/functions/visual-insight-process/provider/config.ts) — no
 * rebuild required.
 */
export const FEATURE_VISUAL_INSIGHT = false

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

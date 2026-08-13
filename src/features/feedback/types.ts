export const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug / Problem' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'general_feedback', label: 'General Feedback' },
  { value: 'usability', label: 'Usability Issue' },
] as const

export type FeedbackType = (typeof FEEDBACK_TYPES)[number]['value']

export const FEEDBACK_CATEGORIES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'cycle_tracker', label: 'Cycle Tracker' },
  { value: 'baby_growth', label: 'Baby Growth' },
  { value: 'sleep_intelligence', label: 'Sleep Intelligence' },
  { value: 'nutrition_companion', label: 'Nutrition Companion' },
  { value: 'stress_recovery', label: 'Stress & Recovery' },
  { value: 'goals', label: 'Goals' },
  { value: 'wellness_score', label: 'Wellness Score' },
  { value: 'insights', label: 'Insights' },
  { value: 'reports', label: 'Reports' },
  { value: 'lifestyle_intelligence', label: 'Lifestyle Intelligence' },
  { value: 'preventive_screening', label: 'Preventive Screening' },
  { value: 'knowledge_hub', label: 'Knowledge Hub' },
  { value: 'authentication', label: 'Authentication' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'other', label: 'Other' },
] as const

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]['value']

export const FEEDBACK_DESCRIPTION_MAX_LENGTH = 2000

export interface FeedbackSubmissionInput {
  type: FeedbackType
  description: string
  category: FeedbackCategory | null
}

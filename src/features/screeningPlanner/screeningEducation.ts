import type { ScreeningCategory } from '@/features/screeningPlanner/types'

const GUIDANCE = 'Discuss appropriate screening timing with your healthcare professional.'

/**
 * Deliberately generic, non-schedule, non-age-specific descriptions —
 * this app has no authoritative screening dataset (confirmed by
 * inspection: no such content exists anywhere in HerHealth yet, including
 * the Women's Knowledge Hub), so per Stage 3F's explicit fallback this
 * never invents an age threshold, interval, or eligibility rule. Every
 * entry ends with the same healthcare-guidance line.
 */
export const SCREENING_CATEGORY_EDUCATION: Record<ScreeningCategory, string> = {
  general_health: `Routine health checks can help you stay connected with your overall wellbeing over time. ${GUIDANCE}`,
  reproductive_health: `Reproductive health check-ups can be part of many people's ongoing care. ${GUIDANCE}`,
  breast_health: `Breast health awareness and check-ups can be part of many people's ongoing care. ${GUIDANCE}`,
  skin_health: `Skin checks can help you notice changes over time. ${GUIDANCE}`,
  dental: `Regular dental check-ups can be part of everyday preventive care. ${GUIDANCE}`,
  vision: `Vision check-ups can help you notice changes in your eyesight over time. ${GUIDANCE}`,
  mental_health: `Mental health check-ins can be a valuable part of overall wellbeing. ${GUIDANCE}`,
  other: `Use this category for any personal health check-up that doesn't fit the others. ${GUIDANCE}`,
}

export const INSUFFICIENT_INFORMATION_NOTICE =
  "We don't have enough information to determine whether a specific screening is appropriate for you. Screening schedules can vary based on individual health history, family history, previous results, and healthcare guidance. Use this planner to keep track of your own screening information and discuss appropriate screening with a healthcare professional."

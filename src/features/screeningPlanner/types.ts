/**
 * Broad organizational categories only — never a specific test, age, or
 * frequency. Purely a browsing/tagging aid, not a clinical ruleset.
 */
export const SCREENING_CATEGORY_OPTIONS = [
  { value: 'general_health', label: 'General health check' },
  { value: 'reproductive_health', label: 'Reproductive health' },
  { value: 'breast_health', label: 'Breast health' },
  { value: 'skin_health', label: 'Skin health' },
  { value: 'dental', label: 'Dental' },
  { value: 'vision', label: 'Vision' },
  { value: 'mental_health', label: 'Mental health' },
  { value: 'other', label: 'Other' },
] as const

export type ScreeningCategory = (typeof SCREENING_CATEGORY_OPTIONS)[number]['value']

export const SCREENING_STATUSES = ['planned', 'completed'] as const
export type ScreeningStatus = (typeof SCREENING_STATUSES)[number]

export const TITLE_MAX_LENGTH = 120
export const NOTE_MAX_LENGTH = 500

export interface ScreeningItem {
  id: string
  title: string
  category: ScreeningCategory | null
  plannedDate: string | null
  completedDate: string | null
  status: ScreeningStatus
  note: string | null
  createdAt: string
  updatedAt: string
}

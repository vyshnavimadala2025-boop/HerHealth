/** Reuses the exact stress vocabulary already established by fertility_entries.stress_level. */
export const STRESS_LEVEL_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very high' },
] as const

export type StressLevel = (typeof STRESS_LEVEL_OPTIONS)[number]['value']

/** Same 4-tier vocabulary as stress, applied to a new dimension — no existing "recovery" scale to diverge from. */
export const RECOVERY_LEVEL_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very high' },
] as const

export type RecoveryLevel = (typeof RECOVERY_LEVEL_OPTIONS)[number]['value']

export const RECOVERY_ACTION_OPTIONS = [
  { value: 'rest', label: 'Rest' },
  { value: 'movement', label: 'Movement' },
  { value: 'breathing', label: 'Breathing / relaxation' },
  { value: 'social_support', label: 'Social support' },
  { value: 'nature', label: 'Time outdoors' },
  { value: 'hobby', label: 'A hobby I enjoy' },
  { value: 'other', label: 'Something else' },
] as const

export type RecoveryAction = (typeof RECOVERY_ACTION_OPTIONS)[number]['value']

export const REFLECTION_MAX_LENGTH = 500

export interface StressRecoveryEntry {
  id: string
  entryDate: string
  stressLevel: StressLevel | null
  recoveryLevel: RecoveryLevel | null
  recoveryActions: RecoveryAction[]
  reflection: string | null
  createdAt: string
  updatedAt: string
}

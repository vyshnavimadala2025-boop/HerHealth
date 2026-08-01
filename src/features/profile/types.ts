export const AGE_RANGES = [
  { value: 'under_18', label: 'Under 18' },
  { value: '18_24', label: '18–24' },
  { value: '25_34', label: '25–34' },
  { value: '35_44', label: '35–44' },
  { value: '45_plus', label: '45+' },
] as const

export type AgeRange = (typeof AGE_RANGES)[number]['value']

export const TRACKING_PREFERENCES = [
  { value: 'menstrual_cycle', label: 'Menstrual cycle' },
  { value: 'period_symptoms', label: 'Period symptoms' },
  { value: 'mood_wellbeing', label: 'Mood and wellbeing' },
  { value: 'lifestyle_habits', label: 'Lifestyle habits' },
  { value: 'pcos_tracking', label: 'PCOS-related tracking' },
  { value: 'general_notes', label: 'General health notes' },
] as const

export type TrackingPreference = (typeof TRACKING_PREFERENCES)[number]['value']

export interface Profile {
  id: string
  fullName: string
  email: string
  ageRange: AgeRange | null
  trackingPreferences: TrackingPreference[]
  onboardingCompleted: boolean
}

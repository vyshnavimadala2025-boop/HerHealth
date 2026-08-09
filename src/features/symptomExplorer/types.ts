export const SYMPTOM_OPTIONS = [
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'headache', label: 'Headache' },
  { value: 'bloating', label: 'Bloating' },
  { value: 'cramping', label: 'Cramping' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'mood_changes', label: 'Mood changes' },
  { value: 'breast_tenderness', label: 'Breast tenderness' },
  { value: 'joint_pain', label: 'Joint pain' },
  { value: 'skin_changes', label: 'Skin changes' },
  { value: 'sleep_disturbance', label: 'Sleep disturbance' },
  { value: 'appetite_changes', label: 'Appetite changes' },
  { value: 'hot_flashes', label: 'Hot flashes' },
  { value: 'dizziness', label: 'Dizziness' },
  { value: 'back_pain', label: 'Back pain' },
  { value: 'other', label: 'Something else' },
] as const

export type SymptomValue = (typeof SYMPTOM_OPTIONS)[number]['value']

export const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'significant', label: 'Significant' },
] as const

export type SeverityValue = (typeof SEVERITY_OPTIONS)[number]['value']

export const TIMING_OPTIONS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
  { value: 'all_day', label: 'All day' },
] as const

export type TimingValue = (typeof TIMING_OPTIONS)[number]['value']

export const NOTE_MAX_LENGTH = 500

export interface SymptomEntry {
  id: string
  entryDate: string
  symptoms: SymptomValue[]
  severity: SeverityValue | null
  timing: TimingValue | null
  note: string | null
  createdAt: string
  updatedAt: string
}

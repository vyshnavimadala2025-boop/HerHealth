/** Reuses the exact quality vocabulary already established by fertility_entries.sleep_quality/pregnancy_entries.sleep_quality. */
export const SLEEP_QUALITY_OPTIONS = [
  { value: 'poor', label: 'Poor' },
  { value: 'fair', label: 'Fair' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
] as const

export type SleepQuality = (typeof SLEEP_QUALITY_OPTIONS)[number]['value']

export const NOTE_MAX_LENGTH = 500

export interface SleepEntry {
  id: string
  entryDate: string
  bedtime: string | null
  wakeTime: string | null
  durationMinutes: number | null
  quality: SleepQuality | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export const OBSERVATION_OPTIONS = [
  { value: 'skin_changes', label: 'Skin changes noticed' },
  { value: 'hair_growth_changes', label: 'Hair growth changes noticed' },
  { value: 'weight_changes', label: 'Weight changes noticed' },
  { value: 'appetite_changes', label: 'Appetite or cravings changes noticed' },
  { value: 'sleep_changes', label: 'Sleep pattern changes noticed' },
  { value: 'digestive_changes', label: 'Digestive changes noticed' },
  { value: 'fatigue', label: 'Fatigue noticed' },
  { value: 'none_noted', label: 'No specific observations today' },
] as const

export type PcosObservation = (typeof OBSERVATION_OPTIONS)[number]['value']

export const NOTE_MAX_LENGTH = 500

export interface PcosWellnessEntry {
  id: string
  entryDate: string
  observations: PcosObservation[]
  note: string | null
  createdAt: string
  updatedAt: string
}

/** Returns the browser's local calendar date as 'YYYY-MM-DD' (not toISOString(), which is UTC). */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parses a 'YYYY-MM-DD' string as a local-midnight Date (not UTC). */
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Formats a 'YYYY-MM-DD' date as e.g. "12 July". */
export function formatFriendlyDate(dateString: string): string {
  return parseLocalDate(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  })
}

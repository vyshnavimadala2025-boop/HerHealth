export const MOOD_OPTIONS = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'okay', label: 'Okay' },
  { value: 'low', label: 'Low' },
  { value: 'difficult', label: 'Difficult' },
] as const

export type Mood = (typeof MOOD_OPTIONS)[number]['value']

export const ENERGY_LEVEL_OPTIONS = [
  { value: 'very_low', label: 'Very low' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'very_high', label: 'Very high' },
] as const

export type EnergyLevel = (typeof ENERGY_LEVEL_OPTIONS)[number]['value']

export const WELLBEING_OPTIONS = [
  { value: 'feeling_well', label: 'Feeling well' },
  { value: 'slightly_uncomfortable', label: 'Slightly uncomfortable' },
  { value: 'not_feeling_best', label: 'Not feeling my best' },
  { value: 'need_to_take_it_easy', label: 'Need to take it easy' },
] as const

export type Wellbeing = (typeof WELLBEING_OPTIONS)[number]['value']

export const NOTE_MAX_LENGTH = 500

export interface CheckIn {
  id: string
  checkinDate: string
  mood: Mood
  energyLevel: EnergyLevel
  wellbeing: Wellbeing
  note: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Returns the browser's local calendar date as 'YYYY-MM-DD'. Deliberately
 * not toISOString(), which converts to UTC and can land on the wrong
 * calendar day near midnight in most timezones.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Formats a date as e.g. "Tuesday, 1 August" using the user's actual local date. */
export function formatFriendlyDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/** Formats an ISO timestamp as a short local time, e.g. "2:15 PM". */
export function formatFriendlyTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

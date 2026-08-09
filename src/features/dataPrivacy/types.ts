export const DATA_CATEGORIES = [
  { value: 'checkins', label: 'Daily check-ins' },
  { value: 'periods', label: 'Period records' },
  { value: 'journal', label: 'Journal entries' },
  { value: 'pcosWellness', label: 'PCOS/PCOD wellness entries' },
  { value: 'goals', label: 'Wellness goals & progress' },
  { value: 'reminders', label: 'Reminder preferences' },
  { value: 'symptoms', label: 'Symptom entries' },
  { value: 'sleep', label: 'Sleep entries' },
  { value: 'nutrition', label: 'Nutrition entries' },
  { value: 'stressRecovery', label: 'Stress & recovery entries' },
  { value: 'screenings', label: 'Preventive screening plans' },
] as const

export type DataCategory = (typeof DATA_CATEGORIES)[number]['value']

export interface DeletionOutcome {
  category: DataCategory
  success: boolean
  error?: string
}

export const DELETE_ALL_CONFIRMATION_PHRASE = 'DELETE'

/** The master delete-everything action stays disabled until this returns true. */
export function isDeleteAllConfirmed(inputText: string): boolean {
  return inputText === DELETE_ALL_CONFIRMATION_PHRASE
}

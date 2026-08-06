import { diffInCalendarDays, getLocalDateString } from '@/features/periods/dateUtils'

/** Standard 40-week (280-day) pregnancy length, used only to relate the user's own entered due date to a current week — never to estimate or confirm a due date medically. */
const PREGNANCY_LENGTH_DAYS = 280

export interface PregnancyProgress {
  currentWeek: number
  trimester: 1 | 2 | 3
  daysUntilDue: number
  isPastDue: boolean
}

export function calculatePregnancyProgress(dueDate: string): PregnancyProgress {
  const today = getLocalDateString()
  const daysUntilDue = diffInCalendarDays(dueDate, today)
  const daysElapsed = PREGNANCY_LENGTH_DAYS - daysUntilDue
  const currentWeek = Math.min(Math.max(Math.floor(daysElapsed / 7) + 1, 1), 40)
  const trimester: 1 | 2 | 3 = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3

  return {
    currentWeek,
    trimester,
    daysUntilDue,
    isPastDue: daysUntilDue < 0,
  }
}

/**
 * A transparent, explained percentage (not a mystery score): the share of
 * tracked wellness signals present across recent entries — logging a
 * mood, staying near a comfortable nutrition-habit count, etc. Returns
 * null when there's nothing recorded yet.
 */
export function calculateWellnessScore(
  entriesInWindow: { mood: string | null; nutritionHabits: string[] }[],
  totalNutritionHabits: number,
): number | null {
  if (entriesInWindow.length === 0) return null
  const moodLoggedCount = entriesInWindow.filter((entry) => entry.mood !== null).length
  const totalNutritionPossible = entriesInWindow.length * totalNutritionHabits
  const totalNutritionLogged = entriesInWindow.reduce((sum, entry) => sum + entry.nutritionHabits.length, 0)
  const moodShare = moodLoggedCount / entriesInWindow.length
  const nutritionShare = totalNutritionPossible > 0 ? totalNutritionLogged / totalNutritionPossible : 0
  return Math.round(((moodShare + nutritionShare) / 2) * 100)
}

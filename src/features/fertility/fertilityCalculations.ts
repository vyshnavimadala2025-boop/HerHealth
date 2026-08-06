import { addDays, diffInCalendarDays, getLocalDateString } from '@/features/periods/dateUtils'

/**
 * Standard luteal-phase-based fertility awareness estimate: ovulation is
 * assumed to fall ~14 days before the *next* period, so with a known cycle
 * length, estimated ovulation = last period start + (cycleLength - 14).
 * The six-day fertile window (5 days before ovulation through ovulation
 * day) is the commonly cited range since sperm can survive several days
 * and the egg survives about a day. This is a general estimate from the
 * user's own recorded dates — never a prediction, and explicitly not
 * contraception or conception guidance.
 */
const LUTEAL_PHASE_DAYS = 14
const FERTILE_WINDOW_DAYS_BEFORE_OVULATION = 5

export interface FertilityWindow {
  cycleDay: number | null
  estimatedOvulationDate: string | null
  fertileWindowStart: string | null
  fertileWindowEnd: string | null
  daysUntilOvulation: number | null
  isInFertileWindow: boolean
  isOvulationDay: boolean
}

export function calculateFertilityWindow(
  lastPeriodStartDate: string | null,
  cycleLength: number | null,
): FertilityWindow {
  const today = getLocalDateString()

  const cycleDay = lastPeriodStartDate ? diffInCalendarDays(today, lastPeriodStartDate) + 1 : null

  if (!lastPeriodStartDate || !cycleLength) {
    return {
      cycleDay,
      estimatedOvulationDate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      daysUntilOvulation: null,
      isInFertileWindow: false,
      isOvulationDay: false,
    }
  }

  const estimatedOvulationDate = addDays(lastPeriodStartDate, cycleLength - LUTEAL_PHASE_DAYS)
  const fertileWindowStart = addDays(estimatedOvulationDate, -FERTILE_WINDOW_DAYS_BEFORE_OVULATION)
  const fertileWindowEnd = estimatedOvulationDate
  const daysUntilOvulation = diffInCalendarDays(estimatedOvulationDate, today)
  const isInFertileWindow = today >= fertileWindowStart && today <= fertileWindowEnd
  const isOvulationDay = today === estimatedOvulationDate

  return {
    cycleDay,
    estimatedOvulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    daysUntilOvulation,
    isInFertileWindow,
    isOvulationDay,
  }
}

/**
 * A transparent, explained percentage — not a mysterious black-box score.
 * Percentage of the 8 tracked habits completed, averaged across entries in
 * the window. Returns null (not 0) when there's nothing recorded yet, so
 * callers can distinguish "no data" from "0% completion".
 */
export function calculateHabitConsistency(
  entriesInWindow: { habits: string[] }[],
  totalHabitOptions: number,
): number | null {
  if (entriesInWindow.length === 0 || totalHabitOptions === 0) return null
  const totalPossible = entriesInWindow.length * totalHabitOptions
  const totalCompleted = entriesInWindow.reduce((sum, entry) => sum + entry.habits.length, 0)
  return Math.round((totalCompleted / totalPossible) * 100)
}

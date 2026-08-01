import { addDays, getLocalDateString } from '@/features/periods/dateUtils'
import type { CheckIn } from '@/features/checkins/types'
import type { WeeklyCheckInSummary } from '@/features/insights/types'

const WEEK_WINDOW_DAYS = 7

/**
 * Mode (most frequent value) over a newest-first list. Ties are broken
 * toward whichever tied value occurs first in the input — i.e. the most
 * recently recorded one, since callers pass newest-first arrays.
 */
function mostCommon<T extends string>(valuesNewestFirst: T[]): T | null {
  if (valuesNewestFirst.length === 0) return null

  const counts = new Map<T, number>()
  for (const value of valuesNewestFirst) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  let best: T | null = null
  let bestCount = 0
  for (const value of valuesNewestFirst) {
    const count = counts.get(value) as number
    if (count > bestCount) {
      best = value
      bestCount = count
    }
  }
  return best
}

/** Filters check-ins to the last 7 local calendar days and summarizes them. */
export function calculateWeeklyCheckInSummary(
  checkInsNewestFirst: CheckIn[],
): WeeklyCheckInSummary {
  const today = getLocalDateString()
  const windowStart = addDays(today, -(WEEK_WINDOW_DAYS - 1))

  const weekCheckIns = checkInsNewestFirst.filter(
    (entry) => entry.checkinDate >= windowStart && entry.checkinDate <= today,
  )

  const count = weekCheckIns.length
  const consistencyPercent = Math.round((count / WEEK_WINDOW_DAYS) * 100)

  return {
    count,
    consistencyPercent,
    mostCommonMood: mostCommon(weekCheckIns.map((entry) => entry.mood)),
    mostCommonEnergyLevel: mostCommon(weekCheckIns.map((entry) => entry.energyLevel)),
    mostCommonWellbeing: mostCommon(weekCheckIns.map((entry) => entry.wellbeing)),
  }
}

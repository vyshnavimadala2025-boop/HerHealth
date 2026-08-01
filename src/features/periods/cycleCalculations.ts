import { addDays, diffInCalendarDays } from '@/features/periods/dateUtils'

const MAX_INTERVALS = 6

/**
 * Estimates cycle length from sorted (newest-first) period start dates.
 * Needs at least two distinct start dates. Uses up to the latest six
 * intervals between consecutive start dates, ignoring duplicate dates.
 * Returns null when there isn't enough data.
 */
export function calculateCycleLength(startDatesDesc: string[]): number | null {
  const uniqueDates = startDatesDesc.filter(
    (date, index) => index === 0 || date !== startDatesDesc[index - 1],
  )

  if (uniqueDates.length < 2) return null

  const intervalCount = Math.min(uniqueDates.length - 1, MAX_INTERVALS)
  const intervals: number[] = []
  for (let i = 0; i < intervalCount; i += 1) {
    const interval = diffInCalendarDays(uniqueDates[i], uniqueDates[i + 1])
    if (interval > 0) intervals.push(interval)
  }

  if (intervals.length === 0) return null

  const average = intervals.reduce((sum, value) => sum + value, 0) / intervals.length
  return Math.round(average)
}

/** Most recent start date + estimated cycle length. Null if either input is missing. */
export function calculateEstimatedNextPeriod(
  mostRecentStartDate: string | null,
  cycleLength: number | null,
): string | null {
  if (!mostRecentStartDate || !cycleLength) return null
  return addDays(mostRecentStartDate, cycleLength)
}

/** End date − start date + 1, inclusive of both days. Null if there's no end date. */
export function calculatePeriodDuration(startDate: string, endDate: string | null): number | null {
  if (!endDate) return null
  return diffInCalendarDays(endDate, startDate) + 1
}

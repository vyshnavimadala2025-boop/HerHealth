import { addDays, diffInCalendarDays } from '@/features/periods/dateUtils'
import { MOOD_SCORES } from '@/features/insights/moodTrend'
import { ENERGY_SCORES } from '@/features/insights/energyTrend'
import type { CheckIn } from '@/features/checkins/types'

export type TimelineRange = 'today' | 'week' | 'month' | '3months'

export const TIMELINE_RANGES: TimelineRange[] = ['today', 'week', 'month', '3months']

export const TIMELINE_RANGE_LABELS: Record<TimelineRange, string> = {
  today: 'Today',
  week: 'Week',
  month: 'Month',
  '3months': '3 Months',
}

/** Local calendar-day window length used to compute the consistency score. */
export const SCORE_WINDOW_DAYS = 30

/**
 * The one genuinely real, whole-of-lifestyle signal HerHealth can honestly
 * report today: what share of the last 30 local calendar days had a
 * recorded check-in. Everything else in the Lifestyle Score (sleep
 * consistency, recovery, movement, hydration, stress balance,
 * environmental comfort) has no tracked field yet, so it isn't blended
 * into this number.
 */
export function calculateConsistencyScore(checkInCount: number, windowDays = SCORE_WINDOW_DAYS): number {
  if (windowDays <= 0) return 0
  return Math.min(100, Math.round((checkInCount / windowDays) * 100))
}

export interface TimelinePoint {
  label: string
  moodAverage: number | null
  energyAverage: number | null
  entryCount: number
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Buckets a user's own check-ins (ascending by date) into the requested
 * range, entirely from real recorded mood/energy values. Only Mood and
 * Energy are plotted — the spec's other requested series (Stress,
 * Weather, Movement, Hydration, Outdoor Time) have no tracked field, so
 * callers show them as a "not yet tracked" legend instead of a fabricated
 * line.
 */
export function buildLifestyleTimeline(
  checkIns: CheckIn[],
  today: string,
  range: TimelineRange,
): TimelinePoint[] {
  if (range === 'today') {
    const todaysEntries = checkIns.filter((entry) => entry.checkinDate === today)
    return [
      {
        label: 'Today',
        moodAverage: average(todaysEntries.map((entry) => MOOD_SCORES[entry.mood])),
        energyAverage: average(todaysEntries.map((entry) => ENERGY_SCORES[entry.energyLevel])),
        entryCount: todaysEntries.length,
      },
    ]
  }

  if (range === 'week') {
    const points: TimelinePoint[] = []
    for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
      const date = addDays(today, -daysAgo)
      const dayEntries = checkIns.filter((entry) => entry.checkinDate === date)
      const weekday = WEEKDAY_LABELS[new Date(date).getDay()]
      points.push({
        label: daysAgo === 0 ? 'Today' : weekday,
        moodAverage: average(dayEntries.map((entry) => MOOD_SCORES[entry.mood])),
        energyAverage: average(dayEntries.map((entry) => ENERGY_SCORES[entry.energyLevel])),
        entryCount: dayEntries.length,
      })
    }
    return points
  }

  const bucketCount = range === 'month' ? 4 : 12
  const buckets: { mood: number[]; energy: number[] }[] = Array.from({ length: bucketCount }, () => ({
    mood: [],
    energy: [],
  }))

  for (const entry of checkIns) {
    const daysAgo = diffInCalendarDays(today, entry.checkinDate)
    if (daysAgo < 0) continue
    const bucketIndex = Math.floor(daysAgo / 7)
    if (bucketIndex >= bucketCount) continue
    buckets[bucketIndex].mood.push(MOOD_SCORES[entry.mood])
    buckets[bucketIndex].energy.push(ENERGY_SCORES[entry.energyLevel])
  }

  return buckets
    .map((bucket, index) => ({
      label: index === 0 ? 'This week' : `${index + 1}w ago`,
      moodAverage: average(bucket.mood),
      energyAverage: average(bucket.energy),
      entryCount: bucket.mood.length,
    }))
    .reverse()
}

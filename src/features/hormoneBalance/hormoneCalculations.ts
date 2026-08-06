import { diffInCalendarDays } from '@/features/periods/dateUtils'
import { MOOD_SCORES } from '@/features/insights/moodTrend'
import { ENERGY_SCORES } from '@/features/insights/energyTrend'
import type { CheckIn } from '@/features/checkins/types'

export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal'

const DEFAULT_CYCLE_LENGTH = 28
/** Matches the luteal-phase estimate already used by the Fertility Journey feature. */
const OVULATION_DAYS_BEFORE_NEXT_PERIOD = 14

export interface CyclePhaseEstimate {
  phase: CyclePhase
  cycleDay: number
}

export const CYCLE_PHASE_DESCRIPTIONS: Record<CyclePhase, string> = {
  Menstrual: 'the body is shedding the uterine lining, and energy may feel lower',
  Follicular: 'rising estrogen often supports steadier energy and mood',
  Ovulatory: 'hormone activity is typically at its most active point in the cycle',
  Luteal: 'progesterone rises, and some people notice mood or energy shifts',
}

/**
 * Educational, non-diagnostic estimate of where a user is likely to be in
 * their cycle, from their own recorded period start date and (if
 * available) their own estimated cycle length. Returns null when there's
 * no recorded period to estimate from — never a guessed default.
 */
export function estimateCyclePhase(
  mostRecentStartDate: string | null,
  cycleLength: number | null,
  today: string,
): CyclePhaseEstimate | null {
  if (!mostRecentStartDate) return null

  const length = cycleLength ?? DEFAULT_CYCLE_LENGTH
  const daysSinceStart = diffInCalendarDays(today, mostRecentStartDate)
  if (daysSinceStart < 0) return null

  const cycleDay = (daysSinceStart % length) + 1
  const ovulationDay = Math.max(1, length - OVULATION_DAYS_BEFORE_NEXT_PERIOD)

  let phase: CyclePhase
  if (cycleDay <= 5) {
    phase = 'Menstrual'
  } else if (cycleDay < ovulationDay - 2) {
    phase = 'Follicular'
  } else if (cycleDay <= ovulationDay + 2) {
    phase = 'Ovulatory'
  } else {
    phase = 'Luteal'
  }

  return { phase, cycleDay }
}

export interface WeeklyProgressPoint {
  weekLabel: string
  moodAverage: number | null
  energyAverage: number | null
  entryCount: number
}

/**
 * Buckets a user's own check-ins into 7-day windows (oldest first) and
 * averages the same documented mood/energy → numeric mappings already used
 * for trend calculation elsewhere in the app. Purely derived from existing
 * data — no new fields, no fabricated values.
 */
export function buildWeeklyProgressTimeline(
  checkIns: CheckIn[],
  today: string,
  weekCount = 8,
): WeeklyProgressPoint[] {
  const buckets: { mood: number[]; energy: number[] }[] = Array.from({ length: weekCount }, () => ({
    mood: [],
    energy: [],
  }))

  for (const entry of checkIns) {
    const daysAgo = diffInCalendarDays(today, entry.checkinDate)
    if (daysAgo < 0) continue
    const weekIndex = Math.floor(daysAgo / 7)
    if (weekIndex >= weekCount) continue
    buckets[weekIndex].mood.push(MOOD_SCORES[entry.mood])
    buckets[weekIndex].energy.push(ENERGY_SCORES[entry.energyLevel])
  }

  const average = (values: number[]) =>
    values.length > 0 ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : null

  return buckets
    .map((bucket, index) => ({
      weekLabel: index === 0 ? 'This week' : `${index + 1} weeks ago`,
      moodAverage: average(bucket.mood),
      energyAverage: average(bucket.energy),
      entryCount: bucket.mood.length,
    }))
    .reverse()
}

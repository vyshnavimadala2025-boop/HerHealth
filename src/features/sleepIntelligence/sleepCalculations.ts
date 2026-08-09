import { diffInCalendarDays } from '@/features/periods/dateUtils'
import { calculateConsistencyScore } from '@/features/lifestyleIntelligence/lifestyleCalculations'
import { classifyTrend } from '@/features/insights/trendMath'
import type { SleepEntry, SleepQuality } from '@/features/sleepIntelligence/types'

/** Same numeric-mapping convention as MOOD_SCORES/ENERGY_SCORES (moodTrend.ts/energyTrend.ts) — used only for trend classification, never displayed directly. */
export const SLEEP_QUALITY_SCORES: Record<SleepQuality, number> = {
  poor: 1,
  fair: 2,
  good: 3,
  excellent: 4,
}

/** Same minimum-entries threshold moodTrend.ts/energyTrend.ts already require before reporting a trend, reused here for consistency across the app. */
export const MIN_USABLE_NIGHTS = 3
const CONSISTENCY_WINDOW_DAYS = 30

/**
 * Overnight duration in minutes from 'HH:MM' bedtime/wake time, handling
 * a wake time that's numerically earlier than bedtime (crossed midnight)
 * by adding 24h. Returns null if either time is missing — duration is
 * never guessed from a single time.
 */
export function computeDurationMinutes(bedtime: string | null, wakeTime: string | null): number | null {
  if (!bedtime || !wakeTime) return null
  const [bedHour, bedMinute] = bedtime.split(':').map(Number)
  const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number)
  const bedMinutes = bedHour * 60 + bedMinute
  let wakeMinutes = wakeHour * 60 + wakeMinute
  if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60
  return wakeMinutes - bedMinutes
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

export type SleepQualityTrend = 'Improving' | 'Stable' | 'Mixed' | 'Decreasing' | 'Limited data'

export interface SleepSummary {
  nightsTracked: number
  avgDurationMinutes: number | null
  recentDurationMinutes: number | null
  consistencyPercent: number
  qualityTrend: SleepQualityTrend
  hasSufficientData: boolean
}

/**
 * Every metric here comes only from real recorded nights within
 * `windowDays` — no value is invented for a night that wasn't tracked.
 * consistencyPercent reuses calculateConsistencyScore() (lifestyleCalculations.ts)
 * exactly as-is (it's already a generic count/windowDays percentage, not
 * specific to check-ins). qualityTrend reuses classifyTrend() (trendMath.ts)
 * over an oldest-first quality-score window, gated behind the same
 * MIN_USABLE_NIGHTS=3 threshold moodTrend.ts/energyTrend.ts use, with the
 * same direction labels calculateEnergyTrend() already establishes
 * ('Decreasing' allowed here, same as energy — sleep quality isn't
 * subject to mood's medical-safety "never decreasing" rule).
 */
export function calculateSleepSummary(
  entries: SleepEntry[],
  today: string,
  windowDays = CONSISTENCY_WINDOW_DAYS,
): SleepSummary {
  const recentEntries = entries.filter((entry) => {
    const daysAgo = diffInCalendarDays(today, entry.entryDate)
    return daysAgo >= 0 && daysAgo < windowDays
  })

  const nightsTracked = recentEntries.length
  const hasSufficientData = nightsTracked >= MIN_USABLE_NIGHTS

  const durations = recentEntries
    .map((entry) => entry.durationMinutes)
    .filter((value): value is number => value !== null)
  const avgDurationMinutes = average(durations)

  const mostRecentWithDuration = [...recentEntries]
    .sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1))
    .find((entry) => entry.durationMinutes !== null)
  const recentDurationMinutes = mostRecentWithDuration?.durationMinutes ?? null

  const consistencyPercent = calculateConsistencyScore(nightsTracked, windowDays)

  let qualityTrend: SleepQualityTrend = 'Limited data'
  const qualityScoresOldestFirst = [...recentEntries]
    .filter((entry): entry is SleepEntry & { quality: SleepQuality } => entry.quality !== null)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
    .map((entry) => SLEEP_QUALITY_SCORES[entry.quality])

  if (qualityScoresOldestFirst.length >= MIN_USABLE_NIGHTS) {
    const direction = classifyTrend(qualityScoresOldestFirst)
    qualityTrend =
      direction === 'increasing'
        ? 'Improving'
        : direction === 'decreasing'
          ? 'Decreasing'
          : direction === 'mixed'
            ? 'Mixed'
            : 'Stable'
  }

  return { nightsTracked, avgDurationMinutes, recentDurationMinutes, consistencyPercent, qualityTrend, hasSufficientData }
}

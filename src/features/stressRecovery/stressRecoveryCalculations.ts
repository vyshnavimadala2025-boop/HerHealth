import { diffInCalendarDays } from '@/features/periods/dateUtils'
import { calculateConsistencyScore } from '@/features/lifestyleIntelligence/lifestyleCalculations'
import { classifyTrend } from '@/features/insights/trendMath'
import type { SleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import type { RecoveryLevel, StressLevel, StressRecoveryEntry } from '@/features/stressRecovery/types'

/** Same numeric-mapping convention as SLEEP_QUALITY_SCORES/MOOD_SCORES — used for trend classification and for charting. Shared by stress and recovery since both reuse the same 4-tier vocabulary. */
export const LEVEL_SCORES: Record<StressLevel, number> = { low: 1, moderate: 2, high: 3, very_high: 4 }

/** Same minimum-entries threshold moodTrend.ts/energyTrend.ts/sleepCalculations.ts/nutritionCalculations.ts already use. */
export const MIN_USABLE_DAYS = 3
const CONSISTENCY_WINDOW_DAYS = 30

export type StressTrend = 'Rising' | 'Stable' | 'Mixed' | 'Easing' | 'Limited data'
export type RecoveryTrend = 'Improving' | 'Stable' | 'Mixed' | 'Decreasing' | 'Limited data'

export interface StressRecoverySummary {
  daysTracked: number
  consistencyPercent: number
  recentStressLevel: StressLevel | null
  recentRecoveryLevel: RecoveryLevel | null
  stressTrend: StressTrend
  recoveryTrend: RecoveryTrend
  hasSufficientData: boolean
}

/**
 * Every value comes only from real recorded days within `windowDays`.
 * consistencyPercent reuses calculateConsistencyScore() (lifestyleCalculations.ts)
 * unmodified. Both trends reuse classifyTrend() (trendMath.ts) over an
 * oldest-first score window, gated behind MIN_USABLE_DAYS=3 — but their
 * word choice deliberately differs: recovery uses the same
 * 'Improving'/'Decreasing' convention as sleep/hydration (higher recovery
 * is unambiguously positive, same direction-to-word mapping). Stress does
 * NOT reuse that mapping — a rising stress *level* is not an "improvement",
 * so classifyTrend's 'increasing' is labeled 'Rising' and 'decreasing' is
 * labeled 'Easing' instead, avoiding the inverted-value-judgment bug that
 * would occur from copy-pasting the recovery/sleep label set onto stress.
 */
export function calculateStressRecoverySummary(
  entries: StressRecoveryEntry[],
  today: string,
  windowDays = CONSISTENCY_WINDOW_DAYS,
): StressRecoverySummary {
  const recentEntries = entries.filter((entry) => {
    const daysAgo = diffInCalendarDays(today, entry.entryDate)
    return daysAgo >= 0 && daysAgo < windowDays
  })

  const daysTracked = recentEntries.length
  const hasSufficientData = daysTracked >= MIN_USABLE_DAYS
  const consistencyPercent = calculateConsistencyScore(daysTracked, windowDays)

  const sortedDesc = [...recentEntries].sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1))
  const recentStressLevel = sortedDesc.find((entry) => entry.stressLevel !== null)?.stressLevel ?? null
  const recentRecoveryLevel = sortedDesc.find((entry) => entry.recoveryLevel !== null)?.recoveryLevel ?? null

  let stressTrend: StressTrend = 'Limited data'
  const stressScoresOldestFirst = [...recentEntries]
    .filter((entry): entry is StressRecoveryEntry & { stressLevel: StressLevel } => entry.stressLevel !== null)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
    .map((entry) => LEVEL_SCORES[entry.stressLevel])
  if (stressScoresOldestFirst.length >= MIN_USABLE_DAYS) {
    const direction = classifyTrend(stressScoresOldestFirst)
    stressTrend =
      direction === 'increasing' ? 'Rising' : direction === 'decreasing' ? 'Easing' : direction === 'mixed' ? 'Mixed' : 'Stable'
  }

  let recoveryTrend: RecoveryTrend = 'Limited data'
  const recoveryScoresOldestFirst = [...recentEntries]
    .filter((entry): entry is StressRecoveryEntry & { recoveryLevel: RecoveryLevel } => entry.recoveryLevel !== null)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
    .map((entry) => LEVEL_SCORES[entry.recoveryLevel])
  if (recoveryScoresOldestFirst.length >= MIN_USABLE_DAYS) {
    const direction = classifyTrend(recoveryScoresOldestFirst)
    recoveryTrend =
      direction === 'increasing'
        ? 'Improving'
        : direction === 'decreasing'
          ? 'Decreasing'
          : direction === 'mixed'
            ? 'Mixed'
            : 'Stable'
  }

  return { daysTracked, consistencyPercent, recentStressLevel, recentRecoveryLevel, stressTrend, recoveryTrend, hasSufficientData }
}

/**
 * "Relationship between tracked sleep and recovery where sufficient data
 * exists" (Stage 3D requirement #11) — reuses Sleep Intelligence's own
 * SleepSummary (Stage 3B) rather than a second sleep calculation. Only
 * ever describes co-occurrence ("changed during the same period"), never
 * causation — and only fires when both series have a genuinely
 * directional (non-flat, non-mixed) real trend that happens to point the
 * same way.
 */
export function buildSleepRecoveryObservation(
  sleepQualityTrend: SleepSummary['qualityTrend'],
  recoveryTrend: RecoveryTrend,
): string | null {
  if (sleepQualityTrend === 'Limited data' || recoveryTrend === 'Limited data') return null

  const sleepDirection = sleepQualityTrend === 'Improving' ? 'up' : sleepQualityTrend === 'Decreasing' ? 'down' : null
  const recoveryDirection = recoveryTrend === 'Improving' ? 'up' : recoveryTrend === 'Decreasing' ? 'down' : null
  if (!sleepDirection || !recoveryDirection || sleepDirection !== recoveryDirection) return null

  const word = sleepDirection === 'up' ? 'improved' : 'eased'
  return `Your tracked sleep quality and recovery level both ${word} during the same recent period. This reflects a pattern in your own recorded data, not a cause-and-effect relationship.`
}

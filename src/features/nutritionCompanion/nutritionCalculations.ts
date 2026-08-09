import { diffInCalendarDays } from '@/features/periods/dateUtils'
import { calculateConsistencyScore } from '@/features/lifestyleIntelligence/lifestyleCalculations'
import { classifyTrend } from '@/features/insights/trendMath'
import type { NutritionEntry } from '@/features/nutritionCompanion/types'

/** Same minimum-entries threshold moodTrend.ts/energyTrend.ts/sleepCalculations.ts already use before reporting a trend, reused here for consistency across the app. */
export const MIN_USABLE_DAYS = 3
const CONSISTENCY_WINDOW_DAYS = 30

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

export type HydrationTrend = 'Improving' | 'Stable' | 'Mixed' | 'Decreasing' | 'Limited data'

export interface NutritionSummary {
  daysTracked: number
  totalMealsLogged: number
  avgHydrationGlasses: number | null
  recentHydrationGlasses: number | null
  consistencyPercent: number
  hydrationTrend: HydrationTrend
  hasSufficientData: boolean
}

/**
 * Every metric comes only from real recorded days within `windowDays` — no
 * value is invented for an untracked day. consistencyPercent reuses
 * calculateConsistencyScore() (lifestyleCalculations.ts) unmodified.
 * hydrationTrend reuses classifyTrend() (trendMath.ts) over an oldest-first
 * hydration series, gated behind the same MIN_USABLE_DAYS=3 threshold used
 * by sleepCalculations.ts, with the same 'Decreasing'-allowed labeling
 * convention as energy/sleep (hydration isn't subject to mood's
 * medical-safety "never decreasing" rule).
 */
export function calculateNutritionSummary(
  entries: NutritionEntry[],
  today: string,
  windowDays = CONSISTENCY_WINDOW_DAYS,
): NutritionSummary {
  const recentEntries = entries.filter((entry) => {
    const daysAgo = diffInCalendarDays(today, entry.entryDate)
    return daysAgo >= 0 && daysAgo < windowDays
  })

  const daysTracked = recentEntries.length
  const hasSufficientData = daysTracked >= MIN_USABLE_DAYS

  const totalMealsLogged = recentEntries.reduce((sum, entry) => sum + entry.mealsLogged.length, 0)

  const hydrationValues = recentEntries
    .map((entry) => entry.hydrationGlasses)
    .filter((value): value is number => value !== null)
  const avgHydrationGlasses = average(hydrationValues)

  const mostRecentWithHydration = [...recentEntries]
    .sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1))
    .find((entry) => entry.hydrationGlasses !== null)
  const recentHydrationGlasses = mostRecentWithHydration?.hydrationGlasses ?? null

  const consistencyPercent = calculateConsistencyScore(daysTracked, windowDays)

  let hydrationTrend: HydrationTrend = 'Limited data'
  const hydrationScoresOldestFirst = [...recentEntries]
    .filter((entry) => entry.hydrationGlasses !== null)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
    .map((entry) => entry.hydrationGlasses as number)

  if (hydrationScoresOldestFirst.length >= MIN_USABLE_DAYS) {
    const direction = classifyTrend(hydrationScoresOldestFirst)
    hydrationTrend =
      direction === 'increasing'
        ? 'Improving'
        : direction === 'decreasing'
          ? 'Decreasing'
          : direction === 'mixed'
            ? 'Mixed'
            : 'Stable'
  }

  return {
    daysTracked,
    totalMealsLogged,
    avgHydrationGlasses,
    recentHydrationGlasses,
    consistencyPercent,
    hydrationTrend,
    hasSufficientData,
  }
}

import { classifyTrend } from '@/features/insights/trendMath'
import type { CheckIn, EnergyLevel } from '@/features/checkins/types'
import type { EnergyTrendResult } from '@/features/insights/types'

/** Documented energy → numeric mapping, used only for trend calculation. */
export const ENERGY_SCORES: Record<EnergyLevel, number> = {
  very_low: 1,
  low: 2,
  moderate: 3,
  high: 4,
  very_high: 5,
}

const MIN_USABLE_ENTRIES = 3
const TREND_WINDOW = 14

export function calculateEnergyTrend(checkInsNewestFirst: CheckIn[]): EnergyTrendResult {
  const window = checkInsNewestFirst.slice(0, TREND_WINDOW)
  if (window.length < MIN_USABLE_ENTRIES) return 'Limited data'

  const scoresOldestFirst = [...window].reverse().map((entry) => ENERGY_SCORES[entry.energyLevel])
  const trend = classifyTrend(scoresOldestFirst)

  switch (trend) {
    case 'increasing':
      return 'Improving'
    case 'decreasing':
      return 'Decreasing'
    case 'mixed':
      return 'Mixed'
    default:
      return 'Stable'
  }
}

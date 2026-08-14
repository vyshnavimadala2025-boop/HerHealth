import { classifyTrend } from '@/features/insights/trendMath'
import type { CheckIn, Mood } from '@/features/checkins/types'
import type { MoodTrendResult } from '@/features/insights/types'

/** Documented mood → numeric mapping, used only for trend calculation. */
export const MOOD_SCORES: Record<Mood, number> = {
  difficult: 1,
  low: 2,
  okay: 3,
  good: 4,
  great: 5,
}

const MIN_USABLE_ENTRIES = 3
const TREND_WINDOW = 14

/**
 * Mood trend deliberately never reports a "declining"/"decreasing" result —
 * a negative movement is reported as Mixed instead, per SIRILA's
 * medical-safety guidelines (mood must not be framed as worsening).
 */
export function calculateMoodTrend(checkInsNewestFirst: CheckIn[]): MoodTrendResult {
  const window = checkInsNewestFirst.slice(0, TREND_WINDOW)
  if (window.length < MIN_USABLE_ENTRIES) return 'Limited data'

  const scoresOldestFirst = [...window].reverse().map((entry) => MOOD_SCORES[entry.mood])
  const trend = classifyTrend(scoresOldestFirst)

  switch (trend) {
    case 'increasing':
      return 'Improving'
    case 'decreasing':
    case 'mixed':
      return 'Mixed'
    default:
      return 'Stable'
  }
}

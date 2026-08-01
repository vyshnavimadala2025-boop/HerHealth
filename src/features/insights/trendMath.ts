import type { TrendDirection } from '@/features/insights/types'

const DIFF_VARIANCE_THRESHOLD = 4
const DELTA_THRESHOLD = 0.5

/**
 * Deterministic, rule-based trend classification over a numeric score
 * window (oldest first). This is a simple documented heuristic, not a
 * statistical or clinical model.
 *
 * "Mixed" is detected from the variance of the *step-to-step differences*
 * between consecutive entries, not the variance of the raw values. Raw
 * value variance conflates "wide range" with "fluctuating": a clean,
 * steady climb from a low score to a high score can have a large raw
 * variance despite never reversing direction, while true oscillation
 * (repeatedly flipping between high and low) has large, sign-flipping
 * steps. Differencing isolates the latter.
 *
 * Direction (increasing/decreasing/stable) then compares the average of
 * the first half of the window to the second half (dropping the middle
 * entry when the window length is odd, so both halves stay equal size).
 */
export function classifyTrend(scoresOldestFirst: number[]): TrendDirection {
  const n = scoresOldestFirst.length

  const diffs: number[] = []
  for (let i = 1; i < n; i += 1) {
    diffs.push(scoresOldestFirst[i] - scoresOldestFirst[i - 1])
  }
  if (diffs.length > 0) {
    const diffMean = diffs.reduce((sum, value) => sum + value, 0) / diffs.length
    const diffVariance =
      diffs.reduce((sum, value) => sum + (value - diffMean) ** 2, 0) / diffs.length
    if (diffVariance > DIFF_VARIANCE_THRESHOLD) return 'mixed'
  }

  const half = Math.floor(n / 2)
  const earlierHalf = scoresOldestFirst.slice(0, half)
  const laterHalf = scoresOldestFirst.slice(n - half)
  const earlierAvg = earlierHalf.reduce((sum, value) => sum + value, 0) / earlierHalf.length
  const laterAvg = laterHalf.reduce((sum, value) => sum + value, 0) / laterHalf.length
  const delta = laterAvg - earlierAvg

  if (delta >= DELTA_THRESHOLD) return 'increasing'
  if (delta <= -DELTA_THRESHOLD) return 'decreasing'
  return 'stable'
}

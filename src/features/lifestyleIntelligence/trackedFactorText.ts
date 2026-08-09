export type SourceStatus = 'loading' | 'ready' | 'error'

export interface TrackedFactorDisplay {
  statusText: string
  trendText: string
}

/**
 * Pure text-selection helper shared by LifestyleFactorsSection.tsx,
 * TodaySnapshot.tsx, and LifestyleScore.tsx — not a calculation engine, it
 * never computes a wellness value itself. It only decides which honest
 * string to show for a factor HerHealth genuinely tracks (Sleep,
 * Nutrition, Hydration, Stress): the real value once real data.entries
 * exist, or an honest "loading" / "unavailable" / "not enough data yet"
 * message otherwise. Never falls back to a fabricated 0/Poor/Low.
 */
export function describeTrackedFactor(
  sourceStatus: SourceStatus,
  hasSufficientData: boolean,
  readyStatusText: string,
  readyTrendText: string,
): TrackedFactorDisplay {
  if (sourceStatus === 'loading') return { statusText: 'Loading…', trendText: '—' }
  if (sourceStatus === 'error') return { statusText: 'Unavailable', trendText: 'Try refreshing' }
  if (!hasSufficientData) return { statusText: 'Not enough data yet', trendText: 'Log a few more days' }
  return { statusText: readyStatusText, trendText: readyTrendText }
}

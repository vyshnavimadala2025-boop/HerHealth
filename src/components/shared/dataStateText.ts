export type SourceStatus = 'loading' | 'ready' | 'error'

export interface TrackedFactorDisplay {
  statusText: string
  trendText: string
}

/**
 * Pure text-selection helper — not a calculation engine, it never computes
 * a wellness value itself. It only decides which honest string to show for
 * a factor HerHealth genuinely tracks: the real value once real data
 * exists, or an honest "loading" / "unavailable" / "not enough data yet"
 * message otherwise. Never falls back to a fabricated 0/Poor/Low. Shared
 * across Lifestyle Intelligence (Stage 4C2) and Insights (Stage 5A) —
 * relocated here (UI/UX Phase 1) since it's a generic UI-state helper, not
 * specific to any one feature.
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

/** Capitalizes the first letter and turns a single underscore into a space (e.g. "very_high" → "Very high"). */
export function capitalize(value: string): string {
  return value.length > 0 ? value[0].toUpperCase() + value.slice(1).replace('_', ' ') : value
}

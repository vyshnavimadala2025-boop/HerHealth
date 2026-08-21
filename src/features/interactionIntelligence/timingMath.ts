/**
 * Pure timing math shared by the public landing-page demo and the (later,
 * consented) authenticated capture — deliberately has no knowledge of what
 * was pressed, only WHEN. Nothing in this file ever touches key/character
 * content; callers pass only timestamps and an opaque `id` used purely to
 * pair a press with its matching release (e.g. a key code or a demo
 * button's id), never the character typed.
 */

export interface TimedEvent {
  id: string
  type: 'down' | 'up'
  atMs: number
}

export interface TimingSample {
  /** ms between this input's own down/up (how long a press was held) */
  dwellMs: number
  /** ms between the previous input's release and this input's press (gap between interactions); null for the first sample */
  flightMs: number | null
}

/**
 * Pairs a stream of down/up events into dwell samples (per-id) and flight
 * samples (gap between one release and the next press), in chronological
 * order. Unmatched down events (no corresponding up yet) are ignored.
 */
export function computeTimingSamples(events: TimedEvent[]): TimingSample[] {
  const samples: TimingSample[] = []
  const openDowns = new Map<string, number>()
  let lastUpAt: number | null = null

  const sorted = [...events].sort((a, b) => a.atMs - b.atMs)

  for (const event of sorted) {
    if (event.type === 'down') {
      openDowns.set(event.id, event.atMs)
      continue
    }
    const downAt = openDowns.get(event.id)
    if (downAt === undefined) continue
    openDowns.delete(event.id)

    const dwellMs = event.atMs - downAt
    const flightMs = lastUpAt === null ? null : downAt - lastUpAt
    samples.push({ dwellMs, flightMs: flightMs !== null && flightMs >= 0 ? flightMs : null })
    lastUpAt = event.atMs
  }

  return samples
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/** Coefficient of variation (stddev / mean) — the variability measure behind the "consistency" score. */
export function variability(values: number[]): number | null {
  if (values.length < 2) return null
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  if (mean === 0) return null
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance) / mean
}

/**
 * 0-100 "how rhythmically consistent were these samples" score — purely
 * illustrative for the demo, not a validated behavioral metric. Lower
 * variability (coefficient of variation) -> higher score. Clamped and
 * scaled so a typical human timing spread (~30-60% CoV) lands in a
 * readable mid-to-high range rather than always reading near 0 or 100.
 */
export function consistencyScore(values: number[]): number | null {
  const cv = variability(values)
  if (cv === null) return null
  const score = 100 - cv * 110
  return Math.max(0, Math.min(100, Math.round(score)))
}

export interface TimingSummary {
  medianDwellMs: number | null
  medianFlightMs: number | null
  dwellVariability: number | null
  flightVariability: number | null
  consistency: number | null
  sampleCount: number
}

export function summarizeTimingSamples(samples: TimingSample[]): TimingSummary {
  const dwells = samples.map((s) => s.dwellMs)
  const flights = samples.map((s) => s.flightMs).filter((f): f is number => f !== null)
  return {
    medianDwellMs: median(dwells),
    medianFlightMs: median(flights),
    dwellVariability: variability(dwells),
    flightVariability: variability(flights),
    consistency: consistencyScore(dwells),
    sampleCount: samples.length,
  }
}

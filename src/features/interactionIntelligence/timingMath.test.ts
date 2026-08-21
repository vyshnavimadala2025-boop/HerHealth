import { describe, expect, it } from 'vitest'
import {
  computeTimingSamples,
  consistencyScore,
  median,
  summarizeTimingSamples,
  variability,
  type TimedEvent,
} from './timingMath'

describe('computeTimingSamples', () => {
  it('pairs a down/up event into a single dwell sample with null flight for the first sample', () => {
    const events: TimedEvent[] = [
      { id: 'a', type: 'down', atMs: 1000 },
      { id: 'a', type: 'up', atMs: 1080 },
    ]
    const samples = computeTimingSamples(events)
    expect(samples).toEqual([{ dwellMs: 80, flightMs: null }])
  })

  it('computes flight time as the gap between one release and the next press', () => {
    const events: TimedEvent[] = [
      { id: 'a', type: 'down', atMs: 1000 },
      { id: 'a', type: 'up', atMs: 1080 },
      { id: 'b', type: 'down', atMs: 1200 },
      { id: 'b', type: 'up', atMs: 1290 },
    ]
    const samples = computeTimingSamples(events)
    expect(samples).toEqual([
      { dwellMs: 80, flightMs: null },
      { dwellMs: 90, flightMs: 120 },
    ])
  })

  it('ignores a down event with no matching up (still in progress)', () => {
    const events: TimedEvent[] = [
      { id: 'a', type: 'down', atMs: 1000 },
      { id: 'a', type: 'up', atMs: 1080 },
      { id: 'b', type: 'down', atMs: 1200 },
    ]
    expect(computeTimingSamples(events)).toHaveLength(1)
  })

  it('sorts out-of-order events by timestamp before pairing', () => {
    const events: TimedEvent[] = [
      { id: 'a', type: 'up', atMs: 1080 },
      { id: 'a', type: 'down', atMs: 1000 },
    ]
    expect(computeTimingSamples(events)).toEqual([{ dwellMs: 80, flightMs: null }])
  })

  it('handles a very fast interaction (near-zero dwell) without dropping or distorting the sample', () => {
    const events: TimedEvent[] = [
      { id: 'a', type: 'down', atMs: 1000 },
      { id: 'a', type: 'up', atMs: 1001 },
    ]
    expect(computeTimingSamples(events)).toEqual([{ dwellMs: 1, flightMs: null }])
  })

  it('handles a long pause between interactions as a large flight time, not an error', () => {
    const events: TimedEvent[] = [
      { id: 'a', type: 'down', atMs: 1000 },
      { id: 'a', type: 'up', atMs: 1050 },
      { id: 'b', type: 'down', atMs: 60_000 }, // ~59s later
      { id: 'b', type: 'up', atMs: 60_040 },
    ]
    const samples = computeTimingSamples(events)
    expect(samples[1].flightMs).toBe(60_000 - 1050)
  })

  it('ignores an up event with no matching down (missing press)', () => {
    const events: TimedEvent[] = [{ id: 'a', type: 'up', atMs: 1000 }]
    expect(computeTimingSamples(events)).toEqual([])
  })

  it('treats each id independently, so overlapping presses on different ids do not cross-pair', () => {
    // Simulates two rhythm nodes held down simultaneously — 'a' released
    // before 'b' is pressed shouldn't corrupt 'b's own dwell calculation.
    const events: TimedEvent[] = [
      { id: 'a', type: 'down', atMs: 1000 },
      { id: 'b', type: 'down', atMs: 1010 },
      { id: 'a', type: 'up', atMs: 1090 },
      { id: 'b', type: 'up', atMs: 1120 },
    ]
    const samples = computeTimingSamples(events)
    expect(samples).toHaveLength(2)
    expect(samples[0]).toEqual({ dwellMs: 90, flightMs: null }) // a: 1000->1090
    expect(samples[1].dwellMs).toBe(110) // b: 1010->1120
  })

  it('session boundary: a fresh event buffer (new session) starts with no flight carried over from a previous one', () => {
    // The capture hook flushes and clears its buffer between sessions
    // (see useInteractionCapture.ts) — computeTimingSamples itself has no
    // memory beyond the events it's given, so a new buffer's first sample
    // must have flightMs: null even though, in wall-clock time, it may
    // follow a much earlier session.
    const previousSessionLastUp = 1080
    void previousSessionLastUp // not passed in — proves no cross-session state leaks
    const newSessionEvents: TimedEvent[] = [
      { id: 'x', type: 'down', atMs: 500_000 },
      { id: 'x', type: 'up', atMs: 500_060 },
    ]
    expect(computeTimingSamples(newSessionEvents)).toEqual([{ dwellMs: 60, flightMs: null }])
  })

  it('never receives or exposes anything about which key/button was pressed beyond the pairing id', () => {
    // Structural guarantee: TimingSample only ever carries numbers.
    const events: TimedEvent[] = [
      { id: 'KeyQ', type: 'down', atMs: 0 },
      { id: 'KeyQ', type: 'up', atMs: 50 },
    ]
    const [sample] = computeTimingSamples(events)
    expect(Object.keys(sample).sort()).toEqual(['dwellMs', 'flightMs'])
  })
})

describe('median', () => {
  it('returns null for an empty array', () => {
    expect(median([])).toBeNull()
  })

  it('returns the middle value for an odd-length array', () => {
    expect(median([3, 1, 2])).toBe(2)
  })

  it('averages the two middle values for an even-length array', () => {
    expect(median([10, 20])).toBe(15)
  })
})

describe('variability', () => {
  it('returns null with fewer than two values', () => {
    expect(variability([50])).toBeNull()
  })

  it('returns 0 for identical values (perfectly consistent)', () => {
    expect(variability([100, 100, 100])).toBe(0)
  })

  it('is larger for a more spread-out sample than a tight one', () => {
    const tight = variability([95, 100, 105])!
    const spread = variability([20, 100, 180])!
    expect(spread).toBeGreaterThan(tight)
  })
})

describe('consistencyScore', () => {
  it('returns null with fewer than two values', () => {
    expect(consistencyScore([50])).toBeNull()
  })

  it('scores identical timings at the maximum (100)', () => {
    expect(consistencyScore([80, 80, 80])).toBe(100)
  })

  it('scores a highly erratic sample lower than a tight one', () => {
    const tight = consistencyScore([78, 80, 82])!
    const erratic = consistencyScore([10, 90, 300])!
    expect(tight).toBeGreaterThan(erratic)
  })

  it('never returns a value outside the 0-100 display range', () => {
    const score = consistencyScore([1, 500, 2, 480, 3])!
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

describe('summarizeTimingSamples', () => {
  it('summarizes an empty sample set without throwing', () => {
    expect(summarizeTimingSamples([])).toEqual({
      medianDwellMs: null,
      medianFlightMs: null,
      dwellVariability: null,
      flightVariability: null,
      consistency: null,
      sampleCount: 0,
    })
  })

  it('reports sampleCount matching the input length and excludes null flights from the flight median', () => {
    const summary = summarizeTimingSamples([
      { dwellMs: 80, flightMs: null },
      { dwellMs: 90, flightMs: 120 },
      { dwellMs: 100, flightMs: 140 },
    ])
    expect(summary.sampleCount).toBe(3)
    expect(summary.medianFlightMs).toBe(130)
    expect(summary.medianDwellMs).toBe(90)
  })
})

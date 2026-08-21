// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { clearBaseline, getBaselineSummary, recordSessionSummary, SESSIONS_TO_ESTABLISH_BASELINE } from './baselineStore'
import type { TimingSummary } from './timingMath'

function summary(overrides: Partial<TimingSummary> = {}): TimingSummary {
  return {
    medianDwellMs: 80,
    medianFlightMs: 100,
    dwellVariability: 0.1,
    flightVariability: 0.1,
    consistency: 90,
    sampleCount: 10,
    ...overrides,
  }
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('getBaselineSummary', () => {
  it('reports no-data status with nothing recorded', () => {
    expect(getBaselineSummary()).toMatchObject({ status: 'no-data', sessionCount: 0 })
  })

  it('ignores a session summary with zero samples', () => {
    recordSessionSummary(summary({ sampleCount: 0 }))
    expect(getBaselineSummary().status).toBe('no-data')
  })

  it('stays in "building" status below the establishment threshold', () => {
    for (let i = 0; i < SESSIONS_TO_ESTABLISH_BASELINE - 1; i++) {
      recordSessionSummary(summary())
    }
    const result = getBaselineSummary()
    expect(result.status).toBe('building')
    expect(result.sessionCount).toBe(SESSIONS_TO_ESTABLISH_BASELINE - 1)
  })

  it('becomes "established" once the threshold is reached', () => {
    for (let i = 0; i < SESSIONS_TO_ESTABLISH_BASELINE; i++) {
      recordSessionSummary(summary())
    }
    expect(getBaselineSummary().status).toBe('established')
  })

  it('flags a recent session that deviates meaningfully from an established baseline', () => {
    for (let i = 0; i < SESSIONS_TO_ESTABLISH_BASELINE; i++) {
      recordSessionSummary(summary({ medianDwellMs: 80 }))
    }
    recordSessionSummary(summary({ medianDwellMs: 200 }))
    expect(getBaselineSummary().recentDwellDeviatesFromBaseline).toBe(true)
  })

  it('does not flag deviation for a recent session close to baseline', () => {
    for (let i = 0; i < SESSIONS_TO_ESTABLISH_BASELINE; i++) {
      recordSessionSummary(summary({ medianDwellMs: 80 }))
    }
    recordSessionSummary(summary({ medianDwellMs: 85 }))
    expect(getBaselineSummary().recentDwellDeviatesFromBaseline).toBe(false)
  })

  it('never flags deviation while still building (not enough sessions yet)', () => {
    recordSessionSummary(summary({ medianDwellMs: 80 }))
    recordSessionSummary(summary({ medianDwellMs: 500 }))
    expect(getBaselineSummary().recentDwellDeviatesFromBaseline).toBe(false)
  })
})

describe('clearBaseline', () => {
  it('resets stored sessions back to no-data', () => {
    recordSessionSummary(summary())
    clearBaseline()
    expect(getBaselineSummary().status).toBe('no-data')
  })
})

describe('getBaselineSummary — defensive parsing of stored data (migration/version safety)', () => {
  const STORAGE_KEY = 'sirila-interaction-intelligence-sessions'

  it('does not throw and returns no-data when the stored value is not valid JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json at all')
    expect(() => getBaselineSummary()).not.toThrow()
    expect(getBaselineSummary().status).toBe('no-data')
  })

  it('does not throw and returns no-data when the stored value is valid JSON but not an array (shape changed)', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ unexpected: 'shape' }))
    expect(() => getBaselineSummary()).not.toThrow()
    expect(getBaselineSummary().status).toBe('no-data')
  })

  it('tolerates a stored array containing an older/partial session shape missing newer fields', () => {
    // Simulates a future field being added after some sessions were
    // already recorded under an older version of this module.
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ medianDwellMs: 80, sampleCount: 5, recordedAt: new Date().toISOString() }]),
    )
    expect(() => getBaselineSummary()).not.toThrow()
    const result = getBaselineSummary()
    expect(result.sessionCount).toBe(1)
  })
})

import { median, type TimingSummary } from './timingMath'

/**
 * Local baseline storage — MVP persistence for this feature (see
 * migrations/0041_interaction_intelligence.sql for the shape this would
 * take server-side once "optional secure synchronization" is wired up;
 * that migration is written and tested but not applied/connected here,
 * same constraint as every other unapplied migration in this project).
 * A baseline is the median of each session's own median dwell/flight —
 * a simple, transparent MVP definition, not a claim of clinical rigor.
 */

const SESSIONS_KEY = 'sirila-interaction-intelligence-sessions'
const MAX_STORED_SESSIONS = 30
/** MVP proxy for "7-14 days" — a session per distinct page load while consented, not literal calendar days. */
const SESSIONS_TO_ESTABLISH_BASELINE = 7

export interface StoredSession extends TimingSummary {
  recordedAt: string
}

export interface BaselineSummary {
  status: 'no-data' | 'building' | 'established'
  sessionCount: number
  medianDwellMs: number | null
  medianFlightMs: number | null
  consistency: number | null
  lastUpdated: string | null
  /** How the most recent session compares to the established baseline — only meaningful once established. */
  recentDwellDeviatesFromBaseline: boolean
}

function readSessions(): StoredSession[] {
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSessions(sessions: StoredSession[]): void {
  try {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(-MAX_STORED_SESSIONS)))
  } catch {
    // Non-fatal — see consent.ts for the same reasoning.
  }
}

export function recordSessionSummary(summary: TimingSummary): void {
  if (summary.sampleCount === 0) return
  const sessions = readSessions()
  sessions.push({ ...summary, recordedAt: new Date().toISOString() })
  writeSessions(sessions)
}

export function getBaselineSummary(): BaselineSummary {
  const sessions = readSessions()
  if (sessions.length === 0) {
    return {
      status: 'no-data',
      sessionCount: 0,
      medianDwellMs: null,
      medianFlightMs: null,
      consistency: null,
      lastUpdated: null,
      recentDwellDeviatesFromBaseline: false,
    }
  }

  const dwellMedians = sessions.map((s) => s.medianDwellMs).filter((v): v is number => v !== null)
  const flightMedians = sessions.map((s) => s.medianFlightMs).filter((v): v is number => v !== null)
  const consistencies = sessions.map((s) => s.consistency).filter((v): v is number => v !== null)

  const baselineDwell = median(dwellMedians)
  const baselineConsistency = median(consistencies)
  const status: BaselineSummary['status'] =
    sessions.length >= SESSIONS_TO_ESTABLISH_BASELINE ? 'established' : 'building'

  const mostRecent = sessions[sessions.length - 1]
  const recentDwellDeviatesFromBaseline =
    status === 'established' && baselineDwell !== null && mostRecent.medianDwellMs !== null
      ? Math.abs(mostRecent.medianDwellMs - baselineDwell) / baselineDwell > 0.35
      : false

  return {
    status,
    sessionCount: sessions.length,
    medianDwellMs: baselineDwell,
    medianFlightMs: median(flightMedians),
    consistency: baselineConsistency,
    lastUpdated: mostRecent.recordedAt,
    recentDwellDeviatesFromBaseline,
  }
}

export function clearBaseline(): void {
  try {
    window.localStorage.removeItem(SESSIONS_KEY)
  } catch {
    // Non-fatal.
  }
}

export { SESSIONS_TO_ESTABLISH_BASELINE }

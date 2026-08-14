import type { AiConsentState } from '@/features/aiIntelligence/types'

/**
 * Consent preference storage for SIRILA Intelligence (Phase 0 Section 6 /
 * Phase 2 Section 5). Three distinct, non-bundled categories — never one
 * combined "I agree" checkbox. Stored in localStorage rather than a new
 * database table for this phase (Phase 1/2 did not authorize a new
 * consent table); every category defaults to false (off) until the user
 * explicitly grants it. Moving this to a DB-backed, auditable table is a
 * reasonable future hardening step, not done now to avoid scope creep
 * beyond what was approved for this phase — see the Phase 2 checkpoint
 * report's known-limitations note.
 */
const STORAGE_KEY = 'sirila-ai-consent'

const DEFAULT_CONSENT: AiConsentState = {
  processing: false,
  useWellnessContext: false,
  memory: false,
}

export function getConsentState(): AiConsentState {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return { ...DEFAULT_CONSENT }
    const parsed = JSON.parse(stored) as Partial<AiConsentState>
    return {
      processing: parsed.processing === true,
      useWellnessContext: parsed.useWellnessContext === true,
      memory: parsed.memory === true,
    }
  } catch {
    return { ...DEFAULT_CONSENT }
  }
}

export function setConsentState(next: AiConsentState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage can be unavailable (private browsing, storage quota) — a
    // failed write here only means the preference doesn't persist for next
    // time, never a functional or security failure, so it's safe to ignore.
  }
}

export function hasGrantedProcessingConsent(): boolean {
  return getConsentState().processing
}

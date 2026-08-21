/**
 * Consent for SIRILA Interaction Intelligence — a single, explicit,
 * off-by-default toggle (unlike SIRILA Intelligence's multi-category
 * consent, this feature has exactly one thing to consent to: "let SIRILA
 * measure interaction timing"). Stored in localStorage, same rationale as
 * aiIntelligence/consent.ts — no new consent table for this MVP. Nothing
 * this module gates ever touches message content; see timingMath.ts and
 * useInteractionCapture.ts for the actual collection boundary.
 */
const STORAGE_KEY = 'sirila-interaction-intelligence-consent'

export function isInteractionIntelligenceEnabled(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setInteractionIntelligenceEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
  } catch {
    // Storage can be unavailable (private browsing, quota) — worst case the
    // preference doesn't persist for next time; never a functional failure.
  }
}

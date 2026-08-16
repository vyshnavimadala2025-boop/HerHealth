import type { VisualInsightErrorCategory, ProviderName } from './types.ts'

/**
 * Safe structured observability (Observability & Rollback Readiness
 * phase). This module is the ONLY place that decides what gets logged
 * for Visual Insight processing — index.ts calls logTelemetryEvent()
 * rather than console.log directly, so the "never log X" rule lives in
 * one reviewable place instead of being re-enforced by convention at
 * every call site.
 *
 * NEVER included in a TelemetryEvent, structurally (there is no field
 * for any of these — not omitted by convention, omitted by the type):
 *   - raw image bytes / image contents
 *   - image URLs (even signed ones — a URL is enough to fetch the image)
 *   - access tokens, API keys, provider secrets, passwords
 *   - user descriptions or any other free-text health content
 *   - unnecessary personal data — userId is intentionally NOT part of
 *     this event; correlate by requestId only, matching this project's
 *     existing minimal-logging posture. A future implementation that
 *     genuinely needs userId for abuse investigation should add it here
 *     explicitly and update this comment, not smuggle it in elsewhere.
 *
 * TODAY: logTelemetryEvent() writes one JSON line via console.log, which
 * Supabase's own Edge Function log viewer captures — sufficient for an
 * internal beta's scale (see Phase 3A.5 readiness review §8/§11). NOT
 * connected to any third-party monitoring/alerting service.
 *
 * FUTURE: connecting a real monitoring service means changing the body
 * of logTelemetryEvent() to also forward to that service (e.g. an HTTP
 * call to a logging endpoint) — the TelemetryEvent shape and every call
 * site in index.ts stay identical. This is the seam Phase 3A.3's
 * provider abstraction pattern is modeled on, applied to logging instead
 * of AI calls.
 */

export type OperationalIncidentCategory =
  | 'AUTH_FAILURE'
  | 'CONSENT_DENIED'
  | 'RATE_LIMITED'
  | 'INVALID_IMAGE'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'INVALID_PROVIDER_RESPONSE'
  | 'SAFETY_VERIFICATION_FAILURE'
  | 'INTERNAL_ERROR'

/**
 * Maps the internal VisualInsightErrorCategory (drives control flow and
 * user-facing messages) to the coarser, stable operational vocabulary
 * used for logs/dashboards/the rollback runbook. Two internal categories
 * with no explicit slot in the requested operational taxonomy are mapped
 * by documented judgment call, not silently:
 *   - 'ownership_denied' → AUTH_FAILURE (an authorization failure is,
 *     for ops-incident purposes, in the same "someone couldn't do what
 *     they asked" bucket as an authentication failure — this project has
 *     no separate AUTHZ_FAILURE category in the requested taxonomy)
 *   - 'unknown' / 'network_failure' → INTERNAL_ERROR (unclassified
 *     failures default to the most conservative, least-specific bucket
 *     rather than being force-fit into a misleading specific one)
 */
export function toOperationalCategory(category: VisualInsightErrorCategory): OperationalIncidentCategory {
  switch (category) {
    case 'consent_missing':
    case 'consent_withdrawn':
      return 'CONSENT_DENIED'
    case 'ownership_denied':
      return 'AUTH_FAILURE'
    case 'rate_limited':
      return 'RATE_LIMITED'
    case 'invalid_image':
    case 'unsupported_format':
    case 'oversized_image':
      return 'INVALID_IMAGE'
    case 'provider_unavailable':
      return 'PROVIDER_UNAVAILABLE'
    case 'provider_timeout':
      return 'PROVIDER_TIMEOUT'
    case 'malformed_provider_response':
      return 'INVALID_PROVIDER_RESPONSE'
    case 'safety_verification_failed':
      return 'SAFETY_VERIFICATION_FAILURE'
    case 'network_failure':
      return 'PROVIDER_ERROR'
    case 'unknown':
    default:
      return 'INTERNAL_ERROR'
  }
}

export type HttpStatusCategory = '2xx' | '4xx' | '5xx'

export function toHttpStatusCategory(status: number): HttpStatusCategory {
  if (status >= 500) return '5xx'
  if (status >= 400) return '4xx'
  return '2xx'
}

export interface TelemetryEvent {
  requestId: string
  timestamp: string
  provider: ProviderName | 'none'
  model?: string
  operation: 'analyze'
  latencyMs?: number
  outcome: 'success' | 'error'
  errorCategory?: OperationalIncidentCategory
  httpStatusCategory: HttpStatusCategory
  safetyVerificationStatus?: 'passed' | 'failed' | 'not_run'
}

export function logTelemetryEvent(event: TelemetryEvent): void {
  console.log(JSON.stringify(event))
}

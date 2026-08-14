export type HealthCheckStatus = 'loading' | 'healthy' | 'error'
export type OverallHealthStatus = 'loading' | 'healthy' | 'warning' | 'critical'

export interface HealthCheckResult {
  status: HealthCheckStatus
  message: string
  latencyMs: number | null
}

export interface AdminHealthSnapshot {
  database: HealthCheckResult
  authentication: HealthCheckResult
  adminRpc: HealthCheckResult
  checkedAt: string
}

/**
 * Overall status is derived, never hardcoded: all three checks healthy ->
 * Healthy; any one or two failing -> Warning; all three failing -> Critical
 * (database is foundational to everything else, so a database failure
 * alone still reads as at least Warning, never silently "Healthy").
 */
export function deriveOverallStatus(snapshot: AdminHealthSnapshot | null): OverallHealthStatus {
  if (!snapshot) return 'loading'
  const results = [snapshot.database, snapshot.authentication, snapshot.adminRpc]
  const failing = results.filter((result) => result.status === 'error').length
  if (failing === 0) return 'healthy'
  if (failing === results.length) return 'critical'
  return 'warning'
}

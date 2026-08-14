import { supabase } from '@/lib/supabaseClient'
import type { AdminHealthSnapshot, HealthCheckResult } from '@/features/admin/health/types'

/**
 * Every check below is a REAL network round trip against an EXISTING
 * admin-gated function or the Supabase Auth SDK — none of these values are
 * hardcoded, and no new RPC/migration was introduced for this phase.
 *
 * - Database: calls public.is_admin() (0019) — the lightest existing
 *   admin RPC, a real Postgres round trip through PostgREST.
 * - Authentication: calls supabase.auth.getUser(), which validates the
 *   current session against Supabase's Auth service over the network
 *   (unlike getSession(), which only reads local state) — never returns
 *   the token itself, only whether the call succeeded.
 * - Admin RPC: calls public.admin_overview_metrics() (0020) — a heavier
 *   existing admin RPC that reads real tables, proving the broader
 *   SECURITY DEFINER + is_admin()-gating infrastructure is functioning
 *   end-to-end, not just that Postgres is reachable.
 */

async function timed(fn: () => Promise<unknown>): Promise<HealthCheckResult> {
  const start = performance.now()
  try {
    await fn()
    return { status: 'healthy', message: 'Reachable', latencyMs: Math.round(performance.now() - start) }
  } catch {
    return { status: 'error', message: 'Unreachable', latencyMs: null }
  }
}

async function checkDatabase(): Promise<HealthCheckResult> {
  return timed(async () => {
    const { error } = await supabase.rpc('is_admin')
    if (error) throw error
  })
}

async function checkAuthentication(): Promise<HealthCheckResult> {
  return timed(async () => {
    const { error } = await supabase.auth.getUser()
    if (error) throw error
  })
}

async function checkAdminRpc(): Promise<HealthCheckResult> {
  return timed(async () => {
    const { error } = await supabase.rpc('admin_overview_metrics')
    if (error) throw error
  })
}

export async function runAdminHealthChecks(): Promise<AdminHealthSnapshot> {
  const [database, authentication, adminRpc] = await Promise.all([
    checkDatabase(),
    checkAuthentication(),
    checkAdminRpc(),
  ])

  return { database, authentication, adminRpc, checkedAt: new Date().toISOString() }
}

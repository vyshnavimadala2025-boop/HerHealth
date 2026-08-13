import { supabase } from '@/lib/supabaseClient'
import type { AdminOverviewMetrics } from '@/features/admin/overview/types'

interface AdminOverviewMetricsRow {
  total_users: number
  new_users_7d: number
  onboarding_completed: number
  onboarding_total: number
  active_users_7d: number
}

/**
 * Calls the admin-gated public.admin_overview_metrics() RPC (see
 * supabase/migrations/0020_admin_overview_metrics.sql). Returns only
 * platform-level counts — no individual user rows, no health content.
 */
export async function getAdminOverviewMetrics(): Promise<AdminOverviewMetrics> {
  const { data, error } = await supabase.rpc('admin_overview_metrics').single<AdminOverviewMetricsRow>()
  if (error) throw error

  return {
    totalUsers: data.total_users,
    newUsers7d: data.new_users_7d,
    onboardingCompleted: data.onboarding_completed,
    onboardingTotal: data.onboarding_total,
    activeUsers7d: data.active_users_7d,
  }
}

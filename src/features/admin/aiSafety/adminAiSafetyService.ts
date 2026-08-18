import { supabase } from '@/lib/supabaseClient'
import type { AdminAiSafetyMetrics } from '@/features/admin/aiSafety/types'

interface AdminAiSafetyMetricsRow {
  total_events: number
  urgent_count: number
  sensitive_count: number
  emergency_count: number
  blocked_count: number
  escalated_count: number
  logged_only_count: number
  events_last_24h: number
  events_last_7d: number
}

/**
 * Calls the admin-gated public.admin_ai_safety_metrics() RPC (see
 * supabase/migrations/0038_admin_ai_safety_metrics.sql). Returns only
 * aggregate counts — no individual event, no user, no conversation, and
 * no message content ever crosses this boundary. A non-admin or
 * unauthenticated caller gets the RPC's 42501 error, which this function
 * deliberately does not swallow — it propagates to the caller, same as
 * every other admin service function in this codebase (see
 * adminOverviewService.ts, adminFeedbackService.ts).
 */
export async function getAdminAiSafetyMetrics(): Promise<AdminAiSafetyMetrics> {
  const { data, error } = await supabase.rpc('admin_ai_safety_metrics').single<AdminAiSafetyMetricsRow>()
  if (error) throw error

  return {
    totalEvents: data.total_events,
    urgentCount: data.urgent_count,
    sensitiveCount: data.sensitive_count,
    emergencyCount: data.emergency_count,
    blockedCount: data.blocked_count,
    escalatedCount: data.escalated_count,
    loggedOnlyCount: data.logged_only_count,
    eventsLast24h: data.events_last_24h,
    eventsLast7d: data.events_last_7d,
  }
}

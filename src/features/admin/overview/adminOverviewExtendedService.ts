import { supabase } from '@/lib/supabaseClient'
import type {
  OverviewExtendedMetrics,
  OverviewPeriod,
  RecentActivityEvent,
  RecentActivityEventType,
  UserGrowthPoint,
} from '@/features/admin/overview/overviewExtendedTypes'

interface ExtendedMetricsRpcRow {
  total_wellness_records: number
  active_pregnancy_journeys: number
  returning_users_period: number
}

interface UserGrowthRpcRow {
  bucket_date: string
  new_users: number
}

interface RecentActivityRpcRow {
  event_type: RecentActivityEventType
  occurred_at: string
}

/** Calls public.admin_overview_extended_metrics() — see supabase/migrations/0025_admin_overview_extended.sql. */
export async function getOverviewExtendedMetrics(period: OverviewPeriod): Promise<OverviewExtendedMetrics> {
  const { data, error } = await supabase
    .rpc('admin_overview_extended_metrics', { p_period_days: period })
    .single<ExtendedMetricsRpcRow>()
  if (error) throw error

  return {
    totalWellnessRecords: data.total_wellness_records,
    activePregnancyJourneys: data.active_pregnancy_journeys,
    returningUsersPeriod: data.returning_users_period,
  }
}

/** Calls public.admin_user_growth_trend() — see supabase/migrations/0025_admin_overview_extended.sql. */
export async function getUserGrowthTrend(period: OverviewPeriod): Promise<UserGrowthPoint[]> {
  const { data, error } = await supabase.rpc('admin_user_growth_trend', { p_period_days: period })
  if (error) throw error

  return ((data ?? []) as UserGrowthRpcRow[]).map((row) => ({
    bucketDate: row.bucket_date,
    newUsers: row.new_users,
  }))
}

/** Calls public.admin_recent_activity_preview() — see supabase/migrations/0025_admin_overview_extended.sql. */
export async function getRecentActivityPreview(limit = 10): Promise<RecentActivityEvent[]> {
  const { data, error } = await supabase.rpc('admin_recent_activity_preview', { p_limit: limit })
  if (error) throw error

  return ((data ?? []) as RecentActivityRpcRow[]).map((row) => ({
    eventType: row.event_type,
    occurredAt: row.occurred_at,
  }))
}

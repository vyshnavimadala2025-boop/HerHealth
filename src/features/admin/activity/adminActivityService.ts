import { supabase } from '@/lib/supabaseClient'
import type {
  ActivityByTypeRow,
  ActivityCategory,
  ActivityEventType,
  ActivityFeedEvent,
  ActivityTrendPoint,
} from '@/features/admin/activity/types'
import type { UsagePeriod } from '@/features/admin/featureUsage/types'

interface ByTypeRpcRow {
  category: ActivityCategory
  event_count: number
}

interface TrendRpcRow {
  bucket_date: string
  activity_count: number
}

interface FeedRpcRow {
  event_type: ActivityEventType
  occurred_at: string
}

/** Calls public.admin_activity_by_type() — see supabase/migrations/0026_admin_activity_monitor.sql. */
export async function getActivityByType(period: UsagePeriod): Promise<ActivityByTypeRow[]> {
  const { data, error } = await supabase.rpc('admin_activity_by_type', { p_period_days: period })
  if (error) throw error

  return ((data ?? []) as ByTypeRpcRow[]).map((row) => ({
    category: row.category,
    eventCount: row.event_count,
  }))
}

/** Calls public.admin_activity_trend() — see supabase/migrations/0026_admin_activity_monitor.sql. */
export async function getActivityTrend(period: UsagePeriod): Promise<ActivityTrendPoint[]> {
  const { data, error } = await supabase.rpc('admin_activity_trend', { p_period_days: period })
  if (error) throw error

  return ((data ?? []) as TrendRpcRow[]).map((row) => ({
    bucketDate: row.bucket_date,
    activityCount: row.activity_count,
  }))
}

/** Calls public.admin_recent_activity_feed() — see supabase/migrations/0026_admin_activity_monitor.sql. */
export async function getRecentActivityFeed(period: UsagePeriod, limit = 20): Promise<ActivityFeedEvent[]> {
  const { data, error } = await supabase.rpc('admin_recent_activity_feed', { p_period_days: period, p_limit: limit })
  if (error) throw error

  return ((data ?? []) as FeedRpcRow[]).map((row) => ({
    eventType: row.event_type,
    occurredAt: row.occurred_at,
  }))
}

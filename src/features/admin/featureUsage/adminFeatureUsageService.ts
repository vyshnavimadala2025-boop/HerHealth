import { supabase } from '@/lib/supabaseClient'
import type {
  FeatureUsageBreakdownRow,
  FeatureUsageSummary,
  FeatureUsageTrendPoint,
  TrendDirection,
  UsagePeriod,
} from '@/features/admin/featureUsage/types'

interface SummaryRpcRow {
  total_users: number
  active_users_period: number
  features_with_adoption: number
  most_used_feature_key: string | null
  most_used_feature_label: string | null
  most_used_feature_users: number | null
  avg_features_per_engaged_user: number | null
}

interface BreakdownRpcRow {
  feature_key: string
  feature_label: string
  total_users: number
  users_ever: number
  users_this_period: number
  users_previous_period: number
  total_records: number
  adoption_percentage: number | null
  trend: TrendDirection
}

interface TrendRpcRow {
  bucket_date: string
  records_count: number
}

/** Calls public.admin_feature_usage_summary() — see supabase/migrations/0024_admin_feature_usage.sql. */
export async function getFeatureUsageSummary(period: UsagePeriod): Promise<FeatureUsageSummary> {
  const { data, error } = await supabase
    .rpc('admin_feature_usage_summary', { p_period_days: period })
    .single<SummaryRpcRow>()
  if (error) throw error

  return {
    totalUsers: data.total_users,
    activeUsersPeriod: data.active_users_period,
    featuresWithAdoption: data.features_with_adoption,
    mostUsedFeatureKey: data.most_used_feature_key,
    mostUsedFeatureLabel: data.most_used_feature_label,
    mostUsedFeatureUsers: data.most_used_feature_users,
    avgFeaturesPerEngagedUser: data.avg_features_per_engaged_user,
  }
}

/** Calls public.admin_feature_usage_breakdown() — see supabase/migrations/0024_admin_feature_usage.sql. */
export async function getFeatureUsageBreakdown(period: UsagePeriod): Promise<FeatureUsageBreakdownRow[]> {
  const { data, error } = await supabase.rpc('admin_feature_usage_breakdown', { p_period_days: period })
  if (error) throw error

  return ((data ?? []) as BreakdownRpcRow[]).map((row) => ({
    featureKey: row.feature_key,
    featureLabel: row.feature_label,
    totalUsers: row.total_users,
    usersEver: row.users_ever,
    usersThisPeriod: row.users_this_period,
    usersPreviousPeriod: row.users_previous_period,
    totalRecords: row.total_records,
    adoptionPercentage: row.adoption_percentage,
    trend: row.trend,
  }))
}

/** Calls public.admin_feature_usage_trend() — see supabase/migrations/0024_admin_feature_usage.sql. */
export async function getFeatureUsageTrend(period: UsagePeriod): Promise<FeatureUsageTrendPoint[]> {
  const { data, error } = await supabase.rpc('admin_feature_usage_trend', { p_period_days: period })
  if (error) throw error

  return ((data ?? []) as TrendRpcRow[]).map((row) => ({
    bucketDate: row.bucket_date,
    recordsCount: row.records_count,
  }))
}

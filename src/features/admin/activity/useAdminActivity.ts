import { useCallback, useEffect, useState } from 'react'
import {
  getActivityByType,
  getActivityTrend,
  getRecentActivityFeed,
} from '@/features/admin/activity/adminActivityService'
import type { ActivityByTypeRow, ActivityFeedEvent, ActivityTrendPoint } from '@/features/admin/activity/types'
import {
  getFeatureUsageBreakdown,
  getFeatureUsageSummary,
} from '@/features/admin/featureUsage/adminFeatureUsageService'
import type { FeatureUsageBreakdownRow, FeatureUsageSummary, UsagePeriod } from '@/features/admin/featureUsage/types'
import {
  getOverviewExtendedMetrics,
  getUserGrowthTrend,
} from '@/features/admin/overview/adminOverviewExtendedService'
import type { OverviewExtendedMetrics } from '@/features/admin/overview/overviewExtendedTypes'

export type AdminActivityStatus = 'loading' | 'ready' | 'error'

/**
 * Data for the Phase 3D Activity Monitor. The three NEW RPCs (0026) supply
 * activity-by-type, the activity trend, and the recent-activity feed.
 * Everything else — Active Users, Features Used (from Phase 3B), Returning
 * Users, New Users (from Phase 3C's growth trend, summed client-side), and
 * per-feature activity/adoption (from Phase 3B's breakdown) — is READ from
 * the existing Phase 3B/3C service functions, never re-derived here.
 */
export function useAdminActivity() {
  const [period, setPeriod] = useState<UsagePeriod>(30)
  const [status, setStatus] = useState<AdminActivityStatus>('loading')
  const [byType, setByType] = useState<ActivityByTypeRow[]>([])
  const [trend, setTrend] = useState<ActivityTrendPoint[]>([])
  const [feed, setFeed] = useState<ActivityFeedEvent[]>([])
  const [featureSummary, setFeatureSummary] = useState<FeatureUsageSummary | null>(null)
  const [featureBreakdown, setFeatureBreakdown] = useState<FeatureUsageBreakdownRow[]>([])
  const [extended, setExtended] = useState<OverviewExtendedMetrics | null>(null)
  const [newUsersPeriod, setNewUsersPeriod] = useState<number | null>(null)

  const load = useCallback(() => {
    setStatus('loading')
    Promise.all([
      getActivityByType(period),
      getActivityTrend(period),
      getRecentActivityFeed(period, 20),
      getFeatureUsageSummary(period),
      getFeatureUsageBreakdown(period),
      getOverviewExtendedMetrics(period),
      getUserGrowthTrend(period),
    ])
      .then(([byTypeResult, trendResult, feedResult, featureSummaryResult, featureBreakdownResult, extendedResult, growthResult]) => {
        setByType(byTypeResult)
        setTrend(trendResult)
        setFeed(feedResult)
        setFeatureSummary(featureSummaryResult)
        setFeatureBreakdown(featureBreakdownResult)
        setExtended(extendedResult)
        setNewUsersPeriod(growthResult.reduce((sum, point) => sum + point.newUsers, 0))
        setStatus('ready')
      })
      .catch(() => {
        setByType([])
        setTrend([])
        setFeed([])
        setFeatureSummary(null)
        setFeatureBreakdown([])
        setExtended(null)
        setNewUsersPeriod(null)
        setStatus('error')
      })
  }, [period])

  useEffect(() => {
    load()
  }, [load])

  return {
    period,
    setPeriod,
    status,
    byType,
    trend,
    feed,
    featureSummary,
    featureBreakdown,
    extended,
    newUsersPeriod,
    refresh: load,
  }
}

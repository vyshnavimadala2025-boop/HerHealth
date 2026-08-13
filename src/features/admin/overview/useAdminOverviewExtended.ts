import { useCallback, useEffect, useState } from 'react'
import {
  getOverviewExtendedMetrics,
  getRecentActivityPreview,
  getUserGrowthTrend,
} from '@/features/admin/overview/adminOverviewExtendedService'
import type {
  OverviewExtendedMetrics,
  OverviewPeriod,
  RecentActivityEvent,
  UserGrowthPoint,
} from '@/features/admin/overview/overviewExtendedTypes'
import {
  getFeatureUsageBreakdown,
  getFeatureUsageSummary,
} from '@/features/admin/featureUsage/adminFeatureUsageService'
import type { FeatureUsageBreakdownRow, FeatureUsageSummary } from '@/features/admin/featureUsage/types'

export type AdminOverviewExtendedStatus = 'loading' | 'ready' | 'error'

/**
 * Data for the Phase 3C Overview upgrade. Combines the three NEW RPCs
 * (0025) with the EXISTING Phase 3B feature-usage RPCs (0024) — imported
 * and called as-is, never re-implemented — so "Features Used", "Overall
 * Engagement", and the Top/Lowest-Adoption list are always the exact same
 * numbers shown on /admin/feature-usage, not a second calculation of them.
 */
export function useAdminOverviewExtended() {
  const [period, setPeriod] = useState<OverviewPeriod>(30)
  const [status, setStatus] = useState<AdminOverviewExtendedStatus>('loading')
  const [extended, setExtended] = useState<OverviewExtendedMetrics | null>(null)
  const [growth, setGrowth] = useState<UserGrowthPoint[]>([])
  const [activity, setActivity] = useState<RecentActivityEvent[]>([])
  const [featureSummary, setFeatureSummary] = useState<FeatureUsageSummary | null>(null)
  const [featureBreakdown, setFeatureBreakdown] = useState<FeatureUsageBreakdownRow[]>([])

  const load = useCallback(() => {
    setStatus('loading')
    Promise.all([
      getOverviewExtendedMetrics(period),
      getUserGrowthTrend(period),
      getRecentActivityPreview(10),
      getFeatureUsageSummary(period),
      getFeatureUsageBreakdown(period),
    ])
      .then(([extendedResult, growthResult, activityResult, featureSummaryResult, featureBreakdownResult]) => {
        setExtended(extendedResult)
        setGrowth(growthResult)
        setActivity(activityResult)
        setFeatureSummary(featureSummaryResult)
        setFeatureBreakdown(featureBreakdownResult)
        setStatus('ready')
      })
      .catch(() => {
        setExtended(null)
        setGrowth([])
        setActivity([])
        setFeatureSummary(null)
        setFeatureBreakdown([])
        setStatus('error')
      })
  }, [period])

  useEffect(() => {
    load()
  }, [load])

  return { period, setPeriod, status, extended, growth, activity, featureSummary, featureBreakdown, refresh: load }
}

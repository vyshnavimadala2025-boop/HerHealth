import { useCallback, useEffect, useState } from 'react'
import {
  getFeatureUsageBreakdown,
  getFeatureUsageSummary,
  getFeatureUsageTrend,
} from '@/features/admin/featureUsage/adminFeatureUsageService'
import type {
  FeatureUsageBreakdownRow,
  FeatureUsageSummary,
  FeatureUsageTrendPoint,
  UsagePeriod,
} from '@/features/admin/featureUsage/types'

export type AdminFeatureUsageStatus = 'loading' | 'ready' | 'error'

export function useAdminFeatureUsage() {
  const [period, setPeriod] = useState<UsagePeriod>(30)
  const [status, setStatus] = useState<AdminFeatureUsageStatus>('loading')
  const [summary, setSummary] = useState<FeatureUsageSummary | null>(null)
  const [breakdown, setBreakdown] = useState<FeatureUsageBreakdownRow[]>([])
  const [trend, setTrend] = useState<FeatureUsageTrendPoint[]>([])

  const load = useCallback(() => {
    setStatus('loading')
    Promise.all([getFeatureUsageSummary(period), getFeatureUsageBreakdown(period), getFeatureUsageTrend(period)])
      .then(([summaryResult, breakdownResult, trendResult]) => {
        setSummary(summaryResult)
        setBreakdown(breakdownResult)
        setTrend(trendResult)
        setStatus('ready')
      })
      .catch(() => {
        setSummary(null)
        setBreakdown([])
        setTrend([])
        setStatus('error')
      })
  }, [period])

  useEffect(() => {
    load()
  }, [load])

  return { period, setPeriod, status, summary, breakdown, trend, refresh: load }
}

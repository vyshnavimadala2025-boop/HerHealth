import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getRecentCheckIns } from '@/features/checkins/checkinService'
import { getPeriodRecords } from '@/features/periods/periodService'
import {
  calculateCycleLength,
  calculateEstimatedNextPeriod,
} from '@/features/periods/cycleCalculations'
import { calculateWeeklyCheckInSummary } from '@/features/insights/weeklySummary'
import { calculateMoodTrend } from '@/features/insights/moodTrend'
import { calculateEnergyTrend } from '@/features/insights/energyTrend'
import { generateInsights } from '@/features/insights/insightEngine'
import type { CheckIn } from '@/features/checkins/types'
import type { PeriodRecord } from '@/features/periods/types'
import type { WeeklyCheckInSummary } from '@/features/insights/types'

const TREND_FETCH_LIMIT = 14

type LoadStatus = 'loading' | 'ready' | 'error'

const EMPTY_WEEKLY_SUMMARY: WeeklyCheckInSummary = {
  count: 0,
  consistencyPercent: 0,
  mostCommonMood: null,
  mostCommonEnergyLevel: null,
  mostCommonWellbeing: null,
}

/**
 * Single data source for every dashboard insights card. Fetches check-ins
 * and period records exactly once (not once per card), then derives all
 * summaries/trends/insights from that one fetch via pure functions.
 */
export function useInsightsData() {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [periodRecords, setPeriodRecords] = useState<PeriodRecord[]>([])

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const [checkInResult, periodResult] = await Promise.all([
        getRecentCheckIns(user.id, TREND_FETCH_LIMIT),
        getPeriodRecords(user.id),
      ])
      setCheckIns(checkInResult)
      setPeriodRecords(periodResult)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const weeklySummary =
    status === 'ready' ? calculateWeeklyCheckInSummary(checkIns) : EMPTY_WEEKLY_SUMMARY
  const moodTrend = status === 'ready' ? calculateMoodTrend(checkIns) : 'Limited data'
  const energyTrend = status === 'ready' ? calculateEnergyTrend(checkIns) : 'Limited data'
  const cycleLength =
    status === 'ready' ? calculateCycleLength(periodRecords.map((record) => record.startDate)) : null
  const estimatedNextPeriod =
    status === 'ready'
      ? calculateEstimatedNextPeriod(periodRecords[0]?.startDate ?? null, cycleLength)
      : null

  const insights =
    status === 'ready'
      ? generateInsights({
          weeklySummary,
          moodTrend,
          energyTrend,
          cycle: {
            cycleLength,
            estimatedNextPeriod,
            periodRecordCount: periodRecords.length,
          },
        })
      : []

  return {
    status,
    weeklySummary,
    moodTrend,
    energyTrend,
    insights,
    periodRecords,
    cycleLength,
    estimatedNextPeriod,
    refresh: load,
  }
}

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getCheckInsInRange } from '@/features/checkins/checkinService'
import { getJournalEntriesInRange } from '@/features/journal/journalService'
import { getGoals } from '@/features/goals/goalService'
import { getAllGoalProgressEntries } from '@/features/goals/goalProgressService'
import { getPeriodRecords } from '@/features/periods/periodService'
import { calculateCycleLength, calculateEstimatedNextPeriod } from '@/features/periods/cycleCalculations'
import { calculateMoodTrend } from '@/features/insights/moodTrend'
import { calculateEnergyTrend } from '@/features/insights/energyTrend'
import { addDays, getLocalDateString } from '@/features/periods/dateUtils'
import {
  buildTrendBucketRanges,
  computeHealthTrendBuckets,
  buildPatternIndicators,
  buildTrendHighlights,
  HEALTH_TREND_RANGES,
  type HealthTrendRangeKey,
  type HealthTrendBucket,
  type PatternIndicator,
} from '@/features/insights/healthTrendsCalculations'
import type { CheckIn } from '@/features/checkins/types'
import type { PeriodRecord } from '@/features/periods/types'

type LoadStatus = 'loading' | 'ready' | 'error'

/**
 * Single data source for the Health Trends page. Fetches check-ins,
 * journal entries, goal progress, and period records once per selected
 * range (using the same service functions as Reports/Weekly/Monthly, just
 * windowed wider), then derives every bucketed series and indicator from
 * that one fetch via the pure functions in healthTrendsCalculations.ts —
 * no new Supabase query shape, no duplicated business logic.
 */
export function useHealthTrendsData(rangeKey: HealthTrendRangeKey) {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [periodRecords, setPeriodRecords] = useState<PeriodRecord[]>([])
  const [buckets, setBuckets] = useState<HealthTrendBucket[]>([])

  const rangeConfig = HEALTH_TREND_RANGES.find((entry) => entry.key === rangeKey) ?? HEALTH_TREND_RANGES[0]

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const today = getLocalDateString()
      const windowStart = addDays(today, -(rangeConfig.days - 1))

      const [checkInResult, journalResult, goalsResult, progressResult, periodResult] = await Promise.all([
        getCheckInsInRange(user.id, { startDate: windowStart, endDate: today }),
        getJournalEntriesInRange(user.id, { startDate: windowStart, endDate: today }),
        getGoals(user.id),
        getAllGoalProgressEntries(user.id, { startDate: windowStart, endDate: today }),
        getPeriodRecords(user.id),
      ])

      const bucketRanges = buildTrendBucketRanges(today, rangeKey)
      const computedBuckets = computeHealthTrendBuckets({
        buckets: bucketRanges,
        checkIns: checkInResult,
        journalEntries: journalResult,
        goals: goalsResult,
        goalProgressEntries: progressResult,
      })

      setCheckIns(checkInResult)
      setPeriodRecords(periodResult)
      setBuckets(computedBuckets)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user, rangeKey, rangeConfig.days])

  useEffect(() => {
    load()
  }, [load])

  const checkInsNewestFirst = [...checkIns].reverse()
  const moodTrend = status === 'ready' ? calculateMoodTrend(checkInsNewestFirst) : 'Limited data'
  const energyTrend = status === 'ready' ? calculateEnergyTrend(checkInsNewestFirst) : 'Limited data'
  const cycleLength = status === 'ready' ? calculateCycleLength(periodRecords.map((record) => record.startDate)) : null
  const estimatedNextPeriod =
    status === 'ready' ? calculateEstimatedNextPeriod(periodRecords[0]?.startDate ?? null, cycleLength) : null

  const patternIndicators: PatternIndicator[] =
    status === 'ready' ? buildPatternIndicators({ moodTrend, energyTrend, buckets }) : []
  const highlights: string[] = status === 'ready' ? buildTrendHighlights(buckets, rangeConfig.label) : []

  return {
    status,
    rangeConfig,
    buckets,
    periodRecords,
    moodTrend,
    energyTrend,
    cycleLength,
    estimatedNextPeriod,
    patternIndicators,
    highlights,
    retry: load,
  }
}

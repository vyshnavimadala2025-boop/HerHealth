import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getCheckInCount, getCheckInsInRange } from '@/features/checkins/checkinService'
import { getLocalDateString } from '@/features/checkins/types'
import { addDays } from '@/features/periods/dateUtils'
import { calculateWeeklyCheckInSummary } from '@/features/insights/weeklySummary'
import { calculateMoodTrend } from '@/features/insights/moodTrend'
import { calculateEnergyTrend } from '@/features/insights/energyTrend'
import {
  calculateConsistencyScore,
  buildLifestyleTimeline,
  SCORE_WINDOW_DAYS,
  type TimelineRange,
} from '@/features/lifestyleIntelligence/lifestyleCalculations'
import type { CheckIn } from '@/features/checkins/types'
import type { WeeklyCheckInSummary } from '@/features/insights/types'

/** ~3 months of check-ins, enough for every timeline range up to "3 Months". */
const HISTORY_WINDOW_DAYS = 90

type LoadStatus = 'loading' | 'ready' | 'error'

const EMPTY_WEEKLY_SUMMARY: WeeklyCheckInSummary = {
  count: 0,
  consistencyPercent: 0,
  mostCommonMood: null,
  mostCommonEnergyLevel: null,
  mostCommonWellbeing: null,
}

/**
 * Lifestyle Intelligence is a presentation-layer feature per its spec: no
 * new tables, no new services. This hook only ever calls the same,
 * already existing check-in service used elsewhere in the app, then
 * derives everything else with pure functions.
 */
export function useLifestyleIntelligenceData(timelineRange: TimelineRange) {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [monthlyCheckInCount, setMonthlyCheckInCount] = useState(0)

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const today = getLocalDateString()
      const windowStart = addDays(today, -(HISTORY_WINDOW_DAYS - 1))
      const scoreWindowStart = addDays(today, -(SCORE_WINDOW_DAYS - 1))

      const [history, monthlyCount] = await Promise.all([
        getCheckInsInRange(user.id, { startDate: windowStart, endDate: today }),
        getCheckInCount(user.id, { startDate: scoreWindowStart, endDate: today }),
      ])
      setCheckIns(history)
      setMonthlyCheckInCount(monthlyCount)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const checkInsNewestFirst = [...checkIns].reverse()
  const weeklySummary = status === 'ready' ? calculateWeeklyCheckInSummary(checkInsNewestFirst) : EMPTY_WEEKLY_SUMMARY
  const moodTrend = status === 'ready' ? calculateMoodTrend(checkInsNewestFirst) : 'Limited data'
  const energyTrend = status === 'ready' ? calculateEnergyTrend(checkInsNewestFirst) : 'Limited data'
  const consistencyScore = status === 'ready' ? calculateConsistencyScore(monthlyCheckInCount) : 0
  const timeline = status === 'ready' ? buildLifestyleTimeline(checkIns, getLocalDateString(), timelineRange) : []

  return {
    status,
    weeklySummary,
    moodTrend,
    energyTrend,
    consistencyScore,
    timeline,
    refresh: load,
  }
}

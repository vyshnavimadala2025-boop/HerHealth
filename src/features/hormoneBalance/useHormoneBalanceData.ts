import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getRecentCheckIns, getTodayCheckIn } from '@/features/checkins/checkinService'
import { getLocalDateString } from '@/features/checkins/types'
import { getPeriodRecords } from '@/features/periods/periodService'
import { calculateCycleLength } from '@/features/periods/cycleCalculations'
import { calculateWeeklyCheckInSummary } from '@/features/insights/weeklySummary'
import { calculateMoodTrend } from '@/features/insights/moodTrend'
import { calculateEnergyTrend } from '@/features/insights/energyTrend'
import { estimateCyclePhase, buildWeeklyProgressTimeline } from '@/features/hormoneBalance/hormoneCalculations'
import type { CheckIn } from '@/features/checkins/types'
import type { PeriodRecord } from '@/features/periods/types'
import type { WeeklyCheckInSummary } from '@/features/insights/types'

/** ~8 weeks of check-ins, enough for the weekly progress timeline. */
const TIMELINE_FETCH_LIMIT = 56

type LoadStatus = 'loading' | 'ready' | 'error'

const EMPTY_WEEKLY_SUMMARY: WeeklyCheckInSummary = {
  count: 0,
  consistencyPercent: 0,
  mostCommonMood: null,
  mostCommonEnergyLevel: null,
  mostCommonWellbeing: null,
}

/**
 * Hormone Balance is a presentation-layer feature per its spec: no new
 * tables, no new services. This hook only ever calls the same, already
 * existing check-in and period services used elsewhere in the app, then
 * derives everything else with pure functions.
 */
export function useHormoneBalanceData() {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [periodRecords, setPeriodRecords] = useState<PeriodRecord[]>([])

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const [today, recentCheckIns, periods] = await Promise.all([
        getTodayCheckIn(user.id),
        getRecentCheckIns(user.id, TIMELINE_FETCH_LIMIT),
        getPeriodRecords(user.id),
      ])
      setTodayCheckIn(today)
      setCheckIns(recentCheckIns)
      setPeriodRecords(periods)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const weeklySummary = status === 'ready' ? calculateWeeklyCheckInSummary(checkIns) : EMPTY_WEEKLY_SUMMARY
  const moodTrend = status === 'ready' ? calculateMoodTrend(checkIns) : 'Limited data'
  const energyTrend = status === 'ready' ? calculateEnergyTrend(checkIns) : 'Limited data'
  const cycleLength =
    status === 'ready' ? calculateCycleLength(periodRecords.map((record) => record.startDate)) : null
  const cyclePhaseEstimate =
    status === 'ready'
      ? estimateCyclePhase(periodRecords[0]?.startDate ?? null, cycleLength, getLocalDateString())
      : null
  const weeklyProgress = status === 'ready' ? buildWeeklyProgressTimeline(checkIns, getLocalDateString()) : []

  return {
    status,
    todayCheckIn,
    periodRecords,
    weeklySummary,
    moodTrend,
    energyTrend,
    cyclePhaseEstimate,
    weeklyProgress,
    refresh: load,
  }
}

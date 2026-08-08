import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getCheckInsInRange } from '@/features/checkins/checkinService'
import { getJournalEntryCount } from '@/features/journal/journalService'
import { getGoals } from '@/features/goals/goalService'
import { getAllGoalProgressEntries } from '@/features/goals/goalProgressService'
import {
  calculateCheckInConsistency,
  calculateGoalProgressSummary,
  calculateMoodEnergyWellbeingBreakdown,
} from '@/features/reports/reportCalculations'
import { getCustomRange } from '@/features/reports/dateRangePresets'
import { addDays } from '@/features/periods/dateUtils'
import { MOOD_SCORES } from '@/features/insights/moodTrend'
import { ENERGY_SCORES } from '@/features/insights/energyTrend'
import { weightedAverageScore } from '@/features/insights/monthlyStats'
import type { ReportDateRange } from '@/features/reports/types'

type LoadStatus = 'loading' | 'ready' | 'error'

export interface PreviousPeriodSnapshot {
  range: ReportDateRange
  checkInCount: number
  consistencyPercent: number
  avgMood: number | null
  avgEnergy: number | null
  journalCount: number
  goalsCompletedInRange: number
  hasActivity: boolean
}

/**
 * Fetches the 30-day window immediately before the Monthly Summary's
 * current range, reusing the exact same service functions and pure
 * calculations (calculateCheckInConsistency, calculateMoodEnergyWellbeingBreakdown,
 * calculateGoalProgressSummary) already used by useReportData/reportCalculations
 * for the current range — so "vs last month" is computed identically to
 * this month's own numbers, not via a second implementation. `hasActivity`
 * lets the caller show a polished empty state instead of a comparison when
 * the user doesn't yet have enough history behind the current range.
 */
export function usePreviousPeriodSummary(currentRangeStart: string, windowDays: number) {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [snapshot, setSnapshot] = useState<PreviousPeriodSnapshot | null>(null)

  const previousEnd = currentRangeStart ? addDays(currentRangeStart, -1) : ''
  const previousStart = previousEnd ? addDays(previousEnd, -(windowDays - 1)) : ''

  const load = useCallback(async () => {
    if (!user || !previousStart) return
    setStatus('loading')
    try {
      const previousRange = getCustomRange(previousStart, previousEnd)
      const [checkIns, journalCount, goals, progressEntries] = await Promise.all([
        getCheckInsInRange(user.id, { startDate: previousStart, endDate: previousEnd }),
        getJournalEntryCount(user.id, { startDate: previousStart, endDate: previousEnd }),
        getGoals(user.id),
        getAllGoalProgressEntries(user.id, { startDate: previousStart, endDate: previousEnd }),
      ])

      const consistency = calculateCheckInConsistency(checkIns, previousRange)
      const goalSummary = calculateGoalProgressSummary(goals, progressEntries, previousRange)
      const breakdown = calculateMoodEnergyWellbeingBreakdown(checkIns, previousRange)

      setSnapshot({
        range: previousRange,
        checkInCount: consistency.count,
        consistencyPercent: consistency.consistencyPercent,
        avgMood: weightedAverageScore(breakdown.mood, MOOD_SCORES),
        avgEnergy: weightedAverageScore(breakdown.energyLevel, ENERGY_SCORES),
        journalCount,
        goalsCompletedInRange: goalSummary.goalsCompletedInRange,
        hasActivity: checkIns.length > 0 || journalCount > 0 || progressEntries.length > 0,
      })
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user, previousStart, previousEnd])

  useEffect(() => {
    load()
  }, [load])

  return { status, snapshot, refresh: load }
}

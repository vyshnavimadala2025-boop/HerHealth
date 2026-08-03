import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getCheckInsInRange } from '@/features/checkins/checkinService'
import { getPeriodRecords } from '@/features/periods/periodService'
import { getJournalEntriesInRange } from '@/features/journal/journalService'
import { getGoals } from '@/features/goals/goalService'
import { getAllGoalProgressEntries } from '@/features/goals/goalProgressService'
import { getReminderPreferences } from '@/features/reminders/reminderService'
import { getPcosTrackingEnabled, getPcosWellnessEntries } from '@/features/pcosWellness/pcosWellnessService'
import {
  calculateCheckInConsistency,
  calculateCycleReportSummary,
  calculateGoalProgressSummary,
  calculateMoodEnergyWellbeingBreakdown,
  calculatePcosWellnessSummary,
  calculateReminderPreferencesSummary,
  buildTimeline,
} from '@/features/reports/reportCalculations'
import { getCustomRange, getDefaultReportRange, getPresetRange } from '@/features/reports/dateRangePresets'
import { downloadExport } from '@/features/reports/exportService'
import type { CheckIn } from '@/features/checkins/types'
import type { PeriodRecord } from '@/features/periods/types'
import type { JournalEntry } from '@/features/journal/types'
import type { WellnessGoal, GoalProgressEntry } from '@/features/goals/types'
import type { ReminderPreference } from '@/features/reminders/types'
import type { PcosWellnessEntry } from '@/features/pcosWellness/types'
import type { ReportDateRange, ReportSummary, TimelineEntry } from '@/features/reports/types'

type LoadStatus = 'loading' | 'ready' | 'error'
type ExportStatus = 'idle' | 'loading' | 'error'

/**
 * Single centralized data source for the whole Reports page. Data is split
 * into two independently-loaded groups so switching the report date range
 * never refetches data that doesn't depend on it:
 * - "static" (period records, goals, reminder preferences, PCOS opt-in +
 *   entries) is fetched once per session and is already complete history —
 *   these queries have no date filter applied server-side.
 * - "ranged" (check-ins, journal entries, goal progress entries) is
 *   refetched whenever the selected range changes, using the range-aware
 *   service functions.
 * No report card or timeline component fetches independently — every value
 * they render is derived here via the pure functions in
 * reportCalculations.ts.
 */
export function useReportData() {
  const { user } = useAuth()
  const [range, setRange] = useState<ReportDateRange>(() => getDefaultReportRange())

  const [staticStatus, setStaticStatus] = useState<LoadStatus>('loading')
  const [periodRecords, setPeriodRecords] = useState<PeriodRecord[]>([])
  const [goals, setGoals] = useState<WellnessGoal[]>([])
  const [reminderPreferences, setReminderPreferences] = useState<ReminderPreference[]>([])
  const [pcosWellnessEnabled, setPcosWellnessEnabled] = useState(false)
  const [pcosWellnessEntries, setPcosWellnessEntries] = useState<PcosWellnessEntry[] | null>(null)

  const [rangedStatus, setRangedStatus] = useState<LoadStatus>('loading')
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [goalProgressEntries, setGoalProgressEntries] = useState<GoalProgressEntry[]>([])

  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle')

  const loadStatic = useCallback(async () => {
    if (!user) return
    setStaticStatus('loading')
    try {
      const enabled = await getPcosTrackingEnabled(user.id)
      const [periodResult, goalResult, reminderResult, pcosResult] = await Promise.all([
        getPeriodRecords(user.id),
        getGoals(user.id),
        getReminderPreferences(user.id),
        enabled ? getPcosWellnessEntries(user.id) : Promise.resolve(null),
      ])
      setPeriodRecords(periodResult)
      setGoals(goalResult)
      setReminderPreferences(reminderResult)
      setPcosWellnessEnabled(enabled)
      setPcosWellnessEntries(pcosResult)
      setStaticStatus('ready')
    } catch {
      setStaticStatus('error')
    }
  }, [user])

  const loadRanged = useCallback(async () => {
    if (!user) return
    setRangedStatus('loading')
    try {
      const [checkInResult, journalResult, progressResult] = await Promise.all([
        getCheckInsInRange(user.id, { startDate: range.startDate, endDate: range.endDate }),
        getJournalEntriesInRange(user.id, { startDate: range.startDate, endDate: range.endDate }),
        getAllGoalProgressEntries(user.id, { startDate: range.startDate, endDate: range.endDate }),
      ])
      setCheckIns(checkInResult)
      setJournalEntries(journalResult)
      setGoalProgressEntries(progressResult)
      setRangedStatus('ready')
    } catch {
      setRangedStatus('error')
    }
  }, [user, range])

  useEffect(() => {
    loadStatic()
  }, [loadStatic])

  useEffect(() => {
    loadRanged()
  }, [loadRanged])

  const status: LoadStatus =
    staticStatus === 'error' || rangedStatus === 'error'
      ? 'error'
      : staticStatus === 'ready' && rangedStatus === 'ready'
        ? 'ready'
        : 'loading'

  const summary: ReportSummary | null =
    status === 'ready'
      ? {
          checkIns: calculateCheckInConsistency(checkIns, range),
          moodEnergyWellbeing: calculateMoodEnergyWellbeingBreakdown(checkIns, range),
          cycle: calculateCycleReportSummary(periodRecords, range),
          goals: calculateGoalProgressSummary(goals, goalProgressEntries, range),
          reminders: calculateReminderPreferencesSummary(reminderPreferences),
          pcosWellness: pcosWellnessEnabled
            ? calculatePcosWellnessSummary(pcosWellnessEntries ?? [], range)
            : null,
        }
      : null

  const timeline: TimelineEntry[] =
    status === 'ready'
      ? buildTimeline({
          checkIns,
          periodRecords,
          journalEntries,
          goals,
          goalProgressEntries,
          reminderPreferences,
          pcosWellnessEntries: pcosWellnessEnabled ? pcosWellnessEntries : null,
          range,
        })
      : []

  const setPresetRange = useCallback((preset: '7d' | '30d' | '90d') => {
    setRange(getPresetRange(preset))
  }, [])

  const setCustomRangeValue = useCallback((startDate: string, endDate: string) => {
    setRange(getCustomRange(startDate, endDate))
  }, [])

  const retry = useCallback(() => {
    loadStatic()
    loadRanged()
  }, [loadStatic, loadRanged])

  /**
   * Exports the user's complete history, not just the selected report
   * range. Period records, goals, reminder preferences, and PCOS entries
   * are already loaded in full (those queries are never range-filtered);
   * only check-ins, journal entries, and goal progress are re-fetched here
   * with no range, since the main hook load deliberately windows those
   * three to the selected report range.
   */
  const exportData = useCallback(
    async (format: 'json' | 'csv') => {
      if (!user) return
      setExportStatus('loading')
      try {
        const [allCheckIns, allJournalEntries, allGoalProgressEntries] = await Promise.all([
          getCheckInsInRange(user.id),
          getJournalEntriesInRange(user.id),
          getAllGoalProgressEntries(user.id),
        ])
        downloadExport(format, {
          checkIns: allCheckIns,
          periodRecords,
          journalEntries: allJournalEntries,
          goals,
          goalProgressEntries: allGoalProgressEntries,
          reminderPreferences,
          pcosWellnessEntries: pcosWellnessEnabled ? pcosWellnessEntries : null,
        })
        setExportStatus('idle')
      } catch {
        setExportStatus('error')
      }
    },
    [user, periodRecords, goals, reminderPreferences, pcosWellnessEnabled, pcosWellnessEntries],
  )

  return {
    range,
    status,
    summary,
    timeline,
    setPresetRange,
    setCustomRangeValue,
    retry,
    pcosWellnessEnabled,
    exportStatus,
    exportData,
  }
}

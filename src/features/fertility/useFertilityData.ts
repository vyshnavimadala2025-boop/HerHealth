import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getFertilityEntries } from '@/features/fertility/fertilityService'
import { getPeriodRecords } from '@/features/periods/periodService'
import { calculateCycleLength } from '@/features/periods/cycleCalculations'
import { calculateFertilityWindow, calculateHabitConsistency } from '@/features/fertility/fertilityCalculations'
import { HABIT_OPTIONS } from '@/features/fertility/types'
import { getLocalDateString, addDays } from '@/features/periods/dateUtils'
import type { FertilityEntry } from '@/features/fertility/types'

type LoadStatus = 'loading' | 'ready' | 'error'

/**
 * Single data source for the whole Fertility Journey feature — fetches
 * fertility_entries and period_records exactly once, then derives the
 * fertile-window estimate, cycle day, and habit consistency from that one
 * fetch via pure functions (same shape as useInsightsData's approach).
 */
export function useFertilityData() {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [entries, setEntries] = useState<FertilityEntry[]>([])
  const [periodStartDates, setPeriodStartDates] = useState<string[]>([])

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const [entryResult, periodResult] = await Promise.all([
        getFertilityEntries(user.id),
        getPeriodRecords(user.id),
      ])
      setEntries(entryResult)
      setPeriodStartDates(periodResult.map((record) => record.startDate))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const cycleLength = status === 'ready' ? calculateCycleLength(periodStartDates) : null
  const lastPeriodStart = periodStartDates[0] ?? null
  const fertilityWindow = calculateFertilityWindow(lastPeriodStart, cycleLength)

  const sevenDaysAgo = addDays(getLocalDateString(), -6)
  const entriesThisWeek = entries.filter((entry) => entry.entryDate >= sevenDaysAgo)
  const habitConsistencyPercent = calculateHabitConsistency(entriesThisWeek, HABIT_OPTIONS.length)

  const todayEntry = entries.find((entry) => entry.entryDate === getLocalDateString()) ?? null

  return {
    status,
    entries,
    todayEntry,
    hasCycleData: periodStartDates.length > 0,
    cycleLength,
    fertilityWindow,
    entriesThisWeek,
    habitConsistencyPercent,
    refresh: load,
  }
}

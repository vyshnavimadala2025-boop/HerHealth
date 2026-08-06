import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getPregnancyProfile } from '@/features/pregnancy/pregnancyProfileService'
import { getPregnancyEntries } from '@/features/pregnancy/pregnancyEntryService'
import { calculatePregnancyProgress, calculateWellnessScore } from '@/features/pregnancy/pregnancyCalculations'
import { NUTRITION_HABIT_OPTIONS } from '@/features/pregnancy/types'
import { getLocalDateString, addDays } from '@/features/periods/dateUtils'
import type { PregnancyEntry, PregnancyProfile } from '@/features/pregnancy/types'

type LoadStatus = 'loading' | 'ready' | 'error'

/**
 * Single data source for the whole Baby Growth feature. `profile === null`
 * after a 'ready' status means the user hasn't set up their due date yet
 * — callers should show the setup flow, not an error.
 */
export function usePregnancyData() {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [profile, setProfile] = useState<PregnancyProfile | null>(null)
  const [entries, setEntries] = useState<PregnancyEntry[]>([])

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const [profileResult, entriesResult] = await Promise.all([
        getPregnancyProfile(user.id),
        getPregnancyEntries(user.id),
      ])
      setProfile(profileResult)
      setEntries(entriesResult)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const progress = profile ? calculatePregnancyProgress(profile.dueDate) : null

  const sevenDaysAgo = addDays(getLocalDateString(), -6)
  const entriesThisWeek = entries.filter((entry) => entry.entryDate >= sevenDaysAgo)
  const wellnessScore = calculateWellnessScore(entriesThisWeek, NUTRITION_HABIT_OPTIONS.length)

  const todayEntry = entries.find((entry) => entry.entryDate === getLocalDateString()) ?? null

  return {
    status,
    profile,
    entries,
    todayEntry,
    entriesThisWeek,
    progress,
    wellnessScore,
    refresh: load,
  }
}

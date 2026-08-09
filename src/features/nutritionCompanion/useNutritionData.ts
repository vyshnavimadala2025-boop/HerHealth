import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  getNutritionEntries,
  saveNutritionEntry,
  type NutritionEntryInput,
} from '@/features/nutritionCompanion/nutritionService'
import { addDays, getLocalDateString } from '@/features/periods/dateUtils'
import type { NutritionEntry } from '@/features/nutritionCompanion/types'

type LoadStatus = 'loading' | 'ready' | 'error'

/** Same 90-day history window sleepIntelligence/useSleepData.ts and useLifestyleIntelligenceData.ts already use. */
const HISTORY_WINDOW_DAYS = 90

function sortEntries(entries: NutritionEntry[]): NutritionEntry[] {
  return [...entries].sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1))
}

export function useNutritionData() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<NutritionEntry[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const today = getLocalDateString()
      const windowStart = addDays(today, -(HISTORY_WINDOW_DAYS - 1))
      const result = await getNutritionEntries(user.id, { startDate: windowStart, endDate: today })
      setEntries(sortEntries(result))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  /** save() always upserts by (user_id, entry_date) — the same call handles both a brand-new day and editing an existing one, reconciled by date, not id. */
  const save = useCallback(
    async (input: NutritionEntryInput) => {
      if (!user) throw new Error('You must be signed in to save a nutrition entry.')
      const saved = await saveNutritionEntry(user.id, input)
      setEntries((current) => sortEntries([...current.filter((entry) => entry.entryDate !== saved.entryDate), saved]))
      return saved
    },
    [user],
  )

  /** Local-state-only removal — the delete service call happens in DeleteNutritionEntryDialog itself. */
  const removeEntry = useCallback((entryId: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== entryId))
  }, [])

  return {
    entries,
    status,
    save,
    removeEntry,
    retry: load,
  }
}

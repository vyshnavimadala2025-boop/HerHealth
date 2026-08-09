import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  getStressRecoveryEntries,
  saveStressRecoveryEntry,
  type StressRecoveryEntryInput,
} from '@/features/stressRecovery/stressRecoveryService'
import { getSleepEntries } from '@/features/sleepIntelligence/sleepService'
import { addDays, getLocalDateString } from '@/features/periods/dateUtils'
import type { StressRecoveryEntry } from '@/features/stressRecovery/types'
import type { SleepEntry } from '@/features/sleepIntelligence/types'

type LoadStatus = 'loading' | 'ready' | 'error'

/** Same 90-day history window sleepIntelligence/useSleepData.ts and nutritionCompanion/useNutritionData.ts already use. */
const HISTORY_WINDOW_DAYS = 90

function sortEntries(entries: StressRecoveryEntry[]): StressRecoveryEntry[] {
  return [...entries].sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1))
}

/**
 * The core stress/recovery fetch is required (its failure is this page's
 * own error state). The sleep-entries fetch is isolated in its own
 * try/catch — it's only ever supplementary context for the "sleep and
 * recovery changed together" observation (Stage 3D requirement #11), so
 * its failure must never take down this page, matching the resilience
 * pattern established by useHealthTrendsData.ts's isolated goals fetch.
 */
export function useStressRecoveryData() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<StressRecoveryEntry[]>([])
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const today = getLocalDateString()
      const windowStart = addDays(today, -(HISTORY_WINDOW_DAYS - 1))
      const result = await getStressRecoveryEntries(user.id, { startDate: windowStart, endDate: today })
      setEntries(sortEntries(result))

      try {
        const sleepResult = await getSleepEntries(user.id, { startDate: windowStart, endDate: today })
        setSleepEntries(sleepResult)
      } catch {
        setSleepEntries([])
      }

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
    async (input: StressRecoveryEntryInput) => {
      if (!user) throw new Error('You must be signed in to save a stress and recovery entry.')
      const saved = await saveStressRecoveryEntry(user.id, input)
      setEntries((current) => sortEntries([...current.filter((entry) => entry.entryDate !== saved.entryDate), saved]))
      return saved
    },
    [user],
  )

  /** Local-state-only removal — the delete service call happens in DeleteStressRecoveryEntryDialog itself. */
  const removeEntry = useCallback((entryId: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== entryId))
  }, [])

  return {
    entries,
    sleepEntries,
    status,
    save,
    removeEntry,
    retry: load,
  }
}

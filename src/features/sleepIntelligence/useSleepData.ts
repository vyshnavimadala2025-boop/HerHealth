import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getSleepEntries, saveSleepEntry, type SleepEntryInput } from '@/features/sleepIntelligence/sleepService'
import { addDays, getLocalDateString } from '@/features/periods/dateUtils'
import type { SleepEntry } from '@/features/sleepIntelligence/types'

type LoadStatus = 'loading' | 'ready' | 'error'

/** Same 90-day history window useLifestyleIntelligenceData.ts already uses — enough for every summary/trend this page shows. */
const HISTORY_WINDOW_DAYS = 90

function sortEntries(entries: SleepEntry[]): SleepEntry[] {
  return [...entries].sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1))
}

export function useSleepData() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const today = getLocalDateString()
      const windowStart = addDays(today, -(HISTORY_WINDOW_DAYS - 1))
      const result = await getSleepEntries(user.id, { startDate: windowStart, endDate: today })
      setEntries(sortEntries(result))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  /** save() always upserts by (user_id, entry_date) — the same call handles both a brand-new night and editing an existing one, so entries are reconciled by date, not id. */
  const save = useCallback(
    async (input: SleepEntryInput) => {
      if (!user) throw new Error('You must be signed in to save a sleep entry.')
      const saved = await saveSleepEntry(user.id, input)
      setEntries((current) => sortEntries([...current.filter((entry) => entry.entryDate !== saved.entryDate), saved]))
      return saved
    },
    [user],
  )

  /** Local-state-only removal — the delete service call happens in DeleteSleepEntryDialog itself. */
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

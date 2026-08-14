import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  createJournalEntry,
  deleteJournalEntry,
  listJournalEntries,
  type JournalEntryInput,
} from '@/features/aiIntelligence/symptomJournalService'
import type { AiSymptomJournalEntry } from '@/features/aiIntelligence/types'

type LoadStatus = 'loading' | 'ready' | 'error'

export function useAiSymptomJournal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<AiSymptomJournalEntry[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      setEntries(await listJournalEntries(user.id))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const create = useCallback(
    async (input: JournalEntryInput) => {
      if (!user) throw new Error('You must be signed in to save a journal entry.')
      const entry = await createJournalEntry(input)
      setEntries((current) => [entry, ...current])
      return entry
    },
    [user],
  )

  const remove = useCallback(async (entryId: string) => {
    await deleteJournalEntry(entryId)
    setEntries((current) => current.filter((item) => item.id !== entryId))
  }, [])

  return { entries, status, create, remove, retry: load }
}

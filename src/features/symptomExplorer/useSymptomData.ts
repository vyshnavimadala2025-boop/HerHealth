import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  createSymptomEntry,
  getSymptomEntries,
  updateSymptomEntry,
  type SymptomEntryInput,
} from '@/features/symptomExplorer/symptomService'
import type { SymptomEntry } from '@/features/symptomExplorer/types'

type LoadStatus = 'loading' | 'ready' | 'error'

function sortEntries(entries: SymptomEntry[]): SymptomEntry[] {
  return [...entries].sort((a, b) => {
    if (a.entryDate !== b.entryDate) return a.entryDate < b.entryDate ? 1 : -1
    return a.createdAt < b.createdAt ? 1 : -1
  })
}

export function useSymptomData() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<SymptomEntry[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const result = await getSymptomEntries(user.id)
      setEntries(sortEntries(result))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const addEntry = useCallback((entry: SymptomEntry) => {
    setEntries((current) => sortEntries([...current, entry]))
  }, [])

  const replaceEntry = useCallback((entry: SymptomEntry) => {
    setEntries((current) => sortEntries(current.map((item) => (item.id === entry.id ? entry : item))))
  }, [])

  /** Local-state-only removal — the delete service call happens in DeleteSymptomEntryDialog itself. */
  const removeEntry = useCallback((entryId: string) => {
    setEntries((current) => current.filter((item) => item.id !== entryId))
  }, [])

  const create = useCallback(
    async (input: SymptomEntryInput) => {
      if (!user) throw new Error('You must be signed in to save a symptom entry.')
      const saved = await createSymptomEntry(user.id, input)
      addEntry(saved)
      return saved
    },
    [user, addEntry],
  )

  const update = useCallback(
    async (entryId: string, input: SymptomEntryInput) => {
      const saved = await updateSymptomEntry(entryId, input)
      replaceEntry(saved)
      return saved
    },
    [replaceEntry],
  )

  return {
    entries,
    status,
    create,
    update,
    removeEntry,
    retry: load,
  }
}

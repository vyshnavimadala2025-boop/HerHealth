import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  createPcosWellnessEntry,
  getPcosTrackingEnabled,
  getPcosWellnessEntries,
  setPcosTrackingEnabled,
  updatePcosWellnessEntry,
  type PcosWellnessEntryInput,
} from '@/features/pcosWellness/pcosWellnessService'
import type { PcosWellnessEntry } from '@/features/pcosWellness/types'

type LoadStatus = 'loading' | 'ready' | 'error'

function sortEntries(entries: PcosWellnessEntry[]): PcosWellnessEntry[] {
  return [...entries].sort((a, b) => {
    if (a.entryDate !== b.entryDate) return a.entryDate < b.entryDate ? 1 : -1
    return a.createdAt < b.createdAt ? 1 : -1
  })
}

export function usePcosWellnessData() {
  const { user, profile } = useAuth()
  const [enabled, setEnabledState] = useState(false)
  const [enabledStatus, setEnabledStatus] = useState<LoadStatus>('loading')
  const [isTogglingEnabled, setIsTogglingEnabled] = useState(false)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [entries, setEntries] = useState<PcosWellnessEntry[]>([])
  const [entriesStatus, setEntriesStatus] = useState<LoadStatus>('loading')

  const loadEntries = useCallback(async () => {
    if (!user) return
    setEntriesStatus('loading')
    try {
      const result = await getPcosWellnessEntries(user.id)
      setEntries(sortEntries(result))
      setEntriesStatus('ready')
    } catch {
      setEntriesStatus('error')
    }
  }, [user])

  const load = useCallback(async () => {
    if (!user) return
    setEnabledStatus('loading')
    try {
      const isEnabled = await getPcosTrackingEnabled(user.id)
      setEnabledState(isEnabled)
      setEnabledStatus('ready')
      if (isEnabled) {
        await loadEntries()
      } else {
        setEntries([])
        setEntriesStatus('ready')
      }
    } catch {
      setEnabledStatus('error')
    }
  }, [user, loadEntries])

  useEffect(() => {
    load()
  }, [load])

  const toggleEnabled = useCallback(
    async (next: boolean) => {
      if (!user) return
      setIsTogglingEnabled(true)
      setToggleError(null)
      try {
        const saved = await setPcosTrackingEnabled(user.id, next)
        setEnabledState(saved)
        if (saved) {
          await loadEntries()
        } else {
          setEntries([])
        }
      } catch (error) {
        setToggleError(
          error instanceof Error ? error.message : 'We could not update your wellness tracking preference. Please try again.',
        )
      } finally {
        setIsTogglingEnabled(false)
      }
    },
    [user, loadEntries],
  )

  const addEntry = useCallback((entry: PcosWellnessEntry) => {
    setEntries((current) => sortEntries([...current, entry]))
  }, [])

  const replaceEntry = useCallback((entry: PcosWellnessEntry) => {
    setEntries((current) =>
      sortEntries(current.map((item) => (item.id === entry.id ? entry : item))),
    )
  }, [])

  /** Local-state-only removal — the delete service call happens in DeletePcosWellnessDialog itself. */
  const removeEntry = useCallback((entryId: string) => {
    setEntries((current) => current.filter((item) => item.id !== entryId))
  }, [])

  const create = useCallback(
    async (input: PcosWellnessEntryInput) => {
      if (!user) throw new Error('You must be signed in to save a wellness entry.')
      const saved = await createPcosWellnessEntry(user.id, input)
      addEntry(saved)
      return saved
    },
    [user, addEntry],
  )

  const update = useCallback(
    async (entryId: string, input: PcosWellnessEntryInput) => {
      const saved = await updatePcosWellnessEntry(entryId, input)
      replaceEntry(saved)
      return saved
    },
    [replaceEntry],
  )

  return {
    enabled,
    enabledStatus,
    isTogglingEnabled,
    toggleEnabled,
    toggleError,
    entries,
    entriesStatus,
    create,
    update,
    removeEntry,
    retry: load,
    suggestedDefault: profile?.trackingPreferences.includes('pcos_tracking') ?? false,
  }
}

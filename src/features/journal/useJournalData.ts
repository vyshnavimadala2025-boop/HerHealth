import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  createJournalEntry,
  getJournalEntries,
  updateJournalEntry,
  type JournalEntryInput,
} from '@/features/journal/journalService'
import { JOURNAL_PAGE_SIZE, type JournalEntry } from '@/features/journal/types'

type LoadStatus = 'loading' | 'ready' | 'error'

function sortEntries(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => {
    if (a.entryDate !== b.entryDate) return a.entryDate < b.entryDate ? 1 : -1
    return a.createdAt < b.createdAt ? 1 : -1
  })
}

export function useJournalData() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const offsetRef = useRef(0)

  const loadFirstPage = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const page = await getJournalEntries(user.id, { limit: JOURNAL_PAGE_SIZE, offset: 0 })
      setEntries(sortEntries(page))
      offsetRef.current = page.length
      setHasMore(page.length === JOURNAL_PAGE_SIZE)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    loadFirstPage()
  }, [loadFirstPage])

  const loadMore = useCallback(async () => {
    if (!user || isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const page = await getJournalEntries(user.id, {
        limit: JOURNAL_PAGE_SIZE,
        offset: offsetRef.current,
      })
      setEntries((current) => sortEntries([...current, ...page]))
      offsetRef.current += page.length
      setHasMore(page.length === JOURNAL_PAGE_SIZE)
    } catch {
      // Leave existing entries as-is; hasMore stays true so "Load more" can be retried.
    } finally {
      setIsLoadingMore(false)
    }
  }, [user, isLoadingMore, hasMore])

  /**
   * Inserts a newly created entry into local state without refetching.
   * Only shown immediately if it sorts within (or before) the currently
   * loaded window — if the user backdated it to before the oldest entry
   * we've loaded so far and more pages exist, it's deliberately left out
   * of local state; it will appear naturally once "Load more" reaches that
   * range, rather than risking a duplicate row or an incorrect pagination
   * offset. When it does belong in the loaded window, the offset cursor is
   * advanced by one to stay aligned with the server-side row count.
   */
  const addEntry = useCallback(
    (entry: JournalEntry) => {
      setEntries((current) => {
        const oldestLoaded = current[current.length - 1]
        const withinLoadedWindow =
          !hasMore ||
          !oldestLoaded ||
          entry.entryDate > oldestLoaded.entryDate ||
          (entry.entryDate === oldestLoaded.entryDate && entry.createdAt >= oldestLoaded.createdAt)

        if (!withinLoadedWindow) return current

        offsetRef.current += 1
        return sortEntries([...current, entry])
      })
    },
    [hasMore],
  )

  const replaceEntry = useCallback((entry: JournalEntry) => {
    setEntries((current) =>
      sortEntries(current.map((item) => (item.id === entry.id ? entry : item))),
    )
  }, [])

  /**
   * Removes an entry from local state only — does not call the delete
   * service. DeleteJournalDialog performs the actual Supabase delete
   * itself (mirroring DeletePeriodDialog's self-contained pattern, so it
   * can manage its own loading/error state during the confirm action);
   * this is called afterward, on success, purely to sync local state
   * without a second network request.
   */
  const removeEntry = useCallback((entryId: string) => {
    setEntries((current) => current.filter((item) => item.id !== entryId))
    offsetRef.current = Math.max(0, offsetRef.current - 1)
  }, [])

  const create = useCallback(
    async (input: JournalEntryInput) => {
      if (!user) throw new Error('You must be signed in to save a journal entry.')
      const saved = await createJournalEntry(user.id, input)
      addEntry(saved)
      return saved
    },
    [user, addEntry],
  )

  const update = useCallback(
    async (entryId: string, input: JournalEntryInput) => {
      const saved = await updateJournalEntry(entryId, input)
      replaceEntry(saved)
      return saved
    },
    [replaceEntry],
  )

  return {
    entries,
    status,
    hasMore,
    isLoadingMore,
    loadMore,
    create,
    update,
    removeEntry,
    retry: loadFirstPage,
  }
}

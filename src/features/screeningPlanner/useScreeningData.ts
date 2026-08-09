import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  completeScreeningItem,
  createScreeningItem,
  getScreeningItems,
  reopenScreeningItem,
  updateScreeningItem,
  type ScreeningItemInput,
} from '@/features/screeningPlanner/screeningService'
import type { ScreeningItem } from '@/features/screeningPlanner/types'

type LoadStatus = 'loading' | 'ready' | 'error'

export function useScreeningData() {
  const { user } = useAuth()
  const [items, setItems] = useState<ScreeningItem[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const result = await getScreeningItems(user.id)
      setItems(result)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const replaceItem = useCallback((item: ScreeningItem) => {
    setItems((current) => current.map((existing) => (existing.id === item.id ? item : existing)))
  }, [])

  const addItem = useCallback((item: ScreeningItem) => {
    setItems((current) => [item, ...current])
  }, [])

  /** Local-state-only removal — the delete service call happens in DeleteScreeningItemDialog itself. */
  const removeItem = useCallback((itemId: string) => {
    setItems((current) => current.filter((item) => item.id !== itemId))
  }, [])

  const create = useCallback(
    async (input: ScreeningItemInput) => {
      if (!user) throw new Error('You must be signed in to save a screening plan.')
      const saved = await createScreeningItem(user.id, input)
      addItem(saved)
      return saved
    },
    [user, addItem],
  )

  const update = useCallback(
    async (itemId: string, input: ScreeningItemInput) => {
      const saved = await updateScreeningItem(itemId, input)
      replaceItem(saved)
      return saved
    },
    [replaceItem],
  )

  const complete = useCallback(
    async (itemId: string) => {
      const saved = await completeScreeningItem(itemId)
      replaceItem(saved)
      return saved
    },
    [replaceItem],
  )

  const reopen = useCallback(
    async (itemId: string) => {
      const saved = await reopenScreeningItem(itemId)
      replaceItem(saved)
      return saved
    },
    [replaceItem],
  )

  return {
    items,
    status,
    create,
    update,
    complete,
    reopen,
    removeItem,
    retry: load,
  }
}

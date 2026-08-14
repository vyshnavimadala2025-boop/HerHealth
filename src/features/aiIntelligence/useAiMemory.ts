import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { clearAllMemory, forgetThis, listMemory, rememberThis } from '@/features/aiIntelligence/memoryService'
import type { AiMemoryItem } from '@/features/aiIntelligence/types'

type LoadStatus = 'loading' | 'ready' | 'error'

export function useAiMemory() {
  const { user } = useAuth()
  const [items, setItems] = useState<AiMemoryItem[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      setItems(await listMemory(user.id))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const remember = useCallback(
    async (memoryText: string, sourceConversationId: string | null) => {
      if (!user) throw new Error('You must be signed in to remember this.')
      const item = await rememberThis(memoryText, sourceConversationId)
      setItems((current) => [item, ...current])
      return item
    },
    [user],
  )

  const forget = useCallback(async (memoryId: string) => {
    await forgetThis(memoryId)
    setItems((current) => current.filter((item) => item.id !== memoryId))
  }, [])

  const clearAll = useCallback(async () => {
    if (!user) return
    await clearAllMemory(user.id)
    setItems([])
  }, [user])

  return { items, status, remember, forget, clearAll, retry: load }
}

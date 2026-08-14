import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  createConversation,
  deleteConversation,
  listConversations,
  renameConversation,
  setConversationStatus,
} from '@/features/aiIntelligence/conversationService'
import type { AiCapability, AiConversation } from '@/features/aiIntelligence/types'

type LoadStatus = 'loading' | 'ready' | 'error'

export function useConversations() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<AiConversation[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const result = await listConversations(user.id)
      setConversations(result)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const create = useCallback(
    async (capability: AiCapability, memoryEnabled: boolean) => {
      if (!user) throw new Error('You must be signed in to start a conversation.')
      const conversation = await createConversation(user.id, capability, memoryEnabled)
      setConversations((current) => [conversation, ...current])
      return conversation
    },
    [user],
  )

  const rename = useCallback(async (conversationId: string, title: string) => {
    const updated = await renameConversation(conversationId, title)
    setConversations((current) => current.map((item) => (item.id === conversationId ? updated : item)))
    return updated
  }, [])

  const archive = useCallback(async (conversationId: string) => {
    const updated = await setConversationStatus(conversationId, 'archived')
    setConversations((current) => current.map((item) => (item.id === conversationId ? updated : item)))
    return updated
  }, [])

  const remove = useCallback(async (conversationId: string) => {
    await deleteConversation(conversationId)
    setConversations((current) => current.filter((item) => item.id !== conversationId))
  }, [])

  return { conversations, status, create, rename, archive, remove, retry: load }
}

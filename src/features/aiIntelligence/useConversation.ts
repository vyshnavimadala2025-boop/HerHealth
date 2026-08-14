import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { getConversation, getMessages, sendMessage } from '@/features/aiIntelligence/conversationService'
import { mockAiProvider } from '@/features/aiIntelligence/aiProviderAbstraction'
import { getConsentState } from '@/features/aiIntelligence/consent'
import type { AiConversation, AiMessage } from '@/features/aiIntelligence/types'

type LoadStatus = 'loading' | 'ready' | 'error' | 'not_found'
type SendStatus = 'idle' | 'sending' | 'error'

const FALLBACK_REPLY =
  "SIRILA couldn't safely confirm that response, so here's a general note instead: please share a little more detail, or consider checking in with a healthcare professional if this feels urgent."

export function useConversation(conversationId: string | undefined) {
  const { user } = useAuth()
  const [conversation, setConversation] = useState<AiConversation | null>(null)
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle')
  const [sendError, setSendError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    if (!conversationId) return
    setLoadStatus('loading')
    try {
      const [conversationResult, messagesResult] = await Promise.all([
        getConversation(conversationId),
        getMessages(conversationId),
      ])
      if (!conversationResult) {
        setLoadStatus('not_found')
        return
      }
      setConversation(conversationResult)
      setMessages(messagesResult)
      setLoadStatus('ready')
    } catch {
      setLoadStatus('error')
    }
  }, [conversationId])

  useEffect(() => {
    load()
  }, [load])

  const send = useCallback(
    async (userContent: string) => {
      if (!user || !conversation || sendStatus === 'sending') return

      // Category A (processing) consent is checked fresh on every send, not
      // only when entering /ai — this covers a conversation left open across
      // a consent withdrawal (Settings, another tab, another session). No
      // RPC is called and no message is stored when consent is withdrawn;
      // the existing conversation and its history are left untouched.
      const consent = getConsentState()
      if (!consent.processing) {
        setSendError(
          'SIRILA Intelligence consent has been withdrawn. Grant consent again in Settings → Privacy to send another message.',
        )
        return
      }

      setSendStatus('sending')
      setSendError(null)
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        // PRE-GENERATION SAFETY SCREEN (Phase 0 Section 7 pipeline) — client-side
        // for this mock phase; see aiProviderAbstraction.ts's file header for the
        // known limitation this represents before a real provider is wired in.
        const screen = await mockAiProvider.safetyScreen({ rawUserInput: userContent })

        // RELEVANT CONTEXT — only if the user has granted Category B consent.
        const context = consent.useWellnessContext
          ? await mockAiProvider.retrieveContext({
              permittedCategories: ['cycle', 'sleep', 'stress'],
              currentTopic: userContent,
            })
          : null

        // MODEL — mock generation.
        let draft = await mockAiProvider.generateResponse({
          capability: conversation.capability,
          userContent,
          safetyTier: screen.tier,
          context,
        })

        // POST-GENERATION SAFETY VERIFICATION — regenerate once, then fall back
        // to a safe static message; never show a response that failed verification.
        let verification = await mockAiProvider.verifyResponse({ draftContent: draft.content })
        if (!verification.passed) {
          draft = await mockAiProvider.generateResponse({
            capability: conversation.capability,
            userContent,
            safetyTier: screen.tier,
            context,
          })
          verification = await mockAiProvider.verifyResponse({ draftContent: draft.content })
          if (!verification.passed) {
            draft = { content: FALLBACK_REPLY, modelUsed: 'mock-fallback' }
          }
        }

        // RESPONSE POLICY / persistence — the server independently re-classifies
        // and can override the assistant content (emergency tier); see
        // ai_send_message() in 0029_ai_send_message.sql.
        const result = await sendMessage(
          conversation.id,
          userContent,
          draft.content,
          draft.modelUsed,
          controller.signal,
        )

        setMessages((current) => [...current, result.userMessage, result.assistantMessage])
        setSendStatus('idle')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          setSendStatus('idle')
          setSendError('Generation stopped. Note: your message may still have been saved if the request had already reached the server.')
          return
        }
        setSendStatus('error')
        setSendError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      } finally {
        abortControllerRef.current = null
      }
    },
    [user, conversation, sendStatus],
  )

  const stop = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  return { conversation, messages, loadStatus, sendStatus, sendError, send, stop, retry: load }
}

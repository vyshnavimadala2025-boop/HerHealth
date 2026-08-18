import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FullScreenError from '@/components/shared/FullScreenError'
import FullScreenLoader from '@/components/shared/FullScreenLoader'
import PreviewGateNotice from '@/features/aiIntelligence/PreviewGateNotice'
import MessageBubble from '@/features/aiIntelligence/MessageBubble'
import MessageComposer from '@/features/aiIntelligence/MessageComposer'
import ResponseFeedback from '@/features/aiIntelligence/ResponseFeedback'
import SaveToJournalPrompt from '@/features/aiIntelligence/SaveToJournalPrompt'
import RememberThisPrompt from '@/features/aiIntelligence/RememberThisPrompt'
import CareSummarySheet from '@/features/aiIntelligence/CareSummarySheet'
import { useConversation } from '@/features/aiIntelligence/useConversation'
import { useAiSymptomJournal } from '@/features/aiIntelligence/useAiSymptomJournal'
import { AI_CAPABILITIES } from '@/features/aiIntelligence/constants'

function AiConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { conversation, messages, loadStatus, sendStatus, sendError, send, stop, retry } =
    useConversation(conversationId)
  const journal = useAiSymptomJournal()

  if (loadStatus === 'not_found') {
    return <Navigate to="/ai" replace />
  }

  if (loadStatus === 'loading') {
    return <FullScreenLoader />
  }

  if (loadStatus === 'error' || !conversation) {
    return <FullScreenError title="We couldn't load this conversation." onRetry={retry} />
  }

  const capabilityLabel = AI_CAPABILITIES.find((item) => item.value === conversation.capability)?.label

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col animate-in fade-in duration-500 motion-reduce:animate-none">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 pb-3 sm:p-6 sm:pb-4">
        <PreviewGateNotice />
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <Button asChild variant="ghost" size="xs" className="-ml-2 self-start text-muted-foreground">
              <Link to="/ai">
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Conversations
              </Link>
            </Button>
            <h1 className="truncate font-display text-heading font-medium text-foreground">
              {conversation.title || capabilityLabel}
            </h1>
            <p className="text-caption text-muted-foreground">{capabilityLabel}</p>
          </div>
          <CareSummarySheet conversation={conversation} messages={messages} journalEntries={journal.entries} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6" role="log" aria-label="Conversation">
        {messages.length === 0 && (
          <p className="text-center text-caption text-muted-foreground">
            Share what you're noticing to get started.
          </p>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message}>
            <div className="flex flex-col gap-2 px-1">
              <RememberThisPrompt conversationId={conversation.id} sourceText={message.content} />
              {message.role === 'assistant' && (
                <>
                  <ResponseFeedback conversationId={conversation.id} messageId={message.id} />
                  {conversation.capability === 'symptom_insight' && (
                    <SaveToJournalPrompt conversationId={conversation.id} userContent={message.content} />
                  )}
                </>
              )}
            </div>
          </MessageBubble>
        ))}
        {sendError && (
          <p role="alert" className="flex items-center gap-2 text-caption text-destructive">
            {sendError}
            <Button type="button" variant="ghost" size="sm" onClick={retry}>
              <Loader2 className="size-3.5" aria-hidden="true" />
              Refresh
            </Button>
          </p>
        )}
      </div>

      <MessageComposer isSending={sendStatus === 'sending'} onSend={send} onStop={stop} />
    </main>
  )
}

export default AiConversationPage

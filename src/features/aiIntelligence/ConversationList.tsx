import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Loader2, MessageCircle, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { AI_CAPABILITIES } from '@/features/aiIntelligence/constants'
import type { AiConversation } from '@/features/aiIntelligence/types'

interface ConversationListProps {
  status: 'loading' | 'ready' | 'error'
  conversations: AiConversation[]
  onRename: (id: string, title: string) => Promise<unknown>
  onArchive: (id: string) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
  onRetry: () => void
}

function capabilityLabel(capability: AiConversation['capability']): string {
  return AI_CAPABILITIES.find((item) => item.value === capability)?.label ?? capability
}

function ConversationRow({
  conversation,
  onRename,
  onArchive,
  onDelete,
}: {
  conversation: AiConversation
  onRename: (id: string, title: string) => Promise<unknown>
  onArchive: (id: string) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [title, setTitle] = useState(conversation.title ?? '')
  const [busy, setBusy] = useState(false)

  return (
    <li className="flex items-center gap-2 rounded-xl border border-border p-3">
      <MessageCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col">
        {isRenaming ? (
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={async () => {
              setIsRenaming(false)
              if (title.trim() !== (conversation.title ?? '')) {
                await onRename(conversation.id, title)
              }
            }}
            autoFocus
            className="h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
          />
        ) : (
          <Link to={`/ai/${conversation.id}`} className="truncate text-sm font-medium text-foreground hover:underline">
            {conversation.title || capabilityLabel(conversation.capability)}
          </Link>
        )}
        <span className="text-caption text-muted-foreground">
          {capabilityLabel(conversation.capability)} · {new Date(conversation.updatedAt).toLocaleDateString()}
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Rename conversation"
        onClick={() => setIsRenaming(true)}
      >
        <Pencil className="size-3.5" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Archive conversation"
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          try {
            await onArchive(conversation.id)
          } finally {
            setBusy(false)
          }
        }}
      >
        <Archive className="size-3.5" aria-hidden="true" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Delete conversation">
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the conversation and its messages permanently. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await onDelete(conversation.id)
                  toast.success('Conversation deleted.')
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : 'Something went wrong.')
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  )
}

function ConversationList({ status, conversations, onRename, onArchive, onDelete, onRetry }: ConversationListProps) {
  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <EmptyState
        icon={MessageCircle}
        title="We couldn't load your conversations"
        description="Please try again."
        action={
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <Loader2 className="size-3.5" aria-hidden="true" />
            Retry
          </Button>
        }
      />
    )
  }

  const active = conversations.filter((conversation) => conversation.status === 'active')

  if (active.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No conversations yet"
        description="Start with Ask SIRILA or Symptom Insight above."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {active.map((conversation) => (
        <ConversationRow
          key={conversation.id}
          conversation={conversation}
          onRename={onRename}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default ConversationList

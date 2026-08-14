import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { AiMessage } from '@/features/aiIntelligence/types'

interface MessageBubbleProps {
  message: AiMessage
  children?: ReactNode
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

function MessageBubble({ message, children }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isEmergency = message.safetyTier === 'emergency' && !isUser

  return (
    <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
      <div
        role={isUser ? undefined : 'article'}
        aria-label={isUser ? undefined : 'SIRILA response'}
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line sm:max-w-[75%]',
          isUser
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : isEmergency
              ? 'rounded-bl-md border border-destructive/40 bg-destructive/10 text-foreground'
              : 'rounded-bl-md border border-border bg-card text-card-foreground',
        )}
      >
        {isEmergency && (
          <div className="mb-2 flex items-center gap-1.5 text-caption font-medium text-destructive">
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            Possible emergency detected
          </div>
        )}
        {message.content}
      </div>
      <div className="flex items-center gap-2 px-1">
        <span className="text-caption text-muted-foreground">{formatTime(message.createdAt)}</span>
        {!isUser && message.safetyTier && message.safetyTier !== 'routine' && (
          <Badge variant="outline" className="capitalize">
            {message.safetyTier}
          </Badge>
        )}
      </div>
      {children}
    </div>
  )
}

export default MessageBubble

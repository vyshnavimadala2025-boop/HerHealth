import type { ReactNode } from 'react'
import { AlertTriangle, Sparkles } from 'lucide-react'
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

/**
 * SIRILA's own message presentation — deliberately not a generic chat
 * bubble UI. User turns stay as a compact, right-aligned pill (still the
 * fastest way to tell "what I said" from "what SIRILA said" at a glance);
 * SIRILA's own replies read as a calm, editorial text block instead of a
 * boxed bubble — no border, no fill, generous line-height, a width capped
 * for comfortable reading rather than stretched across the column. This
 * is the one visual distinction that most makes a chat surface feel like
 * "yet another AI chatbot" — removing it here is the point.
 *
 * The emergency-tier treatment is the one deliberate exception: it keeps
 * a clearly bounded card with a left accent bar and an icon+label. That's
 * safety UI, not decoration, and it must stay unmistakable regardless of
 * how the rest of the surface is restyled.
 */
function MessageBubble({ message, children }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isEmergency = message.safetyTier === 'emergency' && !isUser

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground sm:max-w-[70%]">
          {message.content}
        </div>
        <span className="px-1 text-caption text-muted-foreground">{formatTime(message.createdAt)}</span>
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-1.5 text-caption font-medium tracking-wide text-muted-foreground uppercase">
        <Sparkles className="size-3" aria-hidden="true" />
        SIRILA
      </div>
      <div
        role="article"
        aria-label="SIRILA response"
        className={cn(
          'w-full max-w-[62ch] text-[0.9375rem] leading-relaxed whitespace-pre-line text-foreground',
          isEmergency &&
            'rounded-xl border-l-2 border-destructive bg-destructive/[0.06] px-4 py-3.5 leading-normal',
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
      <div className="flex items-center gap-2 px-0.5">
        <span className="text-caption text-muted-foreground">{formatTime(message.createdAt)}</span>
        {message.safetyTier && message.safetyTier !== 'routine' && (
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

import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Loader2, Send, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AI_MESSAGE_MAX_LENGTH } from '@/features/aiIntelligence/constants'

interface MessageComposerProps {
  isSending: boolean
  onSend: (content: string) => void
  onStop: () => void
}

function MessageComposer({ isSending, onSend, onStop }: MessageComposerProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || isSending) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <div className="border-t border-border/70 bg-background p-3 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-xs transition-shadow focus-within:border-ring/60 focus-within:shadow-sm sm:p-3"
      >
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value.slice(0, AI_MESSAGE_MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          rows={2}
          maxLength={AI_MESSAGE_MAX_LENGTH}
          placeholder="Share what you're noticing…"
          aria-label="Message to SIRILA"
          disabled={isSending}
          className="resize-none border-none bg-transparent px-1.5 py-1 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between px-1">
          <span className="text-caption text-muted-foreground">
            {value.length}/{AI_MESSAGE_MAX_LENGTH} · Enter to send, Shift+Enter for a new line
          </span>
          {isSending ? (
            <Button type="button" variant="outline" size="icon-sm" className="rounded-full" onClick={onStop} aria-label="Stop">
              <Square className="size-3.5" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" size="icon-sm" className="rounded-full" disabled={!value.trim()} aria-label="Send">
              <Send className="size-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>
        {isSending && (
          <p role="status" className="flex items-center gap-1.5 px-1 text-caption text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            SIRILA is thinking…
          </p>
        )}
      </form>
    </div>
  )
}

export default MessageComposer

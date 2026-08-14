import { useState } from 'react'
import { BrainCircuit, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAiMemory } from '@/features/aiIntelligence/useAiMemory'

interface RememberThisPromptProps {
  conversationId: string
  sourceText: string
}

const MEMORY_TEXT_MAX_LENGTH = 500

/**
 * "Remember this" (Phase 2 Finding 2). Only ever persists what the user
 * explicitly confirms — the editable text below always starts as a
 * starting point, not something silently saved verbatim. Explains what
 * will be remembered before any write happens, and requires an explicit
 * confirm click. Calls useAiMemory().remember(), which calls
 * public.ai_remember() (0030) — ownership of conversationId is verified
 * server-side.
 */
function RememberThisPrompt({ conversationId, sourceText }: RememberThisPromptProps) {
  const { remember } = useAiMemory()
  const [state, setState] = useState<'idle' | 'confirming' | 'saved'>('idle')
  const [memoryText, setMemoryText] = useState(sourceText.slice(0, MEMORY_TEXT_MAX_LENGTH))
  const [saving, setSaving] = useState(false)

  if (state === 'saved') {
    return <p className="text-caption text-muted-foreground">Saved. SIRILA will remember this until you forget it.</p>
  }

  if (state === 'confirming') {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
        <p className="text-caption font-medium text-foreground">What should SIRILA remember?</p>
        <p className="text-caption text-muted-foreground">
          This will be saved and available to SIRILA in future conversations, until you choose to forget it. Edit it
          below if you'd like.
        </p>
        <Textarea
          value={memoryText}
          onChange={(event) => setMemoryText(event.target.value.slice(0, MEMORY_TEXT_MAX_LENGTH))}
          rows={2}
          maxLength={MEMORY_TEXT_MAX_LENGTH}
          aria-label="What SIRILA should remember"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            disabled={saving || !memoryText.trim()}
            onClick={async () => {
              setSaving(true)
              try {
                await remember(memoryText.trim(), conversationId)
                setState('saved')
                toast.success('SIRILA will remember this.')
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Something went wrong.')
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
            Confirm
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setState('idle')}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => setState('confirming')} className="w-fit">
      <BrainCircuit className="size-3.5" aria-hidden="true" />
      Remember this
    </Button>
  )
}

export default RememberThisPrompt

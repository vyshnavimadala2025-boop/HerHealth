import { useState } from 'react'
import { Loader2, NotebookPen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAiSymptomJournal } from '@/features/aiIntelligence/useAiSymptomJournal'

interface SaveToJournalPromptProps {
  conversationId: string
  userContent: string
}

/**
 * "Would you like me to save this to your symptom journal?" — only ever
 * creates a journal entry on explicit user confirmation (Phase 0 Section
 * 12 / Phase 2 Section 7: "Never silently create a persistent medical
 * record"). userContent is offered as an editable starting point, not
 * saved verbatim without the user seeing it first.
 */
function SaveToJournalPrompt({ conversationId, userContent }: SaveToJournalPromptProps) {
  const { create } = useAiSymptomJournal()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [symptomText, setSymptomText] = useState(userContent.slice(0, 200))

  if (saved) {
    return <p className="text-caption text-muted-foreground">Saved to your symptom journal.</p>
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
        <label htmlFor="journal-symptom-text" className="text-caption font-medium text-foreground">
          Save to symptom journal
        </label>
        <input
          id="journal-symptom-text"
          value={symptomText}
          onChange={(event) => setSymptomText(event.target.value)}
          maxLength={200}
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            disabled={saving || !symptomText.trim()}
            onClick={async () => {
              setSaving(true)
              try {
                await create({ conversationId, symptom: symptomText, severity: null, notes: userContent })
                setSaved(true)
                toast.success('Saved to your symptom journal.')
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
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)} className="w-fit">
      <NotebookPen className="size-3.5" aria-hidden="true" />
      Save to symptom journal
    </Button>
  )
}

export default SaveToJournalPrompt

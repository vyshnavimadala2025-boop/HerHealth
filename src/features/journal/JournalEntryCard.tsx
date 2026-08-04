import { NotebookPen, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteJournalDialog from '@/features/journal/DeleteJournalDialog'
import { formatFriendlyDate } from '@/features/journal/types'
import type { JournalEntry } from '@/features/journal/types'

const PREVIEW_LENGTH = 140

function contentPreview(content: string) {
  const trimmed = content.trim()
  return trimmed.length > PREVIEW_LENGTH ? `${trimmed.slice(0, PREVIEW_LENGTH)}…` : trimmed
}

interface JournalEntryCardProps {
  entry: JournalEntry
  onEdit: (entry: JournalEntry) => void
  onDeleted: (entryId: string) => void
}

function JournalEntryCard({ entry, onEdit, onDeleted }: JournalEntryCardProps) {
  return (
    <li className="flex gap-3 rounded-xl border border-border p-4 text-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:shadow-sm">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-blush text-blush-foreground">
        <NotebookPen className="size-3.5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-caption text-muted-foreground">{formatFriendlyDate(entry.entryDate)}</p>
            <p className="font-display text-base font-medium break-words text-foreground">{entry.title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Edit this journal entry"
              onClick={() => onEdit(entry)}
            >
              <Pencil />
            </Button>
            <DeleteJournalDialog entry={entry} onDeleted={() => onDeleted(entry.id)} />
          </div>
        </div>
        <p className="mt-1 break-words text-muted-foreground">{contentPreview(entry.content)}</p>
      </div>
    </li>
  )
}

export default JournalEntryCard

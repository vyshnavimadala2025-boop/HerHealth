import { Pencil } from 'lucide-react'
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
    <li className="flex flex-col gap-1 rounded-lg border border-border p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-caption text-muted-foreground">{formatFriendlyDate(entry.entryDate)}</p>
          <p className="font-medium break-words">{entry.title}</p>
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
      <p className="text-muted-foreground break-words">{contentPreview(entry.content)}</p>
    </li>
  )
}

export default JournalEntryCard

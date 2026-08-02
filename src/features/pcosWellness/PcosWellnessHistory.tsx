import { Loader2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import DeletePcosWellnessDialog from '@/features/pcosWellness/DeletePcosWellnessDialog'
import {
  OBSERVATION_OPTIONS,
  formatFriendlyDate,
  type PcosWellnessEntry,
} from '@/features/pcosWellness/types'

function labelsFor(values: readonly string[]) {
  return values
    .map((value) => OBSERVATION_OPTIONS.find((option) => option.value === value)?.label ?? value)
    .join(', ')
}

function notePreview(note: string | null) {
  if (!note) return null
  return note.length > 100 ? `${note.slice(0, 100)}…` : note
}

interface PcosWellnessHistoryProps {
  status: 'loading' | 'ready' | 'error'
  entries: PcosWellnessEntry[]
  onEdit: (entry: PcosWellnessEntry) => void
  onDeleted: (entryId: string) => void
  onRetry: () => void
}

function PcosWellnessHistory({ status, entries, onEdit, onDeleted, onRetry }: PcosWellnessHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wellness History</CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your wellness entries…
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-start gap-2 py-4">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load your wellness entries. Please try again.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && entries.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">
            You haven&apos;t added any wellness entries yet.
          </p>
        )}

        {status === 'ready' && entries.length > 0 && (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-1 rounded-lg border border-border p-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{formatFriendlyDate(entry.entryDate)}</p>
                    {entry.observations.length > 0 && (
                      <p className="text-caption text-muted-foreground">
                        {labelsFor(entry.observations)}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit this wellness entry"
                      onClick={() => onEdit(entry)}
                    >
                      <Pencil />
                    </Button>
                    <DeletePcosWellnessDialog entry={entry} onDeleted={() => onDeleted(entry.id)} />
                  </div>
                </div>
                {notePreview(entry.note) && (
                  <p className="text-caption text-muted-foreground break-words">
                    {notePreview(entry.note)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default PcosWellnessHistory

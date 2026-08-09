import { Moon, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import DeleteSleepEntryDialog from '@/features/sleepIntelligence/DeleteSleepEntryDialog'
import { SLEEP_QUALITY_OPTIONS, type SleepEntry } from '@/features/sleepIntelligence/types'
import { formatFriendlyDate } from '@/features/periods/dateUtils'

function qualityLabel(value: string | null) {
  if (!value) return null
  return SLEEP_QUALITY_OPTIONS.find((option) => option.value === value)?.label ?? value
}

function formatDuration(minutes: number | null): string | null {
  if (minutes === null) return null
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return `${hours}h ${remainder}m`
}

function notePreview(note: string | null) {
  if (!note) return null
  return note.length > 100 ? `${note.slice(0, 100)}…` : note
}

interface SleepHistoryListProps {
  status: 'loading' | 'ready' | 'error'
  entries: SleepEntry[]
  onEdit: (entry: SleepEntry) => void
  onDeleted: (entryId: string) => void
  onRetry: () => void
}

function SleepHistoryList({ status, entries, onEdit, onDeleted, onRetry }: SleepHistoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Sleep History</CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2 py-1">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="flex flex-col items-start gap-2 py-4">
            <p className="text-sm text-muted-foreground">We couldn&apos;t load your sleep data. Please try again.</p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && entries.length === 0 && (
          <EmptyState
            icon={Moon}
            title="No sleep entries yet"
            description="Track your sleep for a few nights to start seeing your own patterns — there's no schedule to keep."
          />
        )}

        {status === 'ready' && entries.length > 0 && (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 text-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{formatFriendlyDate(entry.entryDate)}</p>
                    <p className="text-caption text-muted-foreground">
                      {[
                        formatDuration(entry.durationMinutes),
                        qualityLabel(entry.quality),
                        entry.bedtime && entry.wakeTime ? `${entry.bedtime} – ${entry.wakeTime}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'No details recorded'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-11"
                      aria-label="Edit this sleep entry"
                      onClick={() => onEdit(entry)}
                    >
                      <Pencil />
                    </Button>
                    <DeleteSleepEntryDialog entry={entry} onDeleted={() => onDeleted(entry.id)} />
                  </div>
                </div>
                {notePreview(entry.note) && (
                  <p className="text-caption text-muted-foreground break-words">{notePreview(entry.note)}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default SleepHistoryList

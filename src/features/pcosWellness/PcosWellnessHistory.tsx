import { useMemo } from 'react'
import { Leaf, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import DeletePcosWellnessDialog from '@/features/pcosWellness/DeletePcosWellnessDialog'
import {
  OBSERVATION_OPTIONS,
  formatFriendlyDate,
  getLocalDateString,
  type PcosWellnessEntry,
} from '@/features/pcosWellness/types'

function labelsFor(values: readonly string[]) {
  return values.map((value) => OBSERVATION_OPTIONS.find((option) => option.value === value)?.label ?? value)
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
  const entriesThisMonth = useMemo(() => {
    const monthPrefix = getLocalDateString().slice(0, 7)
    return entries.filter((entry) => entry.entryDate.startsWith(monthPrefix)).length
  }, [entries])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Your Wellness History</CardTitle>
          {status === 'ready' && entries.length > 0 && (
            <Badge className="bg-support text-support-foreground">
              {entriesThisMonth} entr{entriesThisMonth === 1 ? 'y' : 'ies'} this month
            </Badge>
          )}
        </div>
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
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load your wellness entries. Please try again.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && entries.length === 0 && (
          <EmptyState
            icon={Leaf}
            title="No wellness entries yet"
            description="Add your first entry below whenever you're ready — there's no schedule to keep."
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
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-11"
                      aria-label="Edit this wellness entry"
                      onClick={() => onEdit(entry)}
                    >
                      <Pencil />
                    </Button>
                    <DeletePcosWellnessDialog entry={entry} onDeleted={() => onDeleted(entry.id)} />
                  </div>
                </div>
                {entry.observations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {labelsFor(entry.observations).map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-support/50 px-2.5 py-0.5 text-caption font-medium text-support-foreground"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
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

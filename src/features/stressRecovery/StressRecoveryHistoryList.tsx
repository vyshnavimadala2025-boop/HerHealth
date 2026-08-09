import { HeartHandshake, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import DeleteStressRecoveryEntryDialog from '@/features/stressRecovery/DeleteStressRecoveryEntryDialog'
import {
  RECOVERY_ACTION_OPTIONS,
  RECOVERY_LEVEL_OPTIONS,
  STRESS_LEVEL_OPTIONS,
  type StressRecoveryEntry,
} from '@/features/stressRecovery/types'
import { formatFriendlyDate } from '@/features/periods/dateUtils'

function optionLabel(options: readonly { value: string; label: string }[], value: string | null) {
  if (!value) return null
  return options.find((option) => option.value === value)?.label ?? value
}

function labelsFor(options: readonly { value: string; label: string }[], values: readonly string[]) {
  return values.map((value) => options.find((option) => option.value === value)?.label ?? value)
}

function reflectionPreview(reflection: string | null) {
  if (!reflection) return null
  return reflection.length > 100 ? `${reflection.slice(0, 100)}…` : reflection
}

interface StressRecoveryHistoryListProps {
  status: 'loading' | 'ready' | 'error'
  entries: StressRecoveryEntry[]
  onEdit: (entry: StressRecoveryEntry) => void
  onDeleted: (entryId: string) => void
  onRetry: () => void
}

function StressRecoveryHistoryList({ status, entries, onEdit, onDeleted, onRetry }: StressRecoveryHistoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Check-In History</CardTitle>
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
              Unable to load your stress and recovery data. Please try again.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}

        {status === 'ready' && entries.length === 0 && (
          <EmptyState
            icon={HeartHandshake}
            title="No check-ins yet"
            description="Keep checking in to understand your personal stress and recovery patterns over time."
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
                        optionLabel(STRESS_LEVEL_OPTIONS, entry.stressLevel) &&
                          `Stress: ${optionLabel(STRESS_LEVEL_OPTIONS, entry.stressLevel)}`,
                        optionLabel(RECOVERY_LEVEL_OPTIONS, entry.recoveryLevel) &&
                          `Recovery: ${optionLabel(RECOVERY_LEVEL_OPTIONS, entry.recoveryLevel)}`,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'No levels recorded'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-11"
                      aria-label="Edit this entry"
                      onClick={() => onEdit(entry)}
                    >
                      <Pencil />
                    </Button>
                    <DeleteStressRecoveryEntryDialog entry={entry} onDeleted={() => onDeleted(entry.id)} />
                  </div>
                </div>
                {entry.recoveryActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {labelsFor(RECOVERY_ACTION_OPTIONS, entry.recoveryActions).map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-support/50 px-2.5 py-0.5 text-caption font-medium text-support-foreground"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                {reflectionPreview(entry.reflection) && (
                  <p className="text-caption text-muted-foreground break-words">{reflectionPreview(entry.reflection)}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default StressRecoveryHistoryList

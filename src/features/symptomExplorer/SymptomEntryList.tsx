import { ScanSearch, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import DeleteSymptomEntryDialog from '@/features/symptomExplorer/DeleteSymptomEntryDialog'
import { SEVERITY_OPTIONS, TIMING_OPTIONS, type SymptomEntry } from '@/features/symptomExplorer/types'
import { symptomLabel } from '@/features/symptomExplorer/symptomEducation'
import { formatFriendlyDate } from '@/features/periods/dateUtils'

function optionLabel(options: readonly { value: string; label: string }[], value: string | null) {
  if (!value) return null
  return options.find((option) => option.value === value)?.label ?? value
}

function notePreview(note: string | null) {
  if (!note) return null
  return note.length > 100 ? `${note.slice(0, 100)}…` : note
}

interface SymptomEntryListProps {
  status: 'loading' | 'ready' | 'error'
  entries: SymptomEntry[]
  onEdit: (entry: SymptomEntry) => void
  onDeleted: (entryId: string) => void
  onRetry: () => void
}

function SymptomEntryList({ status, entries, onEdit, onDeleted, onRetry }: SymptomEntryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Symptom History</CardTitle>
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
            <p className="text-sm text-muted-foreground">We couldn&apos;t load your symptom entries. Please try again.</p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && entries.length === 0 && (
          <EmptyState
            icon={ScanSearch}
            title="No symptom entries yet"
            description="Select a symptom above and record your first entry whenever you're ready."
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
                      {[optionLabel(SEVERITY_OPTIONS, entry.severity), optionLabel(TIMING_OPTIONS, entry.timing)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-11"
                      aria-label="Edit this symptom entry"
                      onClick={() => onEdit(entry)}
                    >
                      <Pencil />
                    </Button>
                    <DeleteSymptomEntryDialog entry={entry} onDeleted={() => onDeleted(entry.id)} />
                  </div>
                </div>
                {entry.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.symptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="rounded-full bg-support/50 px-2.5 py-0.5 text-caption font-medium text-support-foreground"
                      >
                        {symptomLabel(symptom)}
                      </span>
                    ))}
                  </div>
                )}
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

export default SymptomEntryList

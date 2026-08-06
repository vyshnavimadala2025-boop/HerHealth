import { Pencil, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDeleteDialog from '@/features/pregnancy/ConfirmDeleteDialog'
import { deletePregnancyEntry } from '@/features/pregnancy/pregnancyEntryService'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import { PREGNANCY_MOOD_OPTIONS, type PregnancyEntry } from '@/features/pregnancy/types'

function labelFor(options: readonly { value: string; label: string }[], value: string | null) {
  if (!value) return null
  return options.find((option) => option.value === value)?.label ?? value
}

interface PregnancyHistoryProps {
  status: 'loading' | 'ready' | 'error'
  entries: PregnancyEntry[]
  onEdit: (entry: PregnancyEntry) => void
  onDeleted: () => void
}

function PregnancyHistory({ status, entries, onEdit, onDeleted }: PregnancyHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wellness History</CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2 py-1">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {status === 'error' && (
          <p role="alert" className="py-4 text-sm text-muted-foreground">
            We couldn&apos;t load your wellness history. Please try again later.
          </p>
        )}

        {status === 'ready' && entries.length === 0 && (
          <EmptyState icon={Sparkles} title="No entries yet" description="Add your first entry above whenever you're ready." />
        )}

        {status === 'ready' && entries.length > 0 && (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => {
              const chips = [
                labelFor(PREGNANCY_MOOD_OPTIONS, entry.mood),
                entry.waterIntakeGlasses !== null ? `${entry.waterIntakeGlasses} glasses water` : null,
                entry.exerciseMinutes !== null ? `${entry.exerciseMinutes} min exercise` : null,
                entry.symptoms.length > 0 && !entry.symptoms.includes('none')
                  ? `${entry.symptoms.length} symptom${entry.symptoms.length === 1 ? '' : 's'}`
                  : null,
              ].filter((value): value is string => !!value)

              return (
                <li
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-xl border border-border p-3.5 text-sm transition-[box-shadow,border-color] duration-200 hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">{formatFriendlyDate(entry.entryDate)}</p>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button type="button" variant="ghost" size="icon-sm" className="size-11" aria-label="Edit this entry" onClick={() => onEdit(entry)}>
                        <Pencil />
                      </Button>
                      <ConfirmDeleteDialog
                        title="Delete this wellness entry?"
                        ariaLabel="Delete this wellness entry"
                        onConfirm={async () => {
                          await deletePregnancyEntry(entry.id)
                          onDeleted()
                        }}
                      />
                    </div>
                  </div>
                  {chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {chips.map((chip) => (
                        <span key={chip} className="rounded-full bg-lavender/60 px-2.5 py-0.5 text-caption font-medium text-primary">
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.reflection && <p className="text-caption text-muted-foreground break-words">{entry.reflection}</p>}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default PregnancyHistory

import { Pencil, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import DeleteFertilityEntryDialog from '@/features/fertility/DeleteFertilityEntryDialog'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import {
  CERVICAL_MUCUS_OPTIONS,
  OVULATION_TEST_OPTIONS,
  FERTILITY_MOOD_OPTIONS,
  type FertilityEntry,
} from '@/features/fertility/types'

function labelFor(options: readonly { value: string; label: string }[], value: string | null) {
  if (!value) return null
  return options.find((option) => option.value === value)?.label ?? value
}

interface FertilityHistoryProps {
  status: 'loading' | 'ready' | 'error'
  entries: FertilityEntry[]
  onEdit: (entry: FertilityEntry) => void
  onDeleted: () => void
}

function FertilityHistory({ status, entries, onEdit, onDeleted }: FertilityHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Fertility History</CardTitle>
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
            We couldn&apos;t load your fertility history. Please try again later.
          </p>
        )}

        {status === 'ready' && entries.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="No entries yet"
            description="Add your first fertility entry above whenever you're ready."
          />
        )}

        {status === 'ready' && entries.length > 0 && (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => {
              const chips = [
                labelFor(CERVICAL_MUCUS_OPTIONS, entry.cervicalMucus),
                entry.bbtCelsius !== null ? `${entry.bbtCelsius}°C` : null,
                entry.ovulationTest && entry.ovulationTest !== 'not_tested'
                  ? `Test: ${labelFor(OVULATION_TEST_OPTIONS, entry.ovulationTest)}`
                  : null,
                labelFor(FERTILITY_MOOD_OPTIONS, entry.mood),
              ].filter((value): value is string => !!value)

              return (
                <li
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-xl border border-border p-3.5 text-sm transition-[box-shadow,border-color] duration-200 hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">{formatFriendlyDate(entry.entryDate)}</p>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-11"
                        aria-label="Edit this fertility entry"
                        onClick={() => onEdit(entry)}
                      >
                        <Pencil />
                      </Button>
                      <DeleteFertilityEntryDialog entry={entry} onDeleted={onDeleted} />
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
                  {entry.note && <p className="text-caption text-muted-foreground break-words">{entry.note}</p>}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default FertilityHistory

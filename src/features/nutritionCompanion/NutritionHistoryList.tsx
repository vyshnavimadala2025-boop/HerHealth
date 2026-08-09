import { Apple, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import DeleteNutritionEntryDialog from '@/features/nutritionCompanion/DeleteNutritionEntryDialog'
import { FOOD_CATEGORY_OPTIONS, MEAL_OPTIONS, type NutritionEntry } from '@/features/nutritionCompanion/types'
import { formatFriendlyDate } from '@/features/periods/dateUtils'

function labelsFor(options: readonly { value: string; label: string }[], values: readonly string[]) {
  return values.map((value) => options.find((option) => option.value === value)?.label ?? value)
}

function notePreview(note: string | null) {
  if (!note) return null
  return note.length > 100 ? `${note.slice(0, 100)}…` : note
}

interface NutritionHistoryListProps {
  status: 'loading' | 'ready' | 'error'
  entries: NutritionEntry[]
  onEdit: (entry: NutritionEntry) => void
  onDeleted: (entryId: string) => void
  onRetry: () => void
}

function NutritionHistoryList({ status, entries, onEdit, onDeleted, onRetry }: NutritionHistoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Nutrition History</CardTitle>
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
            <p className="text-sm text-muted-foreground">We couldn&apos;t load your nutrition data. Please try again.</p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && entries.length === 0 && (
          <EmptyState
            icon={Apple}
            title="Start your nutrition journal"
            description="Record a meal or hydration entry to begin seeing your personal wellness patterns."
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
                      {entry.hydrationGlasses !== null
                        ? `${entry.hydrationGlasses} glass${entry.hydrationGlasses === 1 ? '' : 'es'} of water`
                        : 'No hydration recorded'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-11"
                      aria-label="Edit this nutrition entry"
                      onClick={() => onEdit(entry)}
                    >
                      <Pencil />
                    </Button>
                    <DeleteNutritionEntryDialog entry={entry} onDeleted={() => onDeleted(entry.id)} />
                  </div>
                </div>
                {entry.mealsLogged.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {labelsFor(MEAL_OPTIONS, entry.mealsLogged).map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-support/50 px-2.5 py-0.5 text-caption font-medium text-support-foreground"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                {entry.foodCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {labelsFor(FOOD_CATEGORY_OPTIONS, entry.foodCategories).map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-lavender/50 px-2.5 py-0.5 text-caption font-medium text-lavender-foreground"
                      >
                        {label}
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

export default NutritionHistoryList

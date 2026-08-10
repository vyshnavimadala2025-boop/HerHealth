import { Pencil, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import DeleteScreeningItemDialog from '@/features/screeningPlanner/DeleteScreeningItemDialog'
import { SCREENING_CATEGORY_OPTIONS, type ScreeningItem } from '@/features/screeningPlanner/types'
import { formatFriendlyDate } from '@/features/periods/dateUtils'

function categoryLabel(category: string | null) {
  if (!category) return null
  return SCREENING_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category
}

interface ScreeningItemActions {
  onEdit: (item: ScreeningItem) => void
  onComplete: (itemId: string) => void
  onReopen: (itemId: string) => void
  onDeleted: (itemId: string) => void
}

function ScreeningItemCard({ item, onEdit, onComplete, onReopen, onDeleted }: ScreeningItemActions & { item: ScreeningItem }) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium break-words">{item.title}</p>
            <Badge
              className={
                item.status === 'completed' ? 'bg-support text-support-foreground' : 'bg-primary/10 text-primary'
              }
            >
              {item.status === 'completed' ? 'Completed' : 'Planned'}
            </Badge>
          </div>
          {categoryLabel(item.category) && (
            <p className="text-caption text-muted-foreground">{categoryLabel(item.category)}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" size="icon-sm" className="size-11" aria-label="Edit this screening plan" onClick={() => onEdit(item)}>
            <Pencil />
          </Button>
          <DeleteScreeningItemDialog item={item} onDeleted={() => onDeleted(item.id)} />
        </div>
      </div>

      {item.note && <p className="text-muted-foreground break-words">{item.note}</p>}

      <p className="text-caption text-muted-foreground">
        {item.plannedDate ? `Planned for ${formatFriendlyDate(item.plannedDate)}` : 'No planned date recorded'}
        {item.completedDate ? ` · Completed ${formatFriendlyDate(item.completedDate)}` : ''}
      </p>

      <div className="flex flex-wrap gap-2">
        {item.status === 'planned' ? (
          <Button type="button" size="sm" onClick={() => onComplete(item.id)}>
            Mark complete
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => onReopen(item.id)}>
            Reopen
          </Button>
        )}
      </div>
    </li>
  )
}

interface ScreeningItemListProps extends ScreeningItemActions {
  status: 'loading' | 'ready' | 'error'
  items: ScreeningItem[]
  onRetry: () => void
}

function ScreeningItemList({ status, items, onRetry, ...actions }: ScreeningItemListProps) {
  const planned = items.filter((item) => item.status === 'planned')
  const completed = items.filter((item) => item.status === 'completed')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Screening Planner</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2 py-1">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-start gap-2 py-4">
            <p className="text-sm text-muted-foreground">We couldn&apos;t load your screening planner. Please try again.</p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}

        {status === 'ready' && items.length === 0 && (
          <EmptyState
            icon={ShieldCheck}
            title="Your preventive screening planner is empty"
            description="Add a screening or health-check item to keep your personal preventive-health records organized."
          />
        )}

        {status === 'ready' && items.length > 0 && (
          <>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Planned</h3>
              {planned.length === 0 ? (
                <p className="text-caption text-muted-foreground">No planned items right now.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {planned.map((item) => (
                    <ScreeningItemCard key={item.id} item={item} {...actions} />
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Completed</h3>
              {completed.length === 0 ? (
                <p className="text-caption text-muted-foreground">You haven&apos;t marked anything complete yet.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {completed.map((item) => (
                    <ScreeningItemCard key={item.id} item={item} {...actions} />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ScreeningItemList

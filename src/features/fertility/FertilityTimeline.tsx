import { useMemo } from 'react'
import { CalendarHeart, Droplet, History } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import type { FertilityEntry } from '@/features/fertility/types'
import type { PeriodRecord } from '@/features/periods/types'

type LoadStatus = 'loading' | 'ready' | 'error'

interface TimelineItem {
  date: string
  kind: 'period' | 'entry'
  summary: string
}

interface FertilityTimelineProps {
  status: LoadStatus
  periodRecords: PeriodRecord[]
  entries: FertilityEntry[]
}

/** Combined, chronological view of cycle and fertility-entry activity — a lightweight read model, not a new data source. */
function FertilityTimeline({ status, periodRecords, entries }: FertilityTimelineProps) {
  const items = useMemo<TimelineItem[]>(() => {
    const periodItems: TimelineItem[] = periodRecords.map((record) => ({
      date: record.startDate,
      kind: 'period',
      summary: 'Period started',
    }))
    const entryItems: TimelineItem[] = entries.map((entry) => {
      const parts = [
        entry.cervicalMucus && 'cervical mucus',
        entry.bbtCelsius !== null && 'BBT',
        entry.ovulationTest && entry.ovulationTest !== 'not_tested' && 'ovulation test',
        entry.habits.length > 0 && `${entry.habits.length} habit${entry.habits.length === 1 ? '' : 's'}`,
      ].filter(Boolean)
      return {
        date: entry.entryDate,
        kind: 'entry',
        summary: parts.length > 0 ? `Logged ${parts.join(', ')}` : 'Entry recorded',
      }
    })
    return [...periodItems, ...entryItems].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 20)
  }, [periodRecords, entries])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <History className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Smart Timeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2 py-1">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {status === 'error' && (
          <p role="alert" className="py-4 text-sm text-muted-foreground">
            We couldn&apos;t load your timeline. Please try again later.
          </p>
        )}

        {status === 'ready' && items.length === 0 && (
          <EmptyState
            icon={History}
            title="Your timeline will grow with you"
            description="Cycles and fertility entries you record will appear here in order."
          />
        )}

        {status === 'ready' && items.length > 0 && (
          <ol className="flex flex-col gap-2">
            {items.map((item, index) => (
              <li key={`${item.date}-${item.kind}-${index}`} className="flex items-center gap-3 rounded-lg border border-border p-2.5 text-sm">
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                    item.kind === 'period' ? 'bg-blush text-primary' : 'bg-lavender text-primary'
                  }`}
                >
                  {item.kind === 'period' ? (
                    <Droplet className="size-3.5" aria-hidden="true" />
                  ) : (
                    <CalendarHeart className="size-3.5" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-medium text-muted-foreground">{formatFriendlyDate(item.date)}</p>
                  <p className="truncate">{item.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

export default FertilityTimeline

import { CalendarHeart } from 'lucide-react'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import {
  calculateCycleLength,
  calculateEstimatedNextPeriod,
  calculatePeriodDuration,
} from '@/features/periods/cycleCalculations'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import type { PeriodRecord } from '@/features/periods/types'

interface CycleOverviewProps {
  status: 'loading' | 'ready' | 'error'
  records: PeriodRecord[]
}

/**
 * "Cycle at a glance" hero. All values are computed exactly as before via
 * the same cycleCalculations.ts functions on the same `records` prop —
 * only the presentation changed. Recorded facts (last period date) are
 * visually distinguished from calculated estimates (lavender "Estimated"
 * chips), never presented with the same certainty.
 */
function CycleOverview({ status, records }: CycleOverviewProps) {
  const latest = records[0] ?? null
  const cycleLength = calculateCycleLength(records.map((record) => record.startDate))
  const estimatedNext = calculateEstimatedNextPeriod(latest?.startDate ?? null, cycleLength)
  const latestDuration = latest ? calculatePeriodDuration(latest.startDate, latest.endDate) : null

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <CalendarHeart className="size-4" aria-hidden="true" />
        </div>
        <h2 className="text-heading font-display text-foreground">Your cycle at a glance</h2>
      </div>

      <div className="mt-5">
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-5 w-40" />
          </div>
        )}

        {status === 'error' && (
          <p role="alert" className="text-sm text-muted-foreground">
            We couldn&apos;t load your cycle overview. Please try again later.
          </p>
        )}

        {status === 'ready' && !latest && (
          <EmptyState
            icon={CalendarHeart}
            title="No cycle records yet"
            description="Add your first period below to start seeing your personal cycle overview."
          />
        )}

        {status === 'ready' && latest && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
            <div>
              <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
                Recorded
              </p>
              <p className="mt-1 text-sm text-foreground">
                Last period started{' '}
                <span className="font-semibold">{formatFriendlyDate(latest.startDate)}</span>
                {latestDuration && (
                  <span className="text-muted-foreground">
                    {' '}
                    · {latestDuration} day{latestDuration === 1 ? '' : 's'}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {cycleLength ? (
                <span className="rounded-full bg-lavender px-3 py-1.5 text-caption font-medium text-lavender-foreground transition-colors">
                  Estimated cycle length: {cycleLength} days
                </span>
              ) : (
                <span className="rounded-full border border-dashed border-border px-3 py-1.5 text-caption text-muted-foreground">
                  Add a second period to estimate cycle length
                </span>
              )}

              {estimatedNext ? (
                <span className="rounded-full bg-lavender px-3 py-1.5 text-caption font-medium text-lavender-foreground transition-colors">
                  Estimated next period: {formatFriendlyDate(estimatedNext)}
                </span>
              ) : (
                <span className="rounded-full border border-dashed border-border px-3 py-1.5 text-caption text-muted-foreground">
                  Add more history for a next-period estimate
                </span>
              )}
            </div>

            <p className="text-caption text-muted-foreground">
              Estimates are calculated only from your recorded dates, may vary, and are not
              medical predictions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CycleOverview

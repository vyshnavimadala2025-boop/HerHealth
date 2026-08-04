import { Link } from 'react-router-dom'
import { CalendarHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import type { PeriodRecord } from '@/features/periods/types'

interface DashboardCycleCardProps {
  status: 'loading' | 'ready' | 'error'
  records: PeriodRecord[]
  cycleLength: number | null
  estimatedNextPeriod: string | null
}

function DashboardCycleCard({
  status,
  records,
  cycleLength,
  estimatedNextPeriod,
}: DashboardCycleCardProps) {
  const latest = records[0] ?? null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
            <CalendarHeart className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Cycle Tracker</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {status === 'error' && (
          <p className="text-muted-foreground">We couldn&apos;t load your cycle summary.</p>
        )}

        {status === 'ready' && !latest && (
          <p className="text-muted-foreground">
            Start tracking your cycle to see your personal timeline.
          </p>
        )}

        {status === 'ready' && latest && (
          <div className="flex flex-col gap-2">
            <p>Last period started on {formatFriendlyDate(latest.startDate)}.</p>

            {cycleLength && estimatedNextPeriod ? (
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-lavender px-2.5 py-1 text-caption font-medium text-lavender-foreground">
                  Estimated cycle length: {cycleLength} days
                </span>
                <span className="rounded-full bg-lavender px-2.5 py-1 text-caption font-medium text-lavender-foreground">
                  Estimated next period: {formatFriendlyDate(estimatedNextPeriod)}
                </span>
              </div>
            ) : (
              <p className="text-caption text-muted-foreground">
                Add at least one more period record to generate a cycle estimate.
              </p>
            )}

            <p className="text-caption text-muted-foreground">
              {records.length} period record{records.length === 1 ? '' : 's'} recorded.
            </p>
            <p className="text-caption text-muted-foreground">
              Estimates are based only on your recorded dates and may vary.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to="/cycle-tracker">Open Cycle Tracker</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default DashboardCycleCard

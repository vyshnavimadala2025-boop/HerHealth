import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
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
        <CardTitle>Cycle Tracker</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading…
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
          <div className="flex flex-col gap-1">
            <p>Last period started on {formatFriendlyDate(latest.startDate)}.</p>

            {cycleLength && estimatedNextPeriod ? (
              <>
                <p className="text-muted-foreground">
                  Estimated cycle length: {cycleLength} days
                </p>
                <p className="text-muted-foreground">
                  Estimated next period: {formatFriendlyDate(estimatedNextPeriod)}
                </p>
              </>
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

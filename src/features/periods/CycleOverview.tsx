import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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

function CycleOverview({ status, records }: CycleOverviewProps) {
  const latest = records[0] ?? null
  const cycleLength = calculateCycleLength(records.map((record) => record.startDate))
  const estimatedNext = calculateEstimatedNextPeriod(latest?.startDate ?? null, cycleLength)
  const latestDuration = latest ? calculatePeriodDuration(latest.startDate, latest.endDate) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Cycle Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your cycle overview…
          </div>
        )}

        {status === 'error' && (
          <p className="text-muted-foreground">
            We couldn&apos;t load your cycle overview. Please try again later.
          </p>
        )}

        {status === 'ready' && !latest && (
          <p className="text-muted-foreground">Add your first period to see your cycle overview.</p>
        )}

        {status === 'ready' && latest && (
          <>
            <p>
              Last period started on{' '}
              <span className="font-medium">{formatFriendlyDate(latest.startDate)}</span>.
            </p>

            {latestDuration && (
              <p>
                Last recorded period: {latestDuration} day{latestDuration === 1 ? '' : 's'}
              </p>
            )}

            {cycleLength ? (
              <p>
                Estimated cycle length: <span className="font-medium">{cycleLength} days</span>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Add at least two period start dates to see your estimated cycle length.
              </p>
            )}

            {estimatedNext ? (
              <p>
                Estimated next period:{' '}
                <span className="font-medium">{formatFriendlyDate(estimatedNext)}</span>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Add more cycle history to receive a calendar-based estimate.
              </p>
            )}

            <p className="text-caption text-muted-foreground">
              Estimates are based only on your recorded dates and may vary.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default CycleOverview

import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useCycleTrackerData } from '@/features/periods/useCycleTrackerData'
import {
  calculateCycleLength,
  calculateEstimatedNextPeriod,
} from '@/features/periods/cycleCalculations'
import { formatFriendlyDate } from '@/features/periods/dateUtils'

function DashboardCycleCard() {
  const { records, status } = useCycleTrackerData()
  const latest = records[0] ?? null
  const cycleLength = calculateCycleLength(records.map((record) => record.startDate))
  const estimatedNext = calculateEstimatedNextPeriod(latest?.startDate ?? null, cycleLength)

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
            {estimatedNext && (
              <p className="text-muted-foreground">
                Estimated next period: {formatFriendlyDate(estimatedNext)}
              </p>
            )}
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

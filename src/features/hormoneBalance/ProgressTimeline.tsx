import { LineChart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import MoodEnergyBarChart from '@/components/shared/MoodEnergyBarChart'
import type { WeeklyProgressPoint } from '@/features/hormoneBalance/hormoneCalculations'

interface ProgressTimelineProps {
  status: 'loading' | 'ready' | 'error'
  weeklyProgress: WeeklyProgressPoint[]
}

/**
 * Mood and Energy have real weekly averages, derived entirely from the
 * user's own recorded check-ins (see buildWeeklyProgressTimeline). Sleep,
 * Stress, and Hydration have no existing tracked field anywhere in the
 * schema, so they're named honestly in the legend as not yet tracked
 * rather than plotted with invented data.
 */
function ProgressTimeline({ status, weeklyProgress }: ProgressTimelineProps) {
  const hasAnyData = weeklyProgress.some((point) => point.entryCount > 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <LineChart className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Progress Timeline</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {status === 'loading' && (
          <div role="status">
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {status === 'error' && <p className="text-muted-foreground">We couldn&apos;t load your progress timeline.</p>}

        {status === 'ready' && !hasAnyData && (
          <p className="text-muted-foreground">
            Keep checking in, and your Mood and Energy patterns will appear here week by week.
          </p>
        )}

        {status === 'ready' && hasAnyData && (
          <>
            <div className="flex items-center gap-4 text-caption text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blush" aria-hidden="true" />
                Mood
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-lavender" aria-hidden="true" />
                Energy
              </span>
            </div>

            <MoodEnergyBarChart
              points={weeklyProgress.map((point) => ({ ...point, label: point.weekLabel }))}
              ariaLabel="Weekly mood and energy averages over recent weeks"
            />

            <p className="text-caption text-muted-foreground">
              Sleep, Stress, and Hydration tracking aren&apos;t available yet, so they aren&apos;t
              shown here. Mood and Energy are based only on your recorded check-ins.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ProgressTimeline

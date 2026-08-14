import { LineChart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Skeleton from '@/components/shared/Skeleton'
import MoodEnergyBarChart from '@/components/shared/MoodEnergyBarChart'
import { cn } from '@/lib/utils'
import { TIMELINE_RANGES, TIMELINE_RANGE_LABELS, type TimelineRange, type TimelinePoint } from '@/features/lifestyleIntelligence/lifestyleCalculations'

interface EnvironmentalTimelineProps {
  status: 'loading' | 'ready' | 'error'
  range: TimelineRange
  onRangeChange: (range: TimelineRange) => void
  points: TimelinePoint[]
}

/**
 * Mood and Energy have real averages, derived entirely from the user's
 * own recorded check-ins. Weather, Movement, and Outdoor Time still have
 * no tracked field anywhere in SIRILA. Stress and Hydration are now
 * genuinely tracked (Stress & Recovery, Nutrition Companion — Stage 3),
 * just not plotted on this particular chart, so the caption below points
 * to where they can actually be reviewed instead of calling them
 * unavailable (Stage 4C2).
 */
function EnvironmentalTimeline({ status, range, onRangeChange, points }: EnvironmentalTimelineProps) {
  const hasAnyData = points.some((point) => point.entryCount > 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <LineChart className="size-4" aria-hidden="true" />
            </div>
            <CardTitle>Environmental Timeline</CardTitle>
          </div>
          <div className="flex gap-1 rounded-full border border-border bg-muted/40 p-1">
            {TIMELINE_RANGES.map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onRangeChange(option)}
                className={cn(
                  'h-7 rounded-full px-3 text-caption font-medium',
                  range === option ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                )}
                aria-pressed={range === option}
              >
                {TIMELINE_RANGE_LABELS[option]}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {status === 'loading' && (
          <div role="status">
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {status === 'error' && <p className="text-muted-foreground">We couldn&apos;t load your timeline.</p>}

        {status === 'ready' && !hasAnyData && (
          <p className="text-muted-foreground">
            Keep checking in, and your Mood and Energy patterns will appear here.
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

            <MoodEnergyBarChart points={points} ariaLabel="Mood and energy averages over the selected time range" />

            <p className="text-caption text-muted-foreground">
              Weather, Movement, and Outdoor Time tracking aren&apos;t available yet, so they
              aren&apos;t shown here. Stress and Hydration are tracked in Stress &amp; Recovery and
              Nutrition Companion — not plotted on this chart, but reviewable there. Mood and
              Energy are based only on your recorded check-ins.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default EnvironmentalTimeline

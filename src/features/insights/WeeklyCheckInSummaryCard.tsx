import { ClipboardCheck } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import ProgressRing from '@/components/shared/ProgressRing'
import Skeleton from '@/components/shared/Skeleton'
import { MOOD_OPTIONS, ENERGY_LEVEL_OPTIONS, WELLBEING_OPTIONS } from '@/features/checkins/types'
import type { WeeklyCheckInSummary } from '@/features/insights/types'

function labelFor(options: readonly { value: string; label: string }[], value: string | null) {
  if (!value) return null
  return options.find((option) => option.value === value)?.label ?? value
}

interface WeeklyCheckInSummaryCardProps {
  status: 'loading' | 'ready' | 'error'
  summary: WeeklyCheckInSummary
}

function WeeklyCheckInSummaryCard({ status, summary }: WeeklyCheckInSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardCheck className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Weekly Check-In Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div role="status" className="flex items-center gap-4">
            <Skeleton className="size-16 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}

        {status === 'error' && (
          <p className="text-muted-foreground">We couldn&apos;t load your weekly summary.</p>
        )}

        {status === 'ready' && summary.count === 0 && (
          <p className="text-muted-foreground">
            Start your first check-in to begin building your personal overview.
          </p>
        )}

        {status === 'ready' && summary.count > 0 && (
          <div className="flex items-center gap-4">
            <ProgressRing
              value={summary.consistencyPercent}
              label={`${summary.consistencyPercent}% check-in consistency this week`}
              size={64}
              colorClassName="text-primary"
            >
              <span className="text-body font-display font-medium">
                {summary.consistencyPercent}%
              </span>
            </ProgressRing>
            <div className="flex flex-col gap-1.5">
              <p>
                {summary.count} check-in{summary.count === 1 ? '' : 's'} in the last 7 days
              </p>
              {labelFor(MOOD_OPTIONS, summary.mostCommonMood) && (
                <p className="text-muted-foreground">
                  Most common mood: {labelFor(MOOD_OPTIONS, summary.mostCommonMood)}
                </p>
              )}
              {labelFor(ENERGY_LEVEL_OPTIONS, summary.mostCommonEnergyLevel) && (
                <p className="text-muted-foreground">
                  Most common energy level:{' '}
                  {labelFor(ENERGY_LEVEL_OPTIONS, summary.mostCommonEnergyLevel)}
                </p>
              )}
              {labelFor(WELLBEING_OPTIONS, summary.mostCommonWellbeing) && (
                <p className="text-muted-foreground">
                  Most common wellbeing: {labelFor(WELLBEING_OPTIONS, summary.mostCommonWellbeing)}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WeeklyCheckInSummaryCard

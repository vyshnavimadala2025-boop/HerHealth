import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
        <CardTitle>Weekly Check-In Summary</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your weekly summary…
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
          <div className="flex flex-col gap-1.5">
            <p>
              {summary.count} check-in{summary.count === 1 ? '' : 's'} in the last 7 days —{' '}
              <span className="font-medium">{summary.consistencyPercent}% check-in consistency</span>
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
        )}
      </CardContent>
    </Card>
  )
}

export default WeeklyCheckInSummaryCard

import { ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import ProgressRing from '@/components/shared/ProgressRing'
import Skeleton from '@/components/shared/Skeleton'
import { ENERGY_LEVEL_OPTIONS, MOOD_OPTIONS, WELLBEING_OPTIONS } from '@/features/checkins/types'
import { getReportRangeLabel } from '@/features/reports/dateRangePresets'
import type { ReportDateRange, ReportSummary, ValueBreakdown } from '@/features/reports/types'

function optionLabel<T extends string>(options: readonly { value: T; label: string }[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? value
}

function BreakdownList<T extends string>({
  title,
  breakdown,
  options,
}: {
  title: string
  breakdown: ValueBreakdown<T>[]
  options: readonly { value: T; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium">{title}</p>
      {breakdown.length === 0 ? (
        <p className="text-caption text-muted-foreground">No entries recorded in this range.</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {breakdown.map((item) => (
            <li key={item.value} className="flex items-center justify-between text-caption text-muted-foreground">
              <span>{optionLabel(options, item.value)}</span>
              <span>{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface ReportSummaryCardProps {
  status: 'loading' | 'ready' | 'error'
  summary: ReportSummary | null
  range: ReportDateRange
  pcosWellnessEnabled: boolean
  goalsDataUnavailable: boolean
  onRetry: () => void
}

function ReportSummaryCard({
  status,
  summary,
  range,
  pcosWellnessEnabled,
  goalsDataUnavailable,
  onRetry,
}: ReportSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
            <ClipboardList className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Your Personal Report</CardTitle>
        </div>
        <CardDescription>
          {getReportRangeLabel(range.preset)} ({range.startDate} to {range.endDate}). Based only on the
          information you recorded. This is not a health score.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="flex flex-col items-start gap-2">
            <p className="text-muted-foreground">We couldn&apos;t load your report. Please try again.</p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && summary && (
          <>
            <div role="status" className="flex items-center gap-4">
              {range.preset !== 'all' && (
                <ProgressRing
                  value={summary.checkIns.consistencyPercent}
                  label={`${summary.checkIns.consistencyPercent}% check-in consistency in this range`}
                  size={72}
                  colorClassName="text-primary"
                >
                  <span className="text-body-lg font-display font-medium">
                    {summary.checkIns.consistencyPercent}%
                  </span>
                </ProgressRing>
              )}
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Check-in consistency</p>
                {range.preset === 'all' ? (
                  <p className="text-lg font-medium">
                    {summary.checkIns.count} check-in{summary.checkIns.count === 1 ? '' : 's'} recorded (all
                    time)
                  </p>
                ) : (
                  <>
                    <p className="text-lg font-medium">
                      {summary.checkIns.count} of {summary.checkIns.daysInRange} days
                    </p>
                    <p className="text-caption text-muted-foreground">Recorded in this date range.</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-3">
              <BreakdownList title="Mood" breakdown={summary.moodEnergyWellbeing.mood} options={MOOD_OPTIONS} />
              <BreakdownList
                title="Energy level"
                breakdown={summary.moodEnergyWellbeing.energyLevel}
                options={ENERGY_LEVEL_OPTIONS}
              />
              <BreakdownList
                title="Wellbeing"
                breakdown={summary.moodEnergyWellbeing.wellbeing}
                options={WELLBEING_OPTIONS}
              />
            </div>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <p className="text-sm font-medium">Period records</p>
              <p className="text-caption text-muted-foreground">
                {summary.cycle.periodRecordCount} period record
                {summary.cycle.periodRecordCount === 1 ? '' : 's'} recorded in this range.
              </p>
              {(summary.cycle.averageLoggedDurationDays !== null || summary.cycle.cycleLength !== null) && (
                <div className="flex flex-wrap gap-2">
                  {summary.cycle.averageLoggedDurationDays !== null && (
                    <span className="rounded-full bg-lavender px-2.5 py-1 text-caption text-lavender-foreground">
                      Average logged duration: {summary.cycle.averageLoggedDurationDays} days
                    </span>
                  )}
                  {summary.cycle.cycleLength !== null && (
                    <span className="rounded-full bg-lavender px-2.5 py-1 text-caption text-lavender-foreground">
                      Estimated cycle length: {summary.cycle.cycleLength} days
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 border-t border-border pt-4">
              <p className="text-sm font-medium">Wellness goals</p>
              {goalsDataUnavailable ? (
                <p className="text-caption text-muted-foreground">
                  Goal information is temporarily unavailable. Please try again shortly.
                </p>
              ) : (
                <p className="text-caption text-muted-foreground">
                  {summary.goals.activeGoalCount} active, {summary.goals.completedGoalCount} completed overall.
                  In this range: {summary.goals.goalsCreatedInRange} created, {summary.goals.goalsCompletedInRange}{' '}
                  completed, {summary.goals.progressEntriesInRange} progress entr
                  {summary.goals.progressEntriesInRange === 1 ? 'y' : 'ies'} logged.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 border-t border-border pt-4">
              <p className="text-sm font-medium">Reminder preferences</p>
              <p className="text-caption text-muted-foreground">
                {summary.reminders.enabledCount} of {summary.reminders.totalCount} reminder types currently
                enabled. This reflects your saved settings, not whether reminders were delivered or completed.
              </p>
            </div>

            {pcosWellnessEnabled && summary.pcosWellness && (
              <div className="flex flex-col gap-1 border-t border-border pt-4">
                <p className="text-sm font-medium">PCOS/PCOD wellness tracking</p>
                <p className="text-caption text-muted-foreground">
                  {summary.pcosWellness.entryCount} wellness entr
                  {summary.pcosWellness.entryCount === 1 ? 'y' : 'ies'} recorded in this range.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ReportSummaryCard

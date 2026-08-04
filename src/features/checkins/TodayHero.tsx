import { CalendarHeart, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProgressRing from '@/components/shared/ProgressRing'
import Skeleton from '@/components/shared/Skeleton'
import {
  MOOD_OPTIONS,
  ENERGY_LEVEL_OPTIONS,
  formatFriendlyTime,
  type CheckIn,
} from '@/features/checkins/types'
import { formatFriendlyDate as formatCycleDate } from '@/features/periods/dateUtils'
import type { WeeklyCheckInSummary, MoodTrendResult, EnergyTrendResult } from '@/features/insights/types'
import type { PeriodRecord } from '@/features/periods/types'

type LoadStatus = 'loading' | 'ready' | 'error'

function labelFor(options: readonly { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

/** Purely presentational time-of-day framing — no health data involved. */
function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return 'Good evening'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

interface TodayHeroProps {
  firstName: string
  todayStatus: LoadStatus
  todayCheckIn: CheckIn | null
  insightsStatus: LoadStatus
  weeklySummary: WeeklyCheckInSummary
  moodTrend: MoodTrendResult
  energyTrend: EnergyTrendResult
  periodRecords: PeriodRecord[]
  estimatedNextPeriod: string | null
}

/**
 * The dashboard's single dominant "today" panel — folds in what
 * CheckInStatusCard used to show on its own, so check-in status only
 * appears once above the fold. Every value here comes from props already
 * fetched by DashboardPage's existing useDashboardData/useInsightsData
 * calls; this component issues no query of its own.
 */
function TodayHero({
  firstName,
  todayStatus,
  todayCheckIn,
  insightsStatus,
  weeklySummary,
  moodTrend,
  energyTrend,
  periodRecords,
  estimatedNextPeriod,
}: TodayHeroProps) {
  const hasCycleData = periodRecords.length > 0
  const isLoading = todayStatus === 'loading'

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch lg:gap-5">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-8">
        <p className="text-title font-display text-foreground">
          {getTimeOfDayGreeting()}, {firstName}
        </p>
        <p className="mt-1 text-body text-muted-foreground">Your wellness space is ready for today.</p>

        <div className="mt-5 flex flex-col gap-4">
          {isLoading && (
            <div role="status" className="flex flex-col gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-9 w-44" />
            </div>
          )}

          {todayStatus === 'error' && (
            <p role="alert" className="text-sm text-muted-foreground">
              We couldn&apos;t check today&apos;s status. You can still save a check-in below.
            </p>
          )}

          {todayStatus === 'ready' && todayCheckIn && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-5 shrink-0 text-support-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground">Today&apos;s check-in is complete.</p>
                  <p className="text-caption text-muted-foreground">
                    Last saved {formatFriendlyTime(todayCheckIn.updatedAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blush px-3 py-1 text-caption font-medium text-blush-foreground">
                  Mood: {labelFor(MOOD_OPTIONS, todayCheckIn.mood)}
                </span>
                <span className="rounded-full bg-blush px-3 py-1 text-caption font-medium text-blush-foreground">
                  Energy: {labelFor(ENERGY_LEVEL_OPTIONS, todayCheckIn.energyLevel)}
                </span>
              </div>
              <a href="#checkin-form" className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline">
                Edit today&apos;s check-in
              </a>
            </div>
          )}

          {todayStatus === 'ready' && !todayCheckIn && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Clock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">Today&apos;s check-in is waiting for you.</p>
              </div>
              <Button asChild size="lg" className="h-11 w-fit">
                <a href="#checkin-form">Complete today&apos;s check-in</a>
              </Button>
            </div>
          )}

          {hasCycleData && (estimatedNextPeriod || periodRecords[0]) && (
            <div className="flex w-fit items-center gap-2 rounded-full bg-lavender px-3 py-1.5 text-caption font-medium text-lavender-foreground">
              <CalendarHeart className="size-3.5" aria-hidden="true" />
              {estimatedNextPeriod
                ? `Estimated next period: ${formatCycleDate(estimatedNextPeriod)}`
                : `Last period started ${formatCycleDate(periodRecords[0].startDate)}`}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-4">
        {insightsStatus === 'loading' ? (
          <div role="status" className="flex flex-col items-center gap-2">
            <Skeleton className="size-24 rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : insightsStatus === 'error' ? (
          <p role="alert" className="text-center text-caption text-muted-foreground">
            We couldn&apos;t load your weekly snapshot.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <ProgressRing
                value={weeklySummary.consistencyPercent}
                label={`${weeklySummary.count} of 7 days checked in, ${weeklySummary.consistencyPercent}%`}
                size={72}
                strokeWidth={7}
                colorClassName="text-primary"
              >
                <span className="font-sans text-sm font-semibold tabular-nums text-foreground">
                  {weeklySummary.count}/7
                </span>
              </ProgressRing>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-foreground">This week</p>
                <p className="text-caption text-muted-foreground">
                  {weeklySummary.consistencyPercent}% check-in consistency
                </p>
              </div>
            </div>

            {(moodTrend !== 'Limited data' || energyTrend !== 'Limited data') && (
              <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
                {moodTrend !== 'Limited data' && (
                  <span className="rounded-full bg-support/60 px-2.5 py-1 text-caption font-medium text-support-foreground">
                    Mood: {moodTrend}
                  </span>
                )}
                {energyTrend !== 'Limited data' && (
                  <span className="rounded-full bg-support/60 px-2.5 py-1 text-caption font-medium text-support-foreground">
                    Energy: {energyTrend}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TodayHero

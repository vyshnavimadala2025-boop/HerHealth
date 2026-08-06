import { CalendarHeart, Droplets, Sparkles } from 'lucide-react'
import Skeleton from '@/components/shared/Skeleton'
import ProgressRing from '@/components/shared/ProgressRing'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import type { FertilityWindow } from '@/features/fertility/fertilityCalculations'

type LoadStatus = 'loading' | 'ready' | 'error'

interface FertilityDashboardSummaryProps {
  status: LoadStatus
  hasCycleData: boolean
  fertilityWindow: FertilityWindow
  habitConsistencyPercent: number | null
}

function statusLine(hasCycleData: boolean, window: FertilityWindow): { title: string; detail: string } {
  if (!hasCycleData) {
    return {
      title: 'Add your cycle dates to begin',
      detail: 'Fertility estimates are calculated from the period dates you record in Cycle Tracker.',
    }
  }
  if (window.isOvulationDay) {
    return {
      title: 'Estimated ovulation day',
      detail: 'Based on your recorded cycle dates. This is a general estimate, not a guarantee.',
    }
  }
  if (window.isInFertileWindow) {
    return {
      title: "You're in your estimated fertile window",
      detail: 'Calculated from your own recorded dates and may vary from cycle to cycle.',
    }
  }
  if (window.fertileWindowStart === null) {
    return {
      title: 'Add a second period to estimate your window',
      detail: 'Fertility estimates need at least two recorded cycles to calculate an average length.',
    }
  }
  return {
    title: 'Outside your estimated fertile window',
    detail: 'Estimates are calculated only from your recorded dates and are not medical predictions.',
  }
}

function recommendationFor(hasCycleData: boolean, window: FertilityWindow, habitConsistencyPercent: number | null): string {
  if (!hasCycleData) return 'Record your most recent period in Cycle Tracker to see fertility estimates here.'
  if (window.isInFertileWindow) return 'Some women find it helpful to track cervical mucus and BBT daily during this window.'
  if (habitConsistencyPercent !== null && habitConsistencyPercent < 40) {
    return 'Consider picking one gentle habit to focus on today — small, consistent steps add up.'
  }
  return 'A quiet moment to check in with yourself today is enough.'
}

function FertilityDashboardSummary({
  status,
  hasCycleData,
  fertilityWindow,
  habitConsistencyPercent,
}: FertilityDashboardSummaryProps) {
  if (status === 'loading') {
    return (
      <div role="status" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Skeleton className="h-48 w-full rounded-2xl lg:col-span-8" />
        <Skeleton className="h-48 w-full rounded-2xl lg:col-span-4" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <p role="alert" className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        We couldn&apos;t load your fertility overview. Please try again later.
      </p>
    )
  }

  const { title, detail } = statusLine(hasCycleData, fertilityWindow)
  const recommendation = recommendationFor(hasCycleData, fertilityWindow, habitConsistencyPercent)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-8">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-primary">
            <CalendarHeart className="size-4" aria-hidden="true" />
          </div>
          <p className="font-display text-heading text-foreground">{title}</p>
        </div>
        <p className="text-sm text-muted-foreground">{detail}</p>

        {hasCycleData && (
          <div className="flex flex-wrap gap-2">
            {fertilityWindow.cycleDay !== null && (
              <span className="rounded-full bg-blush px-3 py-1.5 text-caption font-medium text-primary">
                Cycle day {fertilityWindow.cycleDay}
              </span>
            )}
            {fertilityWindow.fertileWindowStart && fertilityWindow.fertileWindowEnd && (
              <span className="rounded-full bg-lavender px-3 py-1.5 text-caption font-medium text-primary">
                Estimated fertile window: {formatFriendlyDate(fertilityWindow.fertileWindowStart)} –{' '}
                {formatFriendlyDate(fertilityWindow.fertileWindowEnd)}
              </span>
            )}
            {fertilityWindow.daysUntilOvulation !== null && fertilityWindow.daysUntilOvulation >= 0 && (
              <span className="rounded-full bg-lavender px-3 py-1.5 text-caption font-medium text-primary">
                {fertilityWindow.daysUntilOvulation === 0
                  ? 'Ovulation estimated today'
                  : `Estimated ovulation in ${fertilityWindow.daysUntilOvulation} day${fertilityWindow.daysUntilOvulation === 1 ? '' : 's'}`}
              </span>
            )}
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-xl bg-muted/30 p-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-caption text-muted-foreground">{recommendation}</p>
        </div>

        <p className="text-caption text-muted-foreground">
          Estimates are calculated only from your recorded dates, may vary, and are not medical
          predictions or fertility guarantees.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm lg:col-span-4">
        <div className="flex items-center gap-2 text-caption font-medium tracking-wide text-muted-foreground uppercase">
          <Droplets className="size-3.5" aria-hidden="true" />
          Wellness score
        </div>
        {habitConsistencyPercent === null ? (
          <p className="max-w-[14rem] text-sm text-muted-foreground">
            Log a few habit entries this week to see your wellness score here.
          </p>
        ) : (
          <>
            <ProgressRing
              value={habitConsistencyPercent}
              label={`${habitConsistencyPercent}% habit consistency this week`}
              size={96}
              strokeWidth={8}
              colorClassName="text-primary"
            >
              <span className="font-sans text-lg font-semibold tabular-nums text-foreground">
                {habitConsistencyPercent}%
              </span>
            </ProgressRing>
            <p className="text-caption text-muted-foreground">Based on your habit tracking this week</p>
          </>
        )}
      </div>
    </div>
  )
}

export default FertilityDashboardSummary

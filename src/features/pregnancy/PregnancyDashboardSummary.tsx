import { Heart, Sparkles } from 'lucide-react'
import Skeleton from '@/components/shared/Skeleton'
import ProgressRing from '@/components/shared/ProgressRing'
import { getWeekContent } from '@/features/pregnancy/weeklyContent'
import type { PregnancyProgress } from '@/features/pregnancy/pregnancyCalculations'

type LoadStatus = 'loading' | 'ready' | 'error'

const TRIMESTER_LABEL: Record<1 | 2 | 3, string> = {
  1: 'First trimester',
  2: 'Second trimester',
  3: 'Third trimester',
}

interface PregnancyDashboardSummaryProps {
  status: LoadStatus
  progress: PregnancyProgress
  wellnessScore: number | null
}

function PregnancyDashboardSummary({ status, progress, wellnessScore }: PregnancyDashboardSummaryProps) {
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
        We couldn&apos;t load your pregnancy overview. Please try again later.
      </p>
    )
  }

  const content = getWeekContent(progress.currentWeek)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-8">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-primary">
            <Heart className="size-4" aria-hidden="true" />
          </div>
          <p className="font-display text-heading text-foreground">Week {progress.currentWeek}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {TRIMESTER_LABEL[progress.trimester]} — your baby is about the size of {content.babySize} this
          week.
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-blush px-3 py-1.5 text-caption font-medium text-primary">
            {progress.isPastDue
              ? 'Estimated due date has passed'
              : `${progress.daysUntilDue} day${progress.daysUntilDue === 1 ? '' : 's'} until your due date`}
          </span>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-muted/30 p-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-caption font-medium text-foreground">Today&apos;s self-care focus</p>
            <p className="text-caption text-muted-foreground">{content.wellnessFocus}</p>
          </div>
        </div>

        <p className="text-caption text-muted-foreground">
          This is a general wellness estimate based on the due date you entered — not a medical
          assessment.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm lg:col-span-4">
        <div className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
          Wellness score
        </div>
        {wellnessScore === null ? (
          <p className="max-w-[14rem] text-sm text-muted-foreground">
            Log a few entries this week to see your wellness score here.
          </p>
        ) : (
          <>
            <ProgressRing
              value={wellnessScore}
              label={`${wellnessScore}% wellness score this week`}
              size={96}
              strokeWidth={8}
              colorClassName="text-primary"
            >
              <span className="font-sans text-lg font-semibold tabular-nums text-foreground">{wellnessScore}%</span>
            </ProgressRing>
            <p className="text-caption text-muted-foreground">Based on your tracking this week</p>
          </>
        )}
      </div>
    </div>
  )
}

export default PregnancyDashboardSummary

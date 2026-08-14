import { TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import ProgressRing from '@/components/shared/ProgressRing'
import Skeleton from '@/components/shared/Skeleton'
import type { ActivityCounts } from '@/features/goals/types'

interface ProgressSummaryCardProps {
  status: 'loading' | 'ready' | 'error'
  counts: ActivityCounts | null
  activeGoalsCount: number
  completedGoalsCount: number
}

function ProgressSummaryCard({
  status,
  counts,
  activeGoalsCount,
  completedGoalsCount,
}: ProgressSummaryCardProps) {
  const hasAnyActivity =
    counts !== null &&
    (counts.totalCheckIns > 0 ||
      counts.totalJournalEntries > 0 ||
      counts.totalPeriodRecords > 0 ||
      activeGoalsCount > 0 ||
      completedGoalsCount > 0)

  const totalGoals = activeGoalsCount + completedGoalsCount
  const completionRate = totalGoals > 0 ? Math.round((completedGoalsCount / totalGoals) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
            <TrendingUp className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Your Personal Progress</CardTitle>
        </div>
        <CardDescription>
          Based on the information you recorded. This is not a health score.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div role="status" className="flex items-center gap-4">
            <Skeleton className="size-20 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}

        {status === 'error' && (
          <p className="text-muted-foreground">We couldn&apos;t load your progress summary.</p>
        )}

        {status === 'ready' && counts && !hasAnyActivity && (
          <p className="text-muted-foreground">
            Your progress will appear here as you use SIRILA.
          </p>
        )}

        {status === 'ready' && counts && hasAnyActivity && (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {totalGoals > 0 && (
              <ProgressRing
                value={completionRate}
                label={`${completedGoalsCount} of ${totalGoals} goals completed, ${completionRate}%`}
                size={88}
                colorClassName="text-lavender-foreground"
              >
                <div className="flex flex-col items-center">
                  <span className="text-heading font-display font-medium">{completionRate}%</span>
                  <span className="text-caption text-muted-foreground">complete</span>
                </div>
              </ProgressRing>
            )}
            <ul className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
              <li>
                <p className="text-lg font-medium">{counts.totalCheckIns}</p>
                <p className="text-caption text-muted-foreground">Check-ins recorded</p>
              </li>
              <li>
                <p className="text-lg font-medium">{counts.totalJournalEntries}</p>
                <p className="text-caption text-muted-foreground">Journal entries</p>
              </li>
              <li>
                <p className="text-lg font-medium">{counts.totalPeriodRecords}</p>
                <p className="text-caption text-muted-foreground">Period records</p>
              </li>
              <li>
                <p className="text-lg font-medium">{activeGoalsCount}</p>
                <p className="text-caption text-muted-foreground">Active goals</p>
              </li>
              <li>
                <p className="text-lg font-medium">{completedGoalsCount}</p>
                <p className="text-caption text-muted-foreground">Completed goals</p>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProgressSummaryCard

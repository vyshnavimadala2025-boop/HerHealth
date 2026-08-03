import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Personal Progress</CardTitle>
        <CardDescription>
          Based on the information you recorded. This is not a health score.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your progress…
          </div>
        )}

        {status === 'error' && (
          <p className="text-muted-foreground">We couldn&apos;t load your progress summary.</p>
        )}

        {status === 'ready' && counts && !hasAnyActivity && (
          <p className="text-muted-foreground">
            Your progress will appear here as you use HerHealth.
          </p>
        )}

        {status === 'ready' && counts && hasAnyActivity && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
        )}
      </CardContent>
    </Card>
  )
}

export default ProgressSummaryCard

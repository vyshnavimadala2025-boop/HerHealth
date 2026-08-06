import { FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type { PregnancyEntry, PregnancyMilestone } from '@/features/pregnancy/types'

type LoadStatus = 'loading' | 'ready' | 'error'

interface WeeklyReportProps {
  status: LoadStatus
  entries: PregnancyEntry[]
  milestones: PregnancyMilestone[]
  wellnessScore: number | null
}

/** A real, computed weekly summary — every figure here is derived from the user's own recorded entries, never invented. */
function WeeklyReport({ status, entries, milestones, wellnessScore }: WeeklyReportProps) {
  const weekPrefix = getLocalDateString().slice(0, 7)
  const entriesThisMonth = entries.filter((entry) => entry.entryDate.startsWith(weekPrefix))
  const goodSleepDays = entriesThisMonth.filter((entry) => entry.sleepQuality === 'good' || entry.sleepQuality === 'excellent').length
  const exerciseDays = entriesThisMonth.filter((entry) => entry.exerciseMinutes !== null && entry.exerciseMinutes > 0).length
  const milestonesThisMonth = milestones.filter((milestone) => milestone.milestoneDate.startsWith(weekPrefix)).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-support/60 text-support-foreground">
            <FileText className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Monthly Wellness Report</CardTitle>
        </div>
        <CardDescription>A private summary of this month&apos;s recorded activity.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {status === 'error' && <p className="text-muted-foreground">We couldn&apos;t load your monthly report.</p>}

        {status === 'ready' && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <li>
              <p className="text-lg font-medium">{entriesThisMonth.length}</p>
              <p className="text-caption text-muted-foreground">Entries this month</p>
            </li>
            <li>
              <p className="text-lg font-medium">{wellnessScore !== null ? `${wellnessScore}%` : '—'}</p>
              <p className="text-caption text-muted-foreground">Wellness score</p>
            </li>
            <li>
              <p className="text-lg font-medium">{goodSleepDays}</p>
              <p className="text-caption text-muted-foreground">Good sleep days</p>
            </li>
            <li>
              <p className="text-lg font-medium">{exerciseDays}</p>
              <p className="text-caption text-muted-foreground">Active days</p>
            </li>
            <li>
              <p className="text-lg font-medium">{milestonesThisMonth}</p>
              <p className="text-caption text-muted-foreground">Milestones this month</p>
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default WeeklyReport

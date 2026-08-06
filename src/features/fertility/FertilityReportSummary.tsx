import { ClipboardList } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type { FertilityEntry } from '@/features/fertility/types'

type LoadStatus = 'loading' | 'ready' | 'error'

interface FertilityReportSummaryProps {
  status: LoadStatus
  entries: FertilityEntry[]
  cycleLength: number | null
  habitConsistencyPercent: number | null
}

/** A real, computed monthly summary — every figure here is derived from the user's own recorded entries, never invented. */
function FertilityReportSummary({ status, entries, cycleLength, habitConsistencyPercent }: FertilityReportSummaryProps) {
  const monthPrefix = getLocalDateString().slice(0, 7)
  const entriesThisMonth = entries.filter((entry) => entry.entryDate.startsWith(monthPrefix))
  const bbtLoggedCount = entriesThisMonth.filter((entry) => entry.bbtCelsius !== null).length
  const positiveTestCount = entriesThisMonth.filter((entry) => entry.ovulationTest === 'positive').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-support/60 text-support-foreground">
            <ClipboardList className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Monthly Summary</CardTitle>
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

        {status === 'error' && <p className="text-muted-foreground">We couldn&apos;t load your monthly summary.</p>}

        {status === 'ready' && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <li>
              <p className="text-lg font-medium">{entriesThisMonth.length}</p>
              <p className="text-caption text-muted-foreground">Entries this month</p>
            </li>
            <li>
              <p className="text-lg font-medium">{cycleLength ?? '—'}</p>
              <p className="text-caption text-muted-foreground">Estimated cycle length</p>
            </li>
            <li>
              <p className="text-lg font-medium">{bbtLoggedCount}</p>
              <p className="text-caption text-muted-foreground">Temperature logs</p>
            </li>
            <li>
              <p className="text-lg font-medium">{habitConsistencyPercent !== null ? `${habitConsistencyPercent}%` : '—'}</p>
              <p className="text-caption text-muted-foreground">Habit consistency</p>
            </li>
          </ul>
        )}

        {status === 'ready' && positiveTestCount > 0 && (
          <p className="mt-3 text-caption text-muted-foreground">
            {positiveTestCount} positive ovulation test{positiveTestCount === 1 ? '' : 's'} recorded this month.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default FertilityReportSummary

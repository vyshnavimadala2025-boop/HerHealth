import { History } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { MOOD_OPTIONS, ENERGY_LEVEL_OPTIONS, WELLBEING_OPTIONS, type CheckIn } from '@/features/checkins/types'

function labelFor(options: readonly { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

function formatEntryDate(checkinDate: string) {
  const [year, month, day] = checkinDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

interface RecentCheckInsProps {
  status: 'loading' | 'ready' | 'error'
  checkIns: CheckIn[]
}

function RecentCheckIns({ status, checkIns }: RecentCheckInsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <History className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Your Recent Check-Ins</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2 py-1">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {status === 'error' && (
          <p className="py-4 text-sm text-muted-foreground">
            We couldn&apos;t load your recent check-ins. Please try again later.
          </p>
        )}

        {status === 'ready' && checkIns.length === 0 && (
          <EmptyState
            icon={History}
            title="No check-ins yet"
            description="Your check-in history will appear here once you start tracking."
          />
        )}

        {status === 'ready' && checkIns.length > 0 && (
          <ul className="flex flex-col gap-2">
            {checkIns.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-1 rounded-lg border border-border p-3 text-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium">{formatEntryDate(entry.checkinDate)}</span>
                <span className="text-muted-foreground">
                  {labelFor(MOOD_OPTIONS, entry.mood)} · {labelFor(ENERGY_LEVEL_OPTIONS, entry.energyLevel)}{' '}
                  energy · {labelFor(WELLBEING_OPTIONS, entry.wellbeing)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentCheckIns

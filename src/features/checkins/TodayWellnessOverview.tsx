import { CalendarHeart, Heart, Smile, Zap, type LucideIcon } from 'lucide-react'
import Skeleton from '@/components/shared/Skeleton'
import {
  MOOD_OPTIONS,
  ENERGY_LEVEL_OPTIONS,
  WELLBEING_OPTIONS,
  type CheckIn,
} from '@/features/checkins/types'
import { formatFriendlyDate as formatCycleDate } from '@/features/periods/dateUtils'
import type { PeriodRecord } from '@/features/periods/types'

type LoadStatus = 'loading' | 'ready' | 'error'

function labelFor(options: readonly { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

interface OverviewCardProps {
  icon: LucideIcon
  accent: string
  title: string
  value: string
  caption: string
}

function OverviewCard({ icon: Icon, accent, title, value, caption }: OverviewCardProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className={`flex size-9 items-center justify-center rounded-full ${accent}`}>
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div>
        <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
        <p className="text-caption text-muted-foreground">{caption}</p>
      </div>
    </div>
  )
}

interface TodayWellnessOverviewProps {
  todayStatus: LoadStatus
  todayCheckIn: CheckIn | null
  periodRecords: PeriodRecord[]
  estimatedNextPeriod: string | null
}

/**
 * Four real-data cards. There's no "daily intention" field anywhere in
 * the check-ins schema (mood/energyLevel/wellbeing/note only), so this
 * uses the real `wellbeing` field as the fourth card instead of
 * fabricating an intention value that doesn't exist.
 */
function TodayWellnessOverview({
  todayStatus,
  todayCheckIn,
  periodRecords,
  estimatedNextPeriod,
}: TodayWellnessOverviewProps) {
  if (todayStatus === 'loading') {
    return (
      <div role="status" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  const hasCycleData = periodRecords.length > 0

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <OverviewCard
        icon={Smile}
        accent="bg-blush text-primary"
        title="Mood"
        value={todayCheckIn ? labelFor(MOOD_OPTIONS, todayCheckIn.mood) : 'Not checked in yet'}
        caption={todayCheckIn ? 'Based on your latest check-in' : 'Complete today’s check-in'}
      />
      <OverviewCard
        icon={Zap}
        accent="bg-lavender text-primary"
        title="Energy"
        value={todayCheckIn ? labelFor(ENERGY_LEVEL_OPTIONS, todayCheckIn.energyLevel) : 'Not checked in yet'}
        caption={todayCheckIn ? 'Based on your latest check-in' : 'Complete today’s check-in'}
      />
      <OverviewCard
        icon={Heart}
        accent="bg-blush text-primary"
        title="Wellbeing"
        value={todayCheckIn ? labelFor(WELLBEING_OPTIONS, todayCheckIn.wellbeing) : 'Not checked in yet'}
        caption={todayCheckIn ? 'Based on your latest check-in' : 'Complete today’s check-in'}
      />
      <OverviewCard
        icon={CalendarHeart}
        accent="bg-lavender text-primary"
        title="Cycle"
        value={hasCycleData ? 'Cycle awareness' : 'Not recorded yet'}
        caption={
          hasCycleData
            ? estimatedNextPeriod
              ? `Estimated next period: ${formatCycleDate(estimatedNextPeriod)}`
              : 'View your personal timeline'
            : 'Add a period to begin tracking'
        }
      />
    </div>
  )
}

export default TodayWellnessOverview

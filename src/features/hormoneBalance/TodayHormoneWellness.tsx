import { CalendarHeart, Droplet, Footprints, Moon, Smile, Waves, Zap } from 'lucide-react'
import Skeleton from '@/components/shared/Skeleton'
import { ENERGY_LEVEL_OPTIONS, MOOD_OPTIONS, type CheckIn } from '@/features/checkins/types'
import type { CyclePhaseEstimate } from '@/features/hormoneBalance/hormoneCalculations'
import type { HormoneWellnessCard } from '@/features/hormoneBalance/types'

function labelFor(options: readonly { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

/**
 * Only Energy, Mood, and Cycle Phase are backed by real SIRILA data
 * (daily check-ins and period records). Sleep, Stress, Hydration, and
 * Movement have no existing tracked field anywhere in the schema, so per
 * this feature's presentation-layer-only scope they're shown honestly as
 * "not yet tracked" rather than filled with invented numbers.
 */
export function buildTodayHormoneWellnessCards(
  todayCheckIn: CheckIn | null,
  cyclePhaseEstimate: CyclePhaseEstimate | null,
): HormoneWellnessCard[] {
  return [
    {
      key: 'energy',
      icon: Zap,
      label: 'Energy',
      value: todayCheckIn ? labelFor(ENERGY_LEVEL_OPTIONS, todayCheckIn.energyLevel) : 'Not checked in yet',
      caption: todayCheckIn ? 'From today’s check-in' : 'Complete today’s check-in',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: Boolean(todayCheckIn),
    },
    {
      key: 'mood',
      icon: Smile,
      label: 'Mood',
      value: todayCheckIn ? labelFor(MOOD_OPTIONS, todayCheckIn.mood) : 'Not checked in yet',
      caption: todayCheckIn ? 'From today’s check-in' : 'Complete today’s check-in',
      accentClassName: 'bg-blush text-blush-foreground',
      tracked: Boolean(todayCheckIn),
    },
    {
      key: 'sleep',
      icon: Moon,
      label: 'Sleep',
      value: 'Not yet tracked',
      caption: 'Sleep tracking isn’t available yet',
      accentClassName: 'bg-muted text-muted-foreground',
      tracked: false,
    },
    {
      key: 'stress',
      icon: Waves,
      label: 'Stress',
      value: 'Not yet tracked',
      caption: 'Stress tracking isn’t available yet',
      accentClassName: 'bg-muted text-muted-foreground',
      tracked: false,
    },
    {
      key: 'hydration',
      icon: Droplet,
      label: 'Hydration',
      value: 'Not yet tracked',
      caption: 'Hydration tracking isn’t available yet',
      accentClassName: 'bg-muted text-muted-foreground',
      tracked: false,
    },
    {
      key: 'movement',
      icon: Footprints,
      label: 'Movement',
      value: 'Not yet tracked',
      caption: 'Movement tracking isn’t available yet',
      accentClassName: 'bg-muted text-muted-foreground',
      tracked: false,
    },
    {
      key: 'cycle-phase',
      icon: CalendarHeart,
      label: 'Cycle Phase',
      value: cyclePhaseEstimate ? cyclePhaseEstimate.phase : 'Not recorded yet',
      caption: cyclePhaseEstimate ? `Estimated day ${cyclePhaseEstimate.cycleDay} of your cycle` : 'Add a period to see this',
      accentClassName: 'bg-accent text-accent-foreground',
      tracked: Boolean(cyclePhaseEstimate),
    },
  ]
}

interface TodayHormoneWellnessProps {
  status: 'loading' | 'ready' | 'error'
  cards: HormoneWellnessCard[]
}

function TodayHormoneWellness({ status, cards }: TodayHormoneWellnessProps) {
  if (status === 'loading') {
    return (
      <div role="status" className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
        >
          <div className={`flex size-9 items-center justify-center rounded-full ${card.accentClassName}`}>
            <card.icon className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{card.label}</p>
            <p className="text-sm font-medium text-foreground">{card.value}</p>
            <p className="text-caption text-muted-foreground">{card.caption}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TodayHormoneWellness

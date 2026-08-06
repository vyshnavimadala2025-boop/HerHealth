import { Briefcase, Droplet, Footprints, Home, Moon, Smartphone, Sun, Waves } from 'lucide-react'
import MetricCardGrid, { type MetricCard } from '@/components/shared/MetricCardGrid'

const NOT_TRACKED = 'Not yet tracked'
const NOT_TRACKED_ACCENT = 'bg-muted text-muted-foreground'

/**
 * None of these eight metrics have a tracked field anywhere in HerHealth
 * today, so every card is honestly shown as "not yet tracked" rather than
 * filled with an invented reading.
 */
const SNAPSHOT_CARDS: MetricCard[] = [
  {
    key: 'sleep-quality',
    icon: Moon,
    label: 'Sleep Quality',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Restful, consistent sleep supports the body’s natural rhythms.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'hydration',
    icon: Droplet,
    label: 'Hydration',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Staying hydrated throughout the day supports overall wellbeing.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'movement',
    icon: Footprints,
    label: 'Movement',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Gentle, regular movement supports mood and energy.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'stress',
    icon: Waves,
    label: 'Stress',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'How the body responds to stress can shift throughout the day.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'outdoor-time',
    icon: Sun,
    label: 'Outdoor Time',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Time outdoors is often associated with a lift in mood.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'screen-time',
    icon: Smartphone,
    label: 'Screen Time',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Mindful screen breaks can support focus and rest.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'work-environment',
    icon: Briefcase,
    label: 'Work Environment',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'A comfortable workspace can support focus and ease.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'environmental-comfort',
    icon: Home,
    label: 'Environmental Comfort',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'A comfortable surrounding space can support general ease.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
]

interface TodaySnapshotProps {
  status: 'loading' | 'ready' | 'error'
}

function TodaySnapshot({ status }: TodaySnapshotProps) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg text-foreground">Today&apos;s Lifestyle Snapshot</h2>
        <p className="text-caption text-muted-foreground">
          A snapshot of the everyday factors that may influence how you feel.
        </p>
      </div>
      <MetricCardGrid status={status} cards={SNAPSHOT_CARDS} />
    </section>
  )
}

export default TodaySnapshot

import {
  Armchair,
  Car,
  CloudSun,
  DoorOpen,
  Droplets,
  Monitor,
  SunMedium,
  Thermometer,
  Volume2,
  Wind,
} from 'lucide-react'
import MetricCardGrid, { type MetricCard } from '@/components/shared/MetricCardGrid'

const NOT_TRACKED = 'Not yet tracked'
const NOT_TRACKED_ACCENT = 'bg-muted text-muted-foreground'

/**
 * Environmental signals (weather, air quality, UV, noise, and so on)
 * would require a new external data integration that this presentation-
 * layer-only feature deliberately doesn't add. Every card is shown
 * honestly as not yet tracked, with calm educational context rather than
 * an invented reading — and never an alarming warning.
 */
const ENVIRONMENTAL_CARDS: MetricCard[] = [
  {
    key: 'air-quality',
    icon: Wind,
    label: 'Air Quality',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Indoor air quality can be supported by ventilation and fresh air.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'weather',
    icon: CloudSun,
    label: 'Weather',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Weather can gently influence mood, energy, and routine.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'temperature',
    icon: Thermometer,
    label: 'Temperature',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'A comfortable temperature can support rest and focus.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'humidity',
    icon: Droplets,
    label: 'Humidity',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Comfortable humidity levels can support general ease.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'uv-exposure',
    icon: SunMedium,
    label: 'UV Exposure',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Being mindful of sun exposure is part of everyday outdoor time.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'noise-level',
    icon: Volume2,
    label: 'Noise Level',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'A calmer sound environment can support focus and relaxation.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'travel-frequency',
    icon: Car,
    label: 'Travel Frequency',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Frequent travel can shift routine, sleep, and rest.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'sitting-duration',
    icon: Armchair,
    label: 'Sitting Duration',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Breaking up long sitting periods can support comfort and movement.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'workspace-comfort',
    icon: Monitor,
    label: 'Workspace Comfort',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'A comfortable, well-set-up workspace can support ease and focus.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'indoor-outdoor-time',
    icon: DoorOpen,
    label: 'Indoor vs Outdoor Time',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'A mix of indoor and outdoor time can support overall wellbeing.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
]

interface EnvironmentalWellnessProps {
  status: 'loading' | 'ready' | 'error'
}

function EnvironmentalWellness({ status }: EnvironmentalWellnessProps) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg text-foreground">Environmental Wellness</h2>
        <p className="text-caption text-muted-foreground">
          General, educational context about your surroundings — never an alarming reading.
        </p>
      </div>
      <MetricCardGrid
        status={status}
        cards={ENVIRONMENTAL_CARDS}
        columnsClassName="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
      />
    </section>
  )
}

export default EnvironmentalWellness

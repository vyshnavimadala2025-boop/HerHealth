import { CloudSun, Droplet, Droplets, SunMedium, Thermometer, Wind } from 'lucide-react'
import MetricCardGrid, { type MetricCard } from '@/components/shared/MetricCardGrid'

const NOT_TRACKED = 'Not yet tracked'
const NOT_TRACKED_ACCENT = 'bg-muted text-muted-foreground'

/**
 * Reading these values (air quality, temperature, humidity, UV index,
 * weather) honestly would require a new external data integration, which
 * this presentation-layer-only feature deliberately doesn't add without
 * separate approval. Every card is shown as not yet tracked, with calm
 * educational context rather than an invented reading — never an
 * alarming warning.
 */
const TODAYS_ENVIRONMENT_CARDS: MetricCard[] = [
  {
    key: 'air-quality',
    icon: Wind,
    label: 'Air Quality',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Fresh air and good ventilation can support overall comfort.',
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
    key: 'uv-index',
    icon: SunMedium,
    label: 'UV Index',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Being mindful of sun exposure is part of everyday outdoor time.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'weather-feel',
    icon: CloudSun,
    label: 'Weather Feel',
    status: NOT_TRACKED,
    trend: 'Weekly trend: not yet available',
    caption: 'Weather can gently influence mood, energy, and routine.',
    accentClassName: NOT_TRACKED_ACCENT,
    tracked: false,
  },
  {
    key: 'hydration-reminder',
    icon: Droplet,
    label: 'Hydration Reminder',
    status: 'Stay hydrated today',
    trend: 'A gentle reminder, not a tracked reading',
    caption: 'Keeping water nearby throughout the day supports overall wellbeing.',
    accentClassName: 'bg-lavender text-lavender-foreground',
    tracked: false,
  },
]

interface TodaysEnvironmentProps {
  status: 'loading' | 'ready' | 'error'
}

/** Section 1 — a premium overview of today's environmental context. */
function TodaysEnvironment({ status }: TodaysEnvironmentProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-support/25 to-transparent p-5">
        <p className="text-caption font-medium tracking-wide text-primary uppercase">Today&apos;s Environment</p>
        <h2 className="font-display text-lg text-foreground">Your wellness environment, at a glance</h2>
        <p className="text-caption text-muted-foreground">
          General, educational context about your surroundings — never an alarming reading.
        </p>
      </div>
      <MetricCardGrid status={status} cards={TODAYS_ENVIRONMENT_CARDS} />
    </section>
  )
}

export default TodaysEnvironment

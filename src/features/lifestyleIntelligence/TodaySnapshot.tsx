import { Briefcase, Droplet, Footprints, Home, Moon, Smartphone, Sun, Waves } from 'lucide-react'
import MetricCardGrid, { type MetricCard } from '@/components/shared/MetricCardGrid'
import type { SourceStatus } from '@/components/shared/dataStateText'
import { describeTrackedFactor } from '@/components/shared/dataStateText'
import type { SleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import type { NutritionSummary } from '@/features/nutritionCompanion/nutritionCalculations'
import type { StressRecoverySummary } from '@/features/stressRecovery/stressRecoveryCalculations'

const NOT_TRACKED = 'Not yet tracked'
const NOT_TRACKED_ACCENT = 'bg-muted text-muted-foreground'
const TRACKED_ACCENT = 'bg-lavender text-lavender-foreground'

/**
 * Movement, Outdoor Time, Screen Time, Work Environment, and
 * Environmental Comfort have no tracked field anywhere in SIRILA
 * today, so these five stay honestly "not yet tracked". Sleep Quality,
 * Hydration, and Stress are built from real Stage 3 data below.
 */
const UNTRACKED_CARDS: MetricCard[] = [
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
  sleepStatus: SourceStatus
  sleepSummary: SleepSummary
  nutritionStatus: SourceStatus
  nutritionSummary: NutritionSummary
  stressRecoveryStatus: SourceStatus
  stressRecoverySummary: StressRecoverySummary
}

function TodaySnapshot({
  status,
  sleepStatus,
  sleepSummary,
  nutritionStatus,
  nutritionSummary,
  stressRecoveryStatus,
  stressRecoverySummary,
}: TodaySnapshotProps) {
  const sleep = describeTrackedFactor(
    sleepStatus,
    sleepSummary.hasSufficientData,
    sleepSummary.qualityTrend,
    'From Sleep Intelligence',
  )
  const hydration = describeTrackedFactor(
    nutritionStatus,
    nutritionSummary.hasSufficientData && nutritionSummary.avgHydrationGlasses !== null,
    `Avg ${nutritionSummary.avgHydrationGlasses} glasses/day`,
    'From Nutrition Companion',
  )
  const stress = describeTrackedFactor(
    stressRecoveryStatus,
    stressRecoverySummary.hasSufficientData,
    stressRecoverySummary.stressTrend,
    'From Stress & Recovery',
  )

  const cards: MetricCard[] = [
    {
      key: 'sleep-quality',
      icon: Moon,
      label: 'Sleep Quality',
      status: sleep.statusText,
      trend: sleep.trendText,
      caption: 'Restful, consistent sleep supports the body’s natural rhythms.',
      accentClassName: TRACKED_ACCENT,
      tracked: true,
    },
    {
      key: 'hydration',
      icon: Droplet,
      label: 'Hydration',
      status: hydration.statusText,
      trend: hydration.trendText,
      caption: 'Staying hydrated throughout the day supports overall wellbeing.',
      accentClassName: TRACKED_ACCENT,
      tracked: true,
    },
    UNTRACKED_CARDS[0],
    {
      key: 'stress',
      icon: Waves,
      label: 'Stress',
      status: stress.statusText,
      trend: stress.trendText,
      caption: 'How the body responds to stress can shift throughout the day.',
      accentClassName: TRACKED_ACCENT,
      tracked: true,
    },
    UNTRACKED_CARDS[1],
    UNTRACKED_CARDS[2],
    UNTRACKED_CARDS[3],
    UNTRACKED_CARDS[4],
  ]

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg text-foreground">Today&apos;s Lifestyle Snapshot</h2>
        <p className="text-caption text-muted-foreground">
          A snapshot of the everyday factors that may influence how you feel.
        </p>
      </div>
      <MetricCardGrid status={status} cards={cards} />
    </section>
  )
}

export default TodaySnapshot

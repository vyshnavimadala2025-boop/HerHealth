import { CalendarCheck, HeartHandshake, Sparkles, TrendingUp, Waves } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import EmptyState from '@/components/shared/EmptyState'
import MetricCardGrid, { type MetricCard } from '@/components/shared/MetricCardGrid'
import MiniTrendChart from '@/components/shared/MiniTrendChart'
import {
  LEVEL_SCORES,
  MIN_USABLE_DAYS,
  type StressRecoverySummary,
} from '@/features/stressRecovery/stressRecoveryCalculations'
import { RECOVERY_LEVEL_OPTIONS, STRESS_LEVEL_OPTIONS, type StressRecoveryEntry } from '@/features/stressRecovery/types'

function optionLabel(options: readonly { value: string; label: string }[], value: string | null) {
  if (!value) return 'Not enough data'
  return options.find((option) => option.value === value)?.label ?? value
}

function shortDateLabel(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

interface StressRecoverySummaryCardProps {
  status: 'loading' | 'ready' | 'error'
  summary: StressRecoverySummary
  chartEntries: StressRecoveryEntry[]
  sleepObservation: string | null
}

/**
 * Every metric is calculateStressRecoverySummary()'s honest, real-data-only
 * output — reuses MetricCardGrid and MiniTrendChart exactly as Sleep
 * Intelligence/Nutrition Companion do. Below MIN_USABLE_DAYS=3, shows an
 * honest "not enough data" state instead of a fabricated stress/recovery
 * score (none is ever calculated — see stressRecoveryCalculations.ts).
 */
function StressRecoverySummaryCard({ status, summary, chartEntries, sleepObservation }: StressRecoverySummaryCardProps) {
  const stressPoints = [...chartEntries]
    .filter((entry) => entry.stressLevel !== null)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
    .slice(-14)
    .map((entry) => ({ label: shortDateLabel(entry.entryDate), value: entry.stressLevel ? LEVEL_SCORES[entry.stressLevel] : null }))

  const recoveryPoints = [...chartEntries]
    .filter((entry) => entry.recoveryLevel !== null)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
    .slice(-14)
    .map((entry) => ({ label: shortDateLabel(entry.entryDate), value: entry.recoveryLevel ? LEVEL_SCORES[entry.recoveryLevel] : null }))

  const cards: MetricCard[] = [
    {
      key: 'days-tracked',
      icon: CalendarCheck,
      label: 'Days tracked',
      status: `${summary.daysTracked}`,
      trend: 'Last 30 days',
      caption: 'Days with a recorded check-in.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: summary.daysTracked > 0,
    },
    {
      key: 'consistency',
      icon: HeartHandshake,
      label: 'Check-in consistency',
      status: `${summary.consistencyPercent}%`,
      trend: 'Share of the last 30 days',
      caption: 'Share of the last 30 days with a recorded check-in.',
      accentClassName: 'bg-support text-support-foreground',
      tracked: summary.daysTracked > 0,
    },
    {
      key: 'recent-stress',
      icon: Waves,
      label: 'Most recent stress level',
      status: optionLabel(STRESS_LEVEL_OPTIONS, summary.recentStressLevel),
      trend: 'Latest recorded entry',
      caption: 'Your tracked stress level from your most recent entry.',
      accentClassName: 'bg-accent text-accent-foreground',
      tracked: summary.recentStressLevel !== null,
    },
    {
      key: 'recent-recovery',
      icon: Sparkles,
      label: 'Most recent recovery level',
      status: optionLabel(RECOVERY_LEVEL_OPTIONS, summary.recentRecoveryLevel),
      trend: 'Latest recorded entry',
      caption: 'Your tracked recovery level from your most recent entry.',
      accentClassName: 'bg-blush text-blush-foreground',
      tracked: summary.recentRecoveryLevel !== null,
    },
    {
      key: 'stress-trend',
      icon: TrendingUp,
      label: 'Stress trend',
      status: summary.stressTrend,
      trend: 'Based on your recorded stress levels',
      caption: 'Your recent tracked stress pattern — educational only.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: summary.stressTrend !== 'Limited data',
    },
    {
      key: 'recovery-trend',
      icon: TrendingUp,
      label: 'Recovery trend',
      status: summary.recoveryTrend,
      trend: 'Based on your recorded recovery levels',
      caption: 'Your recent tracked recovery pattern — educational only.',
      accentClassName: 'bg-support text-support-foreground',
      tracked: summary.recoveryTrend !== 'Limited data',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Stress &amp; Recovery Patterns</CardTitle>
        <CardDescription>Based only on what you&apos;ve recorded — never a diagnosis or clinical score.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {!summary.hasSufficientData ? (
          <EmptyState
            icon={HeartHandshake}
            title="Not enough data yet"
            description={`Keep checking in (at least ${MIN_USABLE_DAYS} days) to understand your personal stress and recovery patterns over time.`}
          />
        ) : (
          <>
            <MetricCardGrid status={status} cards={cards} columnsClassName="grid grid-cols-2 gap-4 sm:grid-cols-3" />
            <div className="grid grid-cols-1 gap-6 border-t border-border pt-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Stress trend</p>
                {stressPoints.length >= 2 ? (
                  <MiniTrendChart points={stressPoints} maxValue={4} colorClassName="bg-accent" ariaLabel="Stress level trend" />
                ) : (
                  <p className="text-caption text-muted-foreground">Not enough data for a trend yet.</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Recovery trend</p>
                {recoveryPoints.length >= 2 ? (
                  <MiniTrendChart points={recoveryPoints} maxValue={4} colorClassName="bg-support" ariaLabel="Recovery level trend" />
                ) : (
                  <p className="text-caption text-muted-foreground">Not enough data for a trend yet.</p>
                )}
              </div>
            </div>
            {sleepObservation && (
              <div className="flex items-start gap-2 rounded-lg bg-support/25 p-2.5">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm text-foreground">{sleepObservation}</p>
              </div>
            )}
          </>
        )}
        <p className="text-caption text-muted-foreground">
          Educational only. Consider talking with a healthcare professional if stress or low recovery persists or
          interferes with daily life.
        </p>
      </CardContent>
    </Card>
  )
}

export default StressRecoverySummaryCard

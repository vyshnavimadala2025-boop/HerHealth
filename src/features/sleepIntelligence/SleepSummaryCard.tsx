import { BedDouble, CalendarCheck, Clock, Moon, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import EmptyState from '@/components/shared/EmptyState'
import MetricCardGrid, { type MetricCard } from '@/components/shared/MetricCardGrid'
import MiniTrendChart from '@/components/shared/MiniTrendChart'
import type { SleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import { MIN_USABLE_NIGHTS } from '@/features/sleepIntelligence/sleepCalculations'
import type { SleepEntry } from '@/features/sleepIntelligence/types'

function formatDuration(minutes: number | null): string {
  if (minutes === null) return 'Not enough data'
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return `${hours}h ${remainder}m`
}

function shortDateLabel(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

interface SleepSummaryCardProps {
  status: 'loading' | 'ready' | 'error'
  summary: SleepSummary
  chartEntries: SleepEntry[]
}

/**
 * Every metric is calculateSleepSummary()'s honest, real-data-only output
 * (sleepCalculations.ts) — reuses MetricCardGrid and MiniTrendChart, the
 * same shared components Weekly/Monthly Summary and Health Trends already
 * use, rather than a bespoke layout. Below the MIN_USABLE_NIGHTS=3
 * threshold (documented in sleepCalculations.ts, matching moodTrend.ts's
 * own threshold), this shows an honest "not enough data" state instead of
 * a fabricated score or trend.
 */
function SleepSummaryCard({ status, summary, chartEntries }: SleepSummaryCardProps) {
  const chartPoints = [...chartEntries]
    .filter((entry) => entry.durationMinutes !== null)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
    .slice(-14)
    .map((entry) => ({
      label: shortDateLabel(entry.entryDate),
      value: entry.durationMinutes !== null ? Math.round((entry.durationMinutes / 60) * 10) / 10 : null,
    }))

  const cards: MetricCard[] = [
    {
      key: 'nights-tracked',
      icon: Moon,
      label: 'Nights tracked',
      status: `${summary.nightsTracked}`,
      trend: 'Last 30 days',
      caption: 'Nights with a recorded sleep entry.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: summary.nightsTracked > 0,
    },
    {
      key: 'avg-duration',
      icon: Clock,
      label: 'Average duration',
      status: formatDuration(summary.avgDurationMinutes),
      trend: 'Last 30 days',
      caption: 'Average of your recorded sleep duration.',
      accentClassName: 'bg-blush text-blush-foreground',
      tracked: summary.avgDurationMinutes !== null,
    },
    {
      key: 'recent-duration',
      icon: BedDouble,
      label: 'Most recent night',
      status: formatDuration(summary.recentDurationMinutes),
      trend: 'Latest recorded entry',
      caption: 'Duration from your most recent sleep entry.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: summary.recentDurationMinutes !== null,
    },
    {
      key: 'consistency',
      icon: CalendarCheck,
      label: 'Tracking consistency',
      status: `${summary.consistencyPercent}%`,
      trend: 'Share of the last 30 days',
      caption: 'Share of the last 30 days with a recorded sleep entry.',
      accentClassName: 'bg-support text-support-foreground',
      tracked: summary.nightsTracked > 0,
    },
    {
      key: 'quality-trend',
      icon: TrendingUp,
      label: 'Sleep quality trend',
      status: summary.qualityTrend,
      trend: 'Based on your recorded quality ratings',
      caption: 'Your recent sleep-quality pattern — educational only.',
      accentClassName: 'bg-accent text-accent-foreground',
      tracked: summary.qualityTrend !== 'Limited data',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Sleep Patterns</CardTitle>
        <CardDescription>Based only on what you&apos;ve recorded — never a medical measurement.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {!summary.hasSufficientData ? (
          <EmptyState
            icon={Moon}
            title="Not enough sleep data yet"
            description={`Track your sleep for a few nights (at least ${MIN_USABLE_NIGHTS}) to start seeing your personal sleep patterns.`}
          />
        ) : (
          <>
            <MetricCardGrid status={status} cards={cards} columnsClassName="grid grid-cols-2 gap-4 sm:grid-cols-3" />
            {chartPoints.length >= 2 && (
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
                  Duration trend (hours)
                </p>
                <MiniTrendChart points={chartPoints} maxValue={12} colorClassName="bg-primary" ariaLabel="Sleep duration trend" />
              </div>
            )}
          </>
        )}
        <p className="text-caption text-muted-foreground">
          Educational only. Consider discussing persistent sleep concerns with a healthcare professional.
        </p>
      </CardContent>
    </Card>
  )
}

export default SleepSummaryCard

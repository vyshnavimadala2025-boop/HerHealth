import { Apple, CalendarCheck, Droplet, TrendingUp, UtensilsCrossed } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import EmptyState from '@/components/shared/EmptyState'
import MetricCardGrid, { type MetricCard } from '@/components/shared/MetricCardGrid'
import MiniTrendChart from '@/components/shared/MiniTrendChart'
import type { NutritionSummary } from '@/features/nutritionCompanion/nutritionCalculations'
import { MIN_USABLE_DAYS } from '@/features/nutritionCompanion/nutritionCalculations'
import type { NutritionEntry } from '@/features/nutritionCompanion/types'

function shortDateLabel(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

interface NutritionSummaryCardProps {
  status: 'loading' | 'ready' | 'error'
  summary: NutritionSummary
  chartEntries: NutritionEntry[]
}

/**
 * Every metric is calculateNutritionSummary()'s honest, real-data-only
 * output (nutritionCalculations.ts) — reuses MetricCardGrid and
 * MiniTrendChart, the same shared components Sleep Intelligence, Weekly/
 * Monthly Summary, and Health Trends already use. Below the
 * MIN_USABLE_DAYS=3 threshold, shows an honest "not enough data" state
 * instead of a fabricated pattern.
 */
function NutritionSummaryCard({ status, summary, chartEntries }: NutritionSummaryCardProps) {
  const chartPoints = [...chartEntries]
    .filter((entry) => entry.hydrationGlasses !== null)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
    .slice(-14)
    .map((entry) => ({ label: shortDateLabel(entry.entryDate), value: entry.hydrationGlasses }))

  const cards: MetricCard[] = [
    {
      key: 'days-tracked',
      icon: CalendarCheck,
      label: 'Days tracked',
      status: `${summary.daysTracked}`,
      trend: 'Last 30 days',
      caption: 'Days with a recorded nutrition entry.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: summary.daysTracked > 0,
    },
    {
      key: 'meals-logged',
      icon: UtensilsCrossed,
      label: 'Meals logged',
      status: `${summary.totalMealsLogged}`,
      trend: 'Last 30 days',
      caption: 'Total meal checkmarks recorded in this window.',
      accentClassName: 'bg-blush text-blush-foreground',
      tracked: summary.totalMealsLogged > 0,
    },
    {
      key: 'avg-hydration',
      icon: Droplet,
      label: 'Average hydration',
      status: summary.avgHydrationGlasses !== null ? `${summary.avgHydrationGlasses} glasses` : 'Not enough data',
      trend: 'Last 30 days',
      caption: 'Average recorded glasses of water per day.',
      accentClassName: 'bg-support text-support-foreground',
      tracked: summary.avgHydrationGlasses !== null,
    },
    {
      key: 'consistency',
      icon: Apple,
      label: 'Tracking consistency',
      status: `${summary.consistencyPercent}%`,
      trend: 'Share of the last 30 days',
      caption: 'Share of the last 30 days with a recorded nutrition entry.',
      accentClassName: 'bg-accent text-accent-foreground',
      tracked: summary.daysTracked > 0,
    },
    {
      key: 'hydration-trend',
      icon: TrendingUp,
      label: 'Hydration trend',
      status: summary.hydrationTrend,
      trend: 'Based on your recorded hydration',
      caption: 'Your recent hydration pattern — educational only.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: summary.hydrationTrend !== 'Limited data',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Nutrition Patterns</CardTitle>
        <CardDescription>Based only on what you&apos;ve recorded — never a medical or nutrient calculation.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {!summary.hasSufficientData ? (
          <EmptyState
            icon={Apple}
            title="Not enough data yet"
            description={`Keep tracking your nutrition habits (at least ${MIN_USABLE_DAYS} days) to see your personal patterns over time.`}
          />
        ) : (
          <>
            <MetricCardGrid status={status} cards={cards} columnsClassName="grid grid-cols-2 gap-4 sm:grid-cols-3" />
            {chartPoints.length >= 2 && (
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
                  Hydration trend (glasses)
                </p>
                <MiniTrendChart
                  points={chartPoints}
                  maxValue={Math.max(8, ...chartPoints.map((point) => point.value ?? 0))}
                  colorClassName="bg-support"
                  ariaLabel="Hydration trend"
                />
              </div>
            )}
          </>
        )}
        <p className="text-caption text-muted-foreground">
          Educational only — a habit-awareness tool, not a clinical nutrition assessment. Consider discussing
          individual dietary needs with a qualified healthcare professional or dietitian.
        </p>
      </CardContent>
    </Card>
  )
}

export default NutritionSummaryCard

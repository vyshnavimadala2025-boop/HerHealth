import { ArrowDown, ArrowUp, Minus, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import ProgressRing from '@/components/shared/ProgressRing'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import type { PeriodComparisonMetric, WellnessScoreResult } from '@/features/insights/monthlyStats'

interface MonthlyWellnessScoreCardProps {
  status: 'loading' | 'ready' | 'error'
  scoreResult: WellnessScoreResult
  comparisonStatus: 'loading' | 'ready' | 'error'
  comparisonMetrics: PeriodComparisonMetric[] | null
  hasComparisonHistory: boolean
}

function formatMetricValue(value: number | null, unit: PeriodComparisonMetric['unit']): string {
  if (value === null) return 'No data'
  if (unit === 'percent') return `${value}%`
  if (unit === 'score') return `${value}/5`
  return `${value}`
}

function DeltaIndicator({ direction }: { direction: PeriodComparisonMetric['direction'] }) {
  if (direction === 'up') {
    return (
      <span className="flex items-center gap-0.5 text-support-foreground">
        <ArrowUp className="size-3.5" aria-hidden="true" />
        Up from last month
      </span>
    )
  }
  if (direction === 'down') {
    return (
      <span className="flex items-center gap-0.5 text-muted-foreground">
        <ArrowDown className="size-3.5" aria-hidden="true" />
        Down from last month
      </span>
    )
  }
  if (direction === 'flat') {
    return (
      <span className="flex items-center gap-0.5 text-muted-foreground">
        <Minus className="size-3.5" aria-hidden="true" />
        Same as last month
      </span>
    )
  }
  return <span className="text-muted-foreground">Not enough data last month</span>
}

/**
 * "Monthly Wellness Overview" — the score itself is calculateWellnessScore()'s
 * honest, tracked-signals-only composite (see monthlyStats.ts); this
 * component only renders it plus the this-month-vs-last-month comparison,
 * which is deliberately hidden (in favor of an educational empty state)
 * whenever usePreviousPeriodSummary() reports no recorded activity in the
 * prior 30 days — never a fabricated "0% change".
 */
function MonthlyWellnessScoreCard({
  status,
  scoreResult,
  comparisonStatus,
  comparisonMetrics,
  hasComparisonHistory,
}: MonthlyWellnessScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Monthly Wellness Overview</CardTitle>
        </div>
        <CardDescription>
          A rule-based composite of your own recorded consistency and patterns this month — educational only, not a
          medical score.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {status === 'loading' && (
          <div role="status" className="flex justify-center">
            <Skeleton className="size-40 rounded-full" />
          </div>
        )}

        {status === 'error' && (
          <p className="text-sm text-muted-foreground">We couldn&apos;t load your wellness overview right now.</p>
        )}

        {status === 'ready' && (
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-around">
            <div className="relative flex size-40 shrink-0 items-center justify-center">
              {scoreResult.score !== null ? (
                <ProgressRing
                  value={scoreResult.score}
                  label={`Monthly wellness score: ${scoreResult.score} out of 100`}
                  size={160}
                  strokeWidth={12}
                  colorClassName="text-primary"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-display text-3xl text-foreground">{scoreResult.score}</span>
                    <span className="text-caption text-muted-foreground">out of 100</span>
                  </div>
                </ProgressRing>
              ) : (
                <div className="flex size-40 flex-col items-center justify-center rounded-full border border-dashed border-border text-center">
                  <span className="text-caption text-muted-foreground">Not enough data yet</span>
                </div>
              )}
            </div>

            <div className="flex w-full max-w-sm flex-col gap-2">
              <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Supporting factors</p>
              <ul className="flex flex-col gap-2">
                {scoreResult.factors.map((factor) => (
                  <li key={factor.key} className="flex items-center justify-between gap-2 text-caption">
                    <span className="text-foreground">
                      {factor.label} <span className="text-muted-foreground">({factor.weightPercent}%)</span>
                    </span>
                    {factor.tracked ? (
                      <span className="text-muted-foreground">{factor.valueLabel}</span>
                    ) : (
                      <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-muted-foreground">
                        {factor.valueLabel}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-medium text-foreground">Compared with last month</p>

          {comparisonStatus === 'loading' && (
            <div role="status" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          )}

          {comparisonStatus === 'ready' && !hasComparisonHistory && (
            <EmptyState
              icon={Sparkles}
              title="Not enough history yet"
              description="Once you have a recorded month behind this one, HerHealth will compare the two here."
            />
          )}

          {comparisonStatus === 'ready' && hasComparisonHistory && comparisonMetrics && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {comparisonMetrics.map((metric) => (
                <div key={metric.key} className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3">
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">{metric.label}</p>
                  <p className="text-sm font-medium text-foreground">{formatMetricValue(metric.currentValue, metric.unit)}</p>
                  <p className="text-caption">
                    <DeltaIndicator direction={metric.direction} />
                  </p>
                </div>
              ))}
            </div>
          )}

          {comparisonStatus === 'error' && (
            <p className="text-sm text-muted-foreground">We couldn&apos;t load last month&apos;s comparison right now.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default MonthlyWellnessScoreCard

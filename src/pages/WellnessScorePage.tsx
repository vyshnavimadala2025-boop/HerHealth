import { useState } from 'react'
import { Target } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import ProgressRing from '@/components/shared/ProgressRing'
import MiniTrendChart from '@/components/shared/MiniTrendChart'
import { useHealthTrendsData } from '@/features/insights/useHealthTrendsData'
import TrendRangeSelector from '@/features/insights/TrendRangeSelector'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import type { HealthTrendRangeKey } from '@/features/insights/healthTrendsCalculations'

/**
 * Wellness Score (Stage 2) — a standalone product page, not a new
 * calculation. It reuses useHealthTrendsData() (Stage 6B.4) exactly as-is:
 * that hook already runs Monthly Summary's calculateWellnessScore() once
 * per time bucket via computeHealthTrendBuckets(). The "current score" here
 * is simply the most recent bucket with recorded data; the trend chart is
 * the same per-bucket wellnessScore series Health Trends already renders
 * via MiniTrendChart. No new Supabase query, no new scoring logic — this
 * page only composes what already exists into its own dedicated
 * destination with the same 5 time ranges as Health Trends.
 */
function WellnessScorePage() {
  const [rangeKey, setRangeKey] = useState<HealthTrendRangeKey>('30d')
  const trends = useHealthTrendsData(rangeKey)

  const scoredBuckets = trends.buckets.filter((bucket) => bucket.wellnessScore !== null)
  const currentBucket = scoredBuckets[scoredBuckets.length - 1] ?? trends.buckets[trends.buckets.length - 1]
  const trendPoints = trends.buckets.map((bucket) => ({ label: bucket.label, value: bucket.wellnessScore }))

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <Target className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Wellness Score"
          description="A SIRILA wellness metric, not a medical score."
          captions={[
            'A rule-based composite of your own recorded consistency, mood, energy, and engagement — educational only. It never diagnoses a condition or predicts a health outcome.',
          ]}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Time range</p>
        <TrendRangeSelector value={rangeKey} onChange={setRangeKey} />
      </div>

      {trends.status === 'loading' && (
        <div role="status" className="flex flex-col gap-6">
          <Skeleton className="mx-auto size-40 rounded-full" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      )}

      {trends.status === 'error' && (
        <EmptyState
          icon={Target}
          title="We couldn't load your wellness score"
          description="Please try again."
          action={
            <Button type="button" variant="outline" size="sm" onClick={trends.retry}>
              Try again
            </Button>
          }
        />
      )}

      {trends.status === 'ready' && currentBucket && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Current score</CardTitle>
              <CardDescription>
                Latest recorded period: {currentBucket.label} ({formatFriendlyDate(currentBucket.startDate)} –{' '}
                {formatFriendlyDate(currentBucket.endDate)})
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-around">
              <div className="relative flex size-40 shrink-0 items-center justify-center">
                {currentBucket.wellnessScore !== null ? (
                  <ProgressRing
                    value={currentBucket.wellnessScore}
                    label={`Wellness score: ${currentBucket.wellnessScore} out of 100`}
                    size={160}
                    strokeWidth={12}
                    colorClassName="text-primary"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-display text-3xl text-foreground">{currentBucket.wellnessScore}</span>
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
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">What contributes</p>
                <ul className="flex flex-col gap-2">
                  {currentBucket.wellnessFactors.map((factor) => (
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
                {trends.goalsDataUnavailable && (
                  <p className="text-caption text-muted-foreground">
                    We couldn&apos;t load your goal data just now, so journal &amp; goal engagement reflects journal
                    activity only. Everything else above is unaffected.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score trend</CardTitle>
              <CardDescription>How your wellness score has moved across this range.</CardDescription>
            </CardHeader>
            <CardContent>
              {scoredBuckets.length < 2 ? (
                <EmptyState
                  icon={Target}
                  title="Not enough data for a trend yet"
                  description="Keep recording check-ins across this range and a score trend will appear here."
                />
              ) : (
                <MiniTrendChart points={trendPoints} maxValue={100} colorClassName="bg-primary" ariaLabel="Wellness score trend" />
              )}
            </CardContent>
          </Card>

          <p className="text-center text-caption text-muted-foreground">
            This score reflects only what you've recorded in SIRILA. It is a wellness/product metric, not a
            medical score, diagnosis, or prediction — consider discussing any health concerns with a healthcare
            professional.
          </p>
        </>
      )}
    </main>
  )
}

export default WellnessScorePage

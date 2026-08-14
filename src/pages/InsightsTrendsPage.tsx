import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarHeart,
  Compass,
  Moon,
  NotebookPen,
  Sparkles,
  Target,
  TrendingUp,
  Wind,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import MoodEnergyBarChart from '@/components/shared/MoodEnergyBarChart'
import MiniTrendChart from '@/components/shared/MiniTrendChart'
import InsightsSubNav from '@/features/insights/InsightsSubNav'
import TrendRangeSelector from '@/features/insights/TrendRangeSelector'
import DashboardCycleCard from '@/features/periods/DashboardCycleCard'
import { useHealthTrendsData } from '@/features/insights/useHealthTrendsData'
import type { HealthTrendRangeKey, PatternTone } from '@/features/insights/healthTrendsCalculations'
import { formatFriendlyDate, getLocalDateString } from '@/features/periods/dateUtils'

function toneBadgeClassName(tone: PatternTone) {
  if (tone === 'positive') return 'bg-support text-support-foreground'
  if (tone === 'neutral') return 'bg-lavender text-lavender-foreground'
  if (tone === 'attention') return 'bg-attention text-attention-foreground'
  return 'bg-muted text-muted-foreground'
}

/**
 * Insights → Health Trends (Stage 6B.4). Every series is computed by
 * useHealthTrendsData(), which itself only re-runs the existing
 * reportCalculations.ts functions and Monthly Summary's
 * calculateWellnessScore() per time bucket — no new business logic, no
 * fabricated data. Mood/Energy reuse MoodEnergyBarChart; every other
 * series reuses the generic MiniTrendChart primitive already built for
 * this exact purpose. Cycle reuses DashboardCycleCard unchanged. Sleep and
 * Environment have no tracked field anywhere in SIRILA yet, so they're
 * shown honestly as not yet available, matching the rest of the app.
 */
function InsightsTrendsPage() {
  const [rangeKey, setRangeKey] = useState<HealthTrendRangeKey>('30d')
  const trends = useHealthTrendsData(rangeKey)

  const today = getLocalDateString()
  const rangeStart = trends.buckets[0]?.startDate ?? today

  const totalCheckIns = trends.buckets.reduce((sum, bucket) => sum + bucket.checkInCount, 0)
  const totalJournalEntries = trends.buckets.reduce((sum, bucket) => sum + bucket.journalCount, 0)
  const totalGoalsCompleted = trends.buckets.reduce((sum, bucket) => sum + bucket.goalsCompletedInRange, 0)
  const totalProgressEntries = trends.buckets.reduce((sum, bucket) => sum + bucket.progressEntriesInRange, 0)
  const scoredBucketCount = trends.buckets.filter((bucket) => bucket.wellnessScore !== null).length

  const moodEnergyPoints = trends.buckets.map((bucket) => ({
    label: bucket.label,
    moodAverage: bucket.avgMood,
    energyAverage: bucket.avgEnergy,
    entryCount: bucket.checkInCount,
  }))

  const consistencyPoints = trends.buckets.map((bucket) => ({ label: bucket.label, value: bucket.consistencyPercent }))
  const journalPoints = trends.buckets.map((bucket) => ({
    label: bucket.label,
    value: bucket.journalCount,
  }))
  const goalPoints = trends.buckets.map((bucket) => ({ label: bucket.label, value: bucket.progressEntriesInRange }))
  const wellnessScorePoints = trends.buckets.map((bucket) => ({ label: bucket.label, value: bucket.wellnessScore }))

  const maxJournalValue = Math.max(1, ...trends.buckets.map((bucket) => bucket.journalCount))
  const maxGoalValue = Math.max(1, ...trends.buckets.map((bucket) => bucket.progressEntriesInRange))

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <TrendingUp className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Health Trends"
          description={`${formatFriendlyDate(rangeStart)} – ${formatFriendlyDate(today)}`}
          captions={[
            'These trends reflect only what you’ve recorded in SIRILA over time — never a medical diagnosis, prediction, or claim.',
          ]}
        />
      </div>

      <InsightsSubNav />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Time range</p>
        <TrendRangeSelector value={rangeKey} onChange={setRangeKey} />
      </div>

      {trends.status === 'loading' && (
        <div role="status" className="flex flex-col gap-8">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-7 w-28 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      )}

      {trends.status === 'error' && (
        <EmptyState
          icon={TrendingUp}
          title="We couldn't load your health trends"
          description="Please try again."
          action={
            <Button type="button" variant="outline" size="sm" onClick={trends.retry}>
              Try again
            </Button>
          }
        />
      )}

      {trends.status === 'ready' && (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="font-display text-lg text-foreground">Pattern indicators</h2>
            <p className="text-caption text-muted-foreground">
              Your tracked data shows the direction of each area below over the selected range — you may notice a
              pattern worth a closer look, not a diagnosis.
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Pattern indicators">
              {trends.patternIndicators.map((indicator) => (
                <span
                  key={indicator.key}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-caption"
                >
                  <span className="font-medium text-foreground">{indicator.label}</span>
                  <Badge className={toneBadgeClassName(indicator.tone)}>{indicator.value}</Badge>
                </span>
              ))}
            </div>
          </section>

          {totalCheckIns === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Not enough recorded data yet"
              description="Once you've completed a few check-ins over this range, your health trends will appear here."
              action={
                <Link to="/dashboard#checkin" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Complete today's Daily Check-In
                </Link>
              }
            />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" aria-hidden="true" />
                    <CardTitle>Trend Highlights</CardTitle>
                  </div>
                  <CardDescription>Deterministic, rule-based observations from your own recorded numbers — not an AI conclusion.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2 text-sm">
                    {trends.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <span className="text-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wellness Score Trend</CardTitle>
                  <CardDescription>
                    A rule-based composite of your recorded consistency, mood, energy, and engagement each period —
                    educational only, not a medical score.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scoredBucketCount < 2 ? (
                    <EmptyState
                      icon={TrendingUp}
                      title="Not enough data for a score trend yet"
                      description="Keep recording check-ins across this range and a wellness score trend will appear here."
                    />
                  ) : (
                    <MiniTrendChart points={wellnessScorePoints} maxValue={100} colorClassName="bg-primary" ariaLabel="Wellness score trend" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mood &amp; Energy Trends</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-4 text-caption text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-blush" aria-hidden="true" />
                      Mood
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-lavender" aria-hidden="true" />
                      Energy
                    </span>
                  </div>
                  <MoodEnergyBarChart points={moodEnergyPoints} ariaLabel="Mood and energy over the selected range" />
                  <p className="text-caption text-muted-foreground">
                    Based only on your recorded check-ins — not a medical measurement.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Check-in Consistency Trend</CardTitle>
                  <CardDescription>Share of days with a recorded check-in, per period.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MiniTrendChart points={consistencyPoints} maxValue={100} colorClassName="bg-primary" ariaLabel="Check-in consistency trend" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-primary" aria-hidden="true" />
                    <CardTitle>Goal Progress Trend</CardTitle>
                  </div>
                  <CardDescription>
                    {totalProgressEntries} progress entr{totalProgressEntries === 1 ? 'y' : 'ies'} logged, {totalGoalsCompleted} goal
                    {totalGoalsCompleted === 1 ? '' : 's'} completed in this range.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trends.goalsDataUnavailable ? (
                    <EmptyState
                      icon={Target}
                      title="We couldn't load your goal data right now"
                      description="This is a temporary loading issue, not something about your recorded goals. Please try again shortly."
                    />
                  ) : totalProgressEntries === 0 && totalGoalsCompleted === 0 ? (
                    <EmptyState
                      icon={Target}
                      title="No goal activity in this range yet"
                      description="Log progress on a wellness goal and its trend will appear here."
                      action={
                        <Link to="/goals" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                          Open Goals
                        </Link>
                      }
                    />
                  ) : (
                    <MiniTrendChart points={goalPoints} maxValue={maxGoalValue} colorClassName="bg-support" ariaLabel="Goal progress trend" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <NotebookPen className="size-4 text-primary" aria-hidden="true" />
                    <CardTitle>Journal Consistency Trend</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {totalJournalEntries === 0 ? (
                    <EmptyState
                      icon={NotebookPen}
                      title="No journal entries in this range yet"
                      description="Write a journal reflection and its trend will appear here."
                      action={
                        <Link to="/journal" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                          Open Journal
                        </Link>
                      }
                    />
                  ) : (
                    <MiniTrendChart points={journalPoints} maxValue={maxJournalValue} colorClassName="bg-blush" ariaLabel="Journal consistency trend" />
                  )}
                </CardContent>
              </Card>
            </>
          )}

          <div id="cycle" className="scroll-mt-24">
            <DashboardCycleCard
              status={trends.status}
              records={trends.periodRecords}
              cycleLength={trends.cycleLength}
              estimatedNextPeriod={trends.estimatedNextPeriod}
            />
          </div>

          <div id="sleep" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Moon className="size-4" aria-hidden="true" />
                  </div>
                  <CardTitle>Sleep</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Moon}
                  title="Not shown here yet"
                  description="Sleep Intelligence is now available as its own page. Sleep trends aren't integrated into Health Trends yet, but you can track and review them there."
                  action={
                    <Link to="/sleep-intelligence" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                      Open Sleep Intelligence
                    </Link>
                  }
                />
              </CardContent>
            </Card>
          </div>

          <div id="lifestyle" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
                    <Compass className="size-4" aria-hidden="true" />
                  </div>
                  <CardTitle>Lifestyle</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  The real, tracked lifestyle signal SIRILA has today is check-in consistency, already shown above.
                  Lifestyle Intelligence has its own dedicated Lifestyle Score and weekly progress view.
                </p>
                <Link to="/lifestyle-intelligence" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Open Lifestyle Intelligence
                </Link>
              </CardContent>
            </Card>
          </div>

          <div id="environment" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-support text-support-foreground">
                    <Wind className="size-4" aria-hidden="true" />
                  </div>
                  <CardTitle>Environment</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Environmental Wellness doesn&apos;t have tracked data yet, so there&apos;s no environmental trend to show honestly.
                </p>
                <Link to="/environmental-wellness" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Open Environmental Wellness
                </Link>
              </CardContent>
            </Card>
          </div>

          <p className="flex items-center gap-2 text-center text-caption text-muted-foreground">
            <CalendarHeart className="size-3.5 shrink-0" aria-hidden="true" />
            Every trend above reflects only the information you&apos;ve chosen to record in SIRILA. It is educational
            only and never a medical diagnosis, prediction, or substitute for professional care.
          </p>
        </>
      )}
    </main>
  )
}

export default InsightsTrendsPage

import { useEffect } from 'react'
import {
  CalendarCheck,
  CalendarRange,
  ClipboardCheck,
  Flame,
  HeartPulse,
  NotebookPen,
  Smile,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/shared/PageHeader'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MetricCardGrid, { type MetricCard } from '@/components/shared/MetricCardGrid'
import MoodEnergyBarChart from '@/components/shared/MoodEnergyBarChart'
import MiniTrendChart, { type MiniTrendPoint } from '@/components/shared/MiniTrendChart'
import InsightsSubNav from '@/features/insights/InsightsSubNav'
import MonthlyWellnessScoreCard from '@/features/insights/MonthlyWellnessScoreCard'
import PersonalTimeline from '@/features/reports/PersonalTimeline'
import { useReportData } from '@/features/reports/useReportData'
import { useInsightsData } from '@/features/insights/useInsightsData'
import { useMoodEnergySeries } from '@/features/insights/useMoodEnergySeries'
import { usePreviousPeriodSummary } from '@/features/insights/usePreviousPeriodSummary'
import { MOOD_SCORES } from '@/features/insights/moodTrend'
import { ENERGY_SCORES } from '@/features/insights/energyTrend'
import {
  weightedAverageScore,
  calculateMonthlyStreak,
  buildMonthlyAchievements,
  calculateWellnessScore,
  buildWeeklyActivityBuckets,
  buildPeriodComparison,
} from '@/features/insights/monthlyStats'
import { buildMonthlyReflection } from '@/features/insights/monthlyReflection'
import { formatFriendlyDate, addDays, getLocalDateString } from '@/features/periods/dateUtils'

/**
 * Insights → Monthly Summary (Stage 6B.3). Follows the same depth and
 * reuse pattern as Weekly Summary (Stage 6B.2): useReportData() pinned to
 * a 30-day window (as this page always was), useInsightsData() for
 * mood/energy trend direction, and useMoodEnergySeries('month') for the
 * chart — all existing hooks, reused exactly as-is. The only new logic is
 * in monthlyStats.ts/monthlyReflection.ts/usePreviousPeriodSummary.ts,
 * each of which composes real, already-computed signals rather than
 * duplicating a calculation that exists elsewhere. Goals/journal/streak
 * degrade honestly if useReportData() fails, same pattern as
 * InsightsWeeklyPage and aiInsightCategories.ts.
 */
function InsightsOverviewPage() {
  const monthly = useReportData()
  const { setPresetRange } = monthly

  useEffect(() => {
    setPresetRange('30d')
  }, [setPresetRange])

  const insightsData = useInsightsData()
  const series = useMoodEnergySeries('month')
  const previous = usePreviousPeriodSummary(monthly.range.startDate, 30)

  const status = monthly.status === 'error' ? 'error' : monthly.status === 'loading' || series.status === 'loading' ? 'loading' : 'ready'

  const today = getLocalDateString()
  const monthStart = monthly.range.startDate || addDays(today, -29)

  const checkInCount = monthly.summary?.checkIns.count ?? 0
  const consistencyPercent = monthly.summary?.checkIns.consistencyPercent ?? 0
  const journalCountInRange = monthly.timeline.filter((entry) => entry.type === 'journal').length
  const cycleEventsInRange = insightsData.periodRecords.filter((record) => record.startDate >= monthStart).length
  const goalsCompletedInRange = monthly.summary?.goals.goalsCompletedInRange ?? 0
  const progressEntriesInRange = monthly.summary?.goals.progressEntriesInRange ?? 0

  const avgMood = monthly.summary ? weightedAverageScore(monthly.summary.moodEnergyWellbeing.mood, MOOD_SCORES) : null
  const avgEnergy = monthly.summary
    ? weightedAverageScore(monthly.summary.moodEnergyWellbeing.energyLevel, ENERGY_SCORES)
    : null

  const streak = calculateMonthlyStreak(monthly.timeline, today)

  const wellnessScore = calculateWellnessScore({
    consistencyPercent,
    checkInCount,
    avgMood,
    avgEnergy,
    journalCountInRange,
    goalsCompletedInRange,
    progressEntriesInRange,
  })

  const achievements =
    status === 'ready'
      ? buildMonthlyAchievements({ streak, consistencyPercent, checkInCount, journalCountInRange, goalsCompletedInRange })
      : []

  const reflection =
    status === 'ready'
      ? buildMonthlyReflection({
          consistencyPercent,
          checkInCount,
          moodTrend: insightsData.moodTrend,
          energyTrend: insightsData.energyTrend,
          journalCountInRange,
          goalsCompletedInRange,
          streak,
        })
      : null

  const weeklyBuckets = buildWeeklyActivityBuckets(monthly.timeline, today)
  const checkInBucketPoints: MiniTrendPoint[] = weeklyBuckets.map((bucket) => ({ label: bucket.label, value: bucket.checkInCount }))
  const goalBucketPoints: MiniTrendPoint[] = weeklyBuckets.map((bucket) => ({ label: bucket.label, value: bucket.goalActivityCount }))
  const maxGoalBucketValue = Math.max(1, ...weeklyBuckets.map((bucket) => bucket.goalActivityCount))

  const comparisonMetrics = previous.snapshot
    ? buildPeriodComparison(
        { consistencyPercent, avgMood, avgEnergy, journalCount: journalCountInRange, goalsCompletedInRange },
        previous.snapshot,
      )
    : null

  const personalizedMessage =
    checkInCount === 0
      ? 'Complete a check-in to start building your monthly summary.'
      : streak >= 7
        ? `You're on a ${streak}-day check-in streak — a strong month of consistency.`
        : consistencyPercent >= 50
          ? 'A steady month of recorded check-ins — here’s your look back.'
          : 'A gentle look back at the last 30 days, based only on what you recorded.'

  const kpiCards: MetricCard[] = [
    {
      key: 'consistency',
      icon: ClipboardCheck,
      label: 'Wellness consistency',
      status: `${consistencyPercent}%`,
      trend: `${checkInCount} of 30 days`,
      caption: 'Share of the last 30 days with a recorded check-in.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: checkInCount > 0,
    },
    {
      key: 'checkins',
      icon: CalendarCheck,
      label: 'Check-ins this month',
      status: `${checkInCount}`,
      trend: checkInCount > 0 ? 'Recorded in the last 30 days' : 'None yet',
      caption: 'Total daily check-ins recorded this month.',
      accentClassName: 'bg-blush text-blush-foreground',
      tracked: checkInCount > 0,
    },
    {
      key: 'avg-mood',
      icon: Smile,
      label: 'Average mood',
      status: avgMood !== null ? `${avgMood}/5` : 'Not enough data',
      trend: `Trend: ${insightsData.moodTrend}`,
      caption: 'Average of your recorded mood check-ins this month.',
      accentClassName: 'bg-blush text-blush-foreground',
      tracked: avgMood !== null,
    },
    {
      key: 'avg-energy',
      icon: Zap,
      label: 'Average energy',
      status: avgEnergy !== null ? `${avgEnergy}/5` : 'Not enough data',
      trend: `Trend: ${insightsData.energyTrend}`,
      caption: 'Average of your recorded energy check-ins this month.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: avgEnergy !== null,
    },
    {
      key: 'journal',
      icon: NotebookPen,
      label: 'Journal activity',
      status: `${journalCountInRange}`,
      trend: journalCountInRange > 0 ? 'Recorded this month' : 'None yet',
      caption: 'Journal entries written in the last 30 days.',
      accentClassName: 'bg-blush text-blush-foreground',
      tracked: journalCountInRange > 0,
    },
    {
      key: 'goals',
      icon: Target,
      label: 'Goals completed',
      status: `${goalsCompletedInRange}`,
      trend: 'This month',
      caption: 'Wellness goals marked complete this month.',
      accentClassName: 'bg-accent text-accent-foreground',
      tracked: goalsCompletedInRange > 0,
    },
    {
      key: 'streak',
      icon: Flame,
      label: 'Wellness streak',
      status: `${streak} day${streak === 1 ? '' : 's'}`,
      trend: 'Consecutive, ending today',
      caption: 'Your current run of consecutive check-in days.',
      accentClassName: 'bg-support text-support-foreground',
      tracked: streak > 0,
    },
    {
      key: 'cycle',
      icon: HeartPulse,
      label: 'Cycle events',
      status: `${cycleEventsInRange}`,
      trend: cycleEventsInRange > 0 ? 'Logged this month' : 'None this month',
      caption: 'Period records logged in the last 30 days.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: cycleEventsInRange > 0,
    },
  ]

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <CalendarRange className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Monthly Wellness Summary"
          description={`${formatFriendlyDate(monthStart)} – ${formatFriendlyDate(today)}`}
          captions={[
            personalizedMessage,
            `As of ${new Date().toLocaleString(undefined, { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`,
          ]}
        />
      </div>

      <InsightsSubNav />

      {status === 'loading' && (
        <div role="status" className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      )}

      {status === 'error' && (
        <EmptyState
          icon={CalendarRange}
          title="We couldn't load your monthly summary"
          description="Please try again."
          action={
            <Button type="button" variant="outline" size="sm" onClick={monthly.retry}>
              Try again
            </Button>
          }
        />
      )}

      {status === 'ready' && (
        <>
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-lg text-foreground">This month at a glance</h2>
            <MetricCardGrid status="ready" cards={kpiCards} />
          </section>

          <MonthlyWellnessScoreCard
            status={status}
            scoreResult={wellnessScore}
            comparisonStatus={previous.status}
            comparisonMetrics={comparisonMetrics}
            hasComparisonHistory={Boolean(previous.snapshot?.hasActivity)}
          />

          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 text-sm">
              {series.points.every((point) => point.entryCount === 0) ? (
                <EmptyState
                  icon={Smile}
                  title="No check-ins recorded this month yet"
                  description="Complete today's daily check-in to start your monthly mood and energy chart."
                  action={
                    <Link to="/dashboard#checkin" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                      Complete today's Daily Check-In
                    </Link>
                  }
                />
              ) : (
                <div className="flex flex-col gap-3">
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
                  <MoodEnergyBarChart points={series.points} ariaLabel="Mood and energy by week this month" />
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 border-t border-border pt-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Check-in consistency</p>
                  <MiniTrendChart points={checkInBucketPoints} maxValue={7} colorClassName="bg-primary" ariaLabel="Check-ins per week this month" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Goal activity</p>
                  <MiniTrendChart
                    points={goalBucketPoints}
                    maxValue={maxGoalBucketValue}
                    colorClassName="bg-support"
                    ariaLabel="Goal activity per week this month"
                  />
                </div>
              </div>
              <p className="text-caption text-muted-foreground">
                Educational only — based solely on what you recorded this month, not a medical measurement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="Your first highlight is just around the corner"
                  description="Keep checking in, journaling, or making progress on a goal, and it'll appear here."
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {achievements.map((achievement) => (
                    <Badge key={achievement.key} className="bg-support text-support-foreground">
                      {achievement.label}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {reflection && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" aria-hidden="true" />
                  <CardTitle>AI Monthly Reflection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">What went well</p>
                  <p className="text-foreground">{reflection.whatWentWell}</p>
                </div>
                <div>
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Patterns worth noticing</p>
                  <p className="text-foreground">{reflection.patternsWorthNoticing}</p>
                </div>
                <div>
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Areas to pay attention to</p>
                  <p className="text-muted-foreground">{reflection.areasToObserve}</p>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-support/25 p-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <p className="text-foreground">
                    <span className="font-medium">Suggested next focus: </span>
                    {reflection.suggestedNextFocus}
                  </p>
                </div>
                <div className="border-t border-border pt-2.5">
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Supportive guidance</p>
                  <p className="text-foreground">{reflection.supportiveGuidance}</p>
                </div>
                <p className="text-caption text-muted-foreground">
                  Educational only — never a diagnosis, prediction, or medical advice.
                </p>
              </CardContent>
            </Card>
          )}

          <PersonalTimeline status={monthly.status} entries={monthly.timeline} onRetry={monthly.retry} />
        </>
      )}
    </main>
  )
}

export default InsightsOverviewPage

import { NotebookPen, ClipboardCheck, Smile, Zap, Target, Moon, HeartPulse, Flame, Compass, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/shared/PageHeader'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MetricCardGrid, { type MetricCard } from '@/components/shared/MetricCardGrid'
import MoodEnergyBarChart from '@/components/shared/MoodEnergyBarChart'
import InsightsSubNav from '@/features/insights/InsightsSubNav'
import WeeklyCheckInSummaryCard from '@/features/insights/WeeklyCheckInSummaryCard'
import PersonalTimeline from '@/features/reports/PersonalTimeline'
import { useInsightsData } from '@/features/insights/useInsightsData'
import { useReportData } from '@/features/reports/useReportData'
import { useMoodEnergySeries } from '@/features/insights/useMoodEnergySeries'
import { averageSeriesValue, highLowDays, calculateWeeklyStreak, buildWeeklyAchievements } from '@/features/insights/weeklyStats'
import { buildWeeklyReflection } from '@/features/insights/weeklyReflection'
import { formatFriendlyDate, addDays, getLocalDateString } from '@/features/periods/dateUtils'
import { useSleepData } from '@/features/sleepIntelligence/useSleepData'
import { calculateSleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import { useStressRecoveryData } from '@/features/stressRecovery/useStressRecoveryData'
import { calculateStressRecoverySummary } from '@/features/stressRecovery/stressRecoveryCalculations'
import { describeTrackedFactor } from '@/features/lifestyleIntelligence/trackedFactorText'

function capitalize(value: string): string {
  return value.length > 0 ? value[0].toUpperCase() + value.slice(1).replace('_', ' ') : value
}

/**
 * Insights → Weekly Summary. Reuses useInsightsData() (mood/energy trend,
 * weekly summary — the same engine behind Dashboard), useReportData()
 * (goals summary + timeline, already pinned to a 7-day default range),
 * WeeklyCheckInSummaryCard and PersonalTimeline (both already built and
 * used elsewhere), and useMoodEnergySeries('week') (built for this stage
 * in 6B.1, reusing buildLifestyleTimeline — no new bucketing logic). Goals
 * degrade honestly if useReportData() fails (see aiInsightCategories.ts's
 * same pattern from Stage 6B.1) rather than blanking the whole page. Sleep
 * and Recovery (Stage 5A) reuse useSleepData()/calculateSleepSummary() and
 * useStressRecoveryData()/calculateStressRecoverySummary() — the exact
 * same hooks/functions Lifestyle Intelligence already composes (Stage
 * 4C2) — via the shared describeTrackedFactor() text helper, so a Sleep
 * or Stress & Recovery outage only degrades those two cards, never the
 * rest of this page.
 */
function InsightsWeeklyPage() {
  const insightsData = useInsightsData()
  const reportData = useReportData()
  const series = useMoodEnergySeries('week')
  const sleepData = useSleepData()
  const stressRecoveryData = useStressRecoveryData()

  const status = insightsData.status === 'loading' || series.status === 'loading' ? 'loading' : 'ready'
  const reportDataUnavailable = reportData.status === 'error' || reportData.goalsDataUnavailable

  const today = getLocalDateString()
  const weekStart = addDays(today, -6)

  const sleepSummary = calculateSleepSummary(sleepData.entries, today)
  const stressRecoverySummary = calculateStressRecoverySummary(stressRecoveryData.entries, today)

  const sleepDisplay = describeTrackedFactor(
    sleepData.status,
    sleepSummary.hasSufficientData,
    sleepSummary.qualityTrend,
    'From Sleep Intelligence',
  )
  const recoveryReady =
    stressRecoveryData.status === 'ready' &&
    stressRecoverySummary.hasSufficientData &&
    stressRecoverySummary.recentRecoveryLevel !== null
  const recoveryDisplay = describeTrackedFactor(
    stressRecoveryData.status,
    stressRecoverySummary.hasSufficientData && stressRecoverySummary.recentRecoveryLevel !== null,
    `Recent recovery: ${capitalize(stressRecoverySummary.recentRecoveryLevel ?? '')}, trending ${stressRecoverySummary.recoveryTrend.toLowerCase()}.`,
    '',
  )

  const journalCountInRange = reportData.timeline.filter((entry) => entry.type === 'journal').length
  const cycleEventsInRange = insightsData.periodRecords.filter((record) => record.startDate >= weekStart).length
  const streak = calculateWeeklyStreak(series.points)
  const avgEnergy = averageSeriesValue(series.points, 'energyAverage')
  const avgMood = averageSeriesValue(series.points, 'moodAverage')
  const energyHighLow = highLowDays(series.points, 'energyAverage')
  const moodHighLow = highLowDays(series.points, 'moodAverage')

  const kpiCards: MetricCard[] = [
    {
      key: 'checkins',
      icon: ClipboardCheck,
      label: 'Check-ins completed',
      status: `${insightsData.weeklySummary.count}/7`,
      trend: `${insightsData.weeklySummary.consistencyPercent}% consistency`,
      caption: 'Days you completed a check-in this week.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: insightsData.weeklySummary.count > 0,
    },
    {
      key: 'mood-consistency',
      icon: Smile,
      label: 'Mood consistency',
      status: `${insightsData.weeklySummary.consistencyPercent}%`,
      trend: `Trend: ${insightsData.moodTrend}`,
      caption: 'Share of the last 7 days with a recorded mood.',
      accentClassName: 'bg-blush text-blush-foreground',
      tracked: insightsData.weeklySummary.count > 0,
    },
    {
      key: 'avg-energy',
      icon: Zap,
      label: 'Average energy',
      status: avgEnergy !== null ? `${avgEnergy}/5` : 'Not enough data',
      trend: `Trend: ${insightsData.energyTrend}`,
      caption: 'Average of your daily energy check-ins this week.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: avgEnergy !== null,
    },
    {
      key: 'journal',
      icon: NotebookPen,
      label: 'Journal entries',
      status: `${journalCountInRange}`,
      trend: journalCountInRange > 0 ? 'Recorded this week' : 'None yet',
      caption: 'Journal entries written in the last 7 days.',
      accentClassName: 'bg-blush text-blush-foreground',
      tracked: journalCountInRange > 0,
    },
    {
      key: 'goals',
      icon: Target,
      label: 'Goals completed',
      status: reportDataUnavailable ? 'Unavailable' : `${reportData.summary?.goals.goalsCompletedInRange ?? 0}`,
      trend: reportDataUnavailable ? 'Try refreshing' : 'This week',
      caption: reportDataUnavailable
        ? 'We couldn’t load this right now.'
        : 'Wellness goals marked complete this week.',
      accentClassName: 'bg-accent text-accent-foreground',
      tracked: !reportDataUnavailable && (reportData.summary?.goals.goalsCompletedInRange ?? 0) > 0,
    },
    {
      key: 'sleep',
      icon: Moon,
      label: 'Sleep tracking',
      status: sleepDisplay.statusText,
      trend: sleepDisplay.trendText,
      caption: 'From your Sleep Intelligence log.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: true,
    },
    {
      key: 'cycle',
      icon: HeartPulse,
      label: 'Cycle events',
      status: `${cycleEventsInRange}`,
      trend: cycleEventsInRange > 0 ? 'Logged this week' : 'None this week',
      caption: 'Period records logged in the last 7 days.',
      accentClassName: 'bg-lavender text-lavender-foreground',
      tracked: cycleEventsInRange > 0,
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
  ]

  const achievements =
    status === 'ready'
      ? buildWeeklyAchievements({
          streak,
          consistencyPercent: insightsData.weeklySummary.consistencyPercent,
          checkInCount: insightsData.weeklySummary.count,
          journalCountInRange,
          goalsCompletedInRange: reportDataUnavailable ? null : (reportData.summary?.goals.goalsCompletedInRange ?? null),
        })
      : []

  const reflection =
    status === 'ready'
      ? buildWeeklyReflection({
          weeklySummary: insightsData.weeklySummary,
          moodTrend: insightsData.moodTrend,
          energyTrend: insightsData.energyTrend,
          journalCountInRange,
          goalsCompletedInRange: reportDataUnavailable ? null : (reportData.summary?.goals.goalsCompletedInRange ?? null),
        })
      : null

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <NotebookPen className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Weekly Wellness Summary"
          description={`${formatFriendlyDate(weekStart)} – ${formatFriendlyDate(today)}`}
          captions={[
            insightsData.weeklySummary.count > 0
              ? 'A gentle look back at the last 7 days, based only on what you recorded.'
              : 'Complete a check-in to start building your weekly summary.',
            `As of ${new Date().toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}`,
          ]}
        />
      </div>

      <InsightsSubNav />

      {status === 'loading' && (
        <div role="status" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {status === 'ready' && (
        <>
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-lg text-foreground">This week at a glance</h2>
            <MetricCardGrid status="ready" cards={kpiCards} />
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Mood &amp; Energy</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              {series.points.every((point) => point.entryCount === 0) ? (
                <EmptyState
                  icon={Smile}
                  title="No check-ins recorded this week yet"
                  description="Complete today's daily check-in to start your weekly mood and energy chart."
                  action={
                    <Link to="/dashboard#checkin" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                      Complete today's Daily Check-In
                    </Link>
                  }
                />
              ) : (
                <>
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
                  <MoodEnergyBarChart points={series.points} ariaLabel="Mood and energy for each day this week" />
                  <div className="grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2">
                    <div>
                      <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Mood this week</p>
                      <p className="text-foreground">
                        Average: {avgMood !== null ? `${avgMood}/5` : 'Not enough data'}
                      </p>
                      {moodHighLow.highest && moodHighLow.lowest && (
                        <p className="text-caption text-muted-foreground">
                          Highest: {moodHighLow.highest.label} · Lowest: {moodHighLow.lowest.label}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Energy this week</p>
                      <p className="text-foreground">
                        Average: {avgEnergy !== null ? `${avgEnergy}/5` : 'Not enough data'}
                      </p>
                      {energyHighLow.highest && energyHighLow.lowest && (
                        <p className="text-caption text-muted-foreground">
                          Highest: {energyHighLow.highest.label} · Lowest: {energyHighLow.lowest.label}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    Educational only — based solely on what you recorded this week, not a medical measurement.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-lg text-foreground">Wellness activity</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <WeeklyCheckInSummaryCard status={insightsData.status} summary={insightsData.weeklySummary} />
              <Card>
                <CardHeader>
                  <CardTitle>Goal progress</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {reportDataUnavailable ? (
                    <p className="text-muted-foreground">We couldn’t load your goal progress right now.</p>
                  ) : (
                    <p className="text-foreground">
                      {reportData.summary?.goals.progressEntriesInRange ?? 0} progress entr
                      {(reportData.summary?.goals.progressEntriesInRange ?? 0) === 1 ? 'y' : 'ies'} logged,{' '}
                      {reportData.summary?.goals.goalsCompletedInRange ?? 0} goal
                      {(reportData.summary?.goals.goalsCompletedInRange ?? 0) === 1 ? '' : 's'} completed this week.
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recovery activities</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className={recoveryReady ? 'text-foreground' : 'text-muted-foreground'}>
                    {recoveryDisplay.statusText}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Compass className="size-4 text-primary" aria-hidden="true" />
                    <CardTitle>Lifestyle activities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">Lifestyle Intelligence has its own weekly progress view.</p>
                  <Link to="/lifestyle-intelligence" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                    Open Lifestyle Intelligence
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="Your first achievement is just around the corner"
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
                  <CardTitle>AI Weekly Reflection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">What went well</p>
                  <p className="text-foreground">{reflection.whatWentWell}</p>
                </div>
                <div>
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Areas to observe</p>
                  <p className="text-muted-foreground">{reflection.areasToObserve}</p>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-support/25 p-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <p className="text-foreground">
                    <span className="font-medium">Suggested next habit: </span>
                    {reflection.suggestedNextHabit}
                  </p>
                </div>
                <div className="border-t border-border pt-2.5">
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
                    Positive encouragement
                  </p>
                  <p className="text-foreground">{reflection.positiveEncouragement}</p>
                </div>
                <p className="text-caption text-muted-foreground">
                  Educational only — never a diagnosis, prediction, or medical advice.
                </p>
              </CardContent>
            </Card>
          )}

          <div id="weekly-timeline" className="scroll-mt-24">
            <PersonalTimeline
              status={reportData.status}
              entries={reportData.timeline}
              onRetry={reportData.retry}
              goalsDataUnavailable={reportData.goalsDataUnavailable}
            />
          </div>
        </>
      )}
    </main>
  )
}

export default InsightsWeeklyPage

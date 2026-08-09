import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '@/components/shared/PageHeader'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import InsightsSubNav from '@/features/insights/InsightsSubNav'
import AiInsightCard from '@/features/insights/AiInsightCard'
import { buildAiInsightCategories } from '@/features/insights/aiInsightCategories'
import { generateNextSteps } from '@/features/insights/nextSteps'
import { useInsightsData } from '@/features/insights/useInsightsData'
import { useReportData } from '@/features/reports/useReportData'
import { useDashboardData } from '@/features/checkins/useDashboardData'
import { useSleepData } from '@/features/sleepIntelligence/useSleepData'
import { calculateSleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import { useStressRecoveryData } from '@/features/stressRecovery/useStressRecoveryData'
import { calculateStressRecoverySummary } from '@/features/stressRecovery/stressRecoveryCalculations'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type { TimelineEntryType } from '@/features/reports/types'

function mostRecentDate(timeline: { date: string; type: TimelineEntryType }[], types: TimelineEntryType[]): string | null {
  const entry = timeline.find((item) => types.includes(item.type))
  return entry ? entry.date : null
}

/**
 * Insights → AI Health Insights. Every category card is built from real
 * signals already computed elsewhere in HerHealth: mood/energy trend and
 * cycle data from useInsightsData() (the same engine behind Dashboard's
 * Wellness Insights), and goal/journal/PCOS counts and dates from
 * useReportData()'s existing 7-day summary and timeline. Sleep and Stress
 * & Recovery (Stage 5A) reuse useSleepData()/calculateSleepSummary() and
 * useStressRecoveryData()/calculateStressRecoverySummary() — the same
 * hooks/functions Lifestyle Intelligence already composes (Stage 4C2). No
 * new Supabase query shape, no duplicated calculation — this page only
 * composes and presents. Environment has no tracked field anywhere in
 * HerHealth and is shown honestly, not faked.
 */
function InsightsAiPage() {
  const insightsData = useInsightsData()
  const reportData = useReportData()
  const dashboardData = useDashboardData()
  const sleepData = useSleepData()
  const stressRecoveryData = useStressRecoveryData()
  const today = getLocalDateString()
  const sleepSummary = calculateSleepSummary(sleepData.entries, today)
  const stressRecoverySummary = calculateStressRecoverySummary(stressRecoveryData.entries, today)

  /**
   * Status is driven by useInsightsData() alone (Mood, Energy, and Cycle —
   * the core, always-available categories). useReportData() covers
   * Journal/Goals/Symptoms only, and can independently fail if a table
   * like wellness_goals hasn't been migrated in this environment yet —
   * that shouldn't blank out the 8 other categories that don't need it,
   * so its failure is passed through as `reportDataUnavailable` instead
   * of gating the whole page.
   */
  const status = insightsData.status
  const reportDataUnavailable = reportData.status === 'error'

  const journalCountInRange = reportData.timeline.filter((entry) => entry.type === 'journal').length
  const pcosEntryCount = reportData.summary?.pcosWellness?.entryCount ?? 0

  const categories =
    status === 'ready'
      ? buildAiInsightCategories({
          moodTrend: insightsData.moodTrend,
          energyTrend: insightsData.energyTrend,
          weeklyCheckInCount: insightsData.weeklySummary.count,
          lastCheckInDate: mostRecentDate(reportData.timeline, ['checkin']),
          cycleLength: insightsData.cycleLength,
          estimatedNextPeriod: insightsData.estimatedNextPeriod,
          periodRecordCount: insightsData.periodRecords.length,
          lastPeriodStartDate: insightsData.periodRecords[0]?.startDate ?? null,
          journalCountInRange,
          lastJournalDate: mostRecentDate(reportData.timeline, ['journal']),
          goalsSummary: reportData.summary?.goals ?? null,
          lastGoalActivityDate: mostRecentDate(reportData.timeline, ['goal_created', 'goal_completed', 'goal_progress']),
          pcosEnabled: reportData.pcosWellnessEnabled,
          pcosEntryCount,
          lastPcosEntryDate: mostRecentDate(reportData.timeline, ['pcos_wellness']),
          sleepStatus: sleepData.status,
          sleepSummary,
          lastSleepEntryDate: sleepData.entries[0]?.entryDate ?? null,
          stressRecoveryStatus: stressRecoveryData.status,
          stressRecoverySummary,
          lastStressRecoveryEntryDate: stressRecoveryData.entries[0]?.entryDate ?? null,
          reportDataUnavailable,
        })
      : []

  const nextSteps =
    status === 'ready'
      ? generateNextSteps({
          hasCheckedInToday: Boolean(dashboardData.todayCheckIn),
          journalCountInRange,
          periodRecordCount: insightsData.periodRecords.length,
          activeGoalCount: reportDataUnavailable ? null : (reportData.summary?.goals.activeGoalCount ?? null),
          goalProgressEntriesInRange: reportDataUnavailable
            ? null
            : (reportData.summary?.goals.progressEntriesInRange ?? null),
        })
      : []

  const hasAnyTrackedCategory = categories.some((category) => category.tracked)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <Sparkles className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Your Wellness Patterns"
          description="Rule-based, educational observations drawn from what you've recorded across HerHealth."
          captions={[
            'This never diagnoses conditions, predicts health outcomes, or replaces professional medical advice.',
          ]}
        />
      </div>

      <InsightsSubNav />

      {status === 'loading' && (
        <div role="status" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <EmptyState
          icon={Sparkles}
          title="We couldn't load your insights"
          description="Please refresh the page and try again."
        />
      )}

      {status === 'ready' && !hasAnyTrackedCategory && (
        <EmptyState
          icon={Sparkles}
          title="Your wellness patterns will appear here"
          description="Once you've completed a few check-ins, recorded a period, or logged a goal, HerHealth will start reflecting gentle, educational observations back to you."
          action={
            <Link to="/dashboard#checkin" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Complete today's check-in
            </Link>
          }
        />
      )}

      {status === 'ready' && nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested next steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {nextSteps.map((step) => (
                <Link
                  key={step.id}
                  to={step.href}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <step.icon className="size-3.5 text-primary" aria-hidden="true" />
                  {step.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'ready' && categories.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <AiInsightCard key={category.key} category={category} />
          ))}
        </div>
      )}

      <p className="text-center text-caption text-muted-foreground">
        These are gentle, pattern-based observations from the information you&apos;ve recorded in HerHealth —
        educational only, never a diagnosis, prediction, or medical advice.
      </p>
    </main>
  )
}

export default InsightsAiPage

import { LineChart } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import DateRangeSelector from '@/features/reports/DateRangeSelector'
import { useReportData } from '@/features/reports/useReportData'
import { useInsightsData } from '@/features/insights/useInsightsData'
import InsightCard from '@/features/insights/InsightCard'
import InsightsSubNav from '@/features/insights/InsightsSubNav'
import { INSIGHT_GROUPS, INSIGHT_CARDS, insightCardHref } from '@/components/layout/insightsCatalog'
import { formatFriendlyDate } from '@/features/periods/dateUtils'

function trendBadgeClassName(trend: string) {
  if (trend === 'Improving') return 'bg-support text-support-foreground'
  if (trend === 'Stable') return 'bg-lavender text-lavender-foreground'
  if (trend === 'Mixed' || trend === 'Decreasing') return 'bg-attention text-attention-foreground'
  return 'bg-muted text-muted-foreground'
}

/**
 * Insights hub — Stage 6A: navigation and architecture only. Every KPI and
 * recent-activity entry below is real, reusing useReportData() and
 * useInsightsData() exactly as they already exist elsewhere (Reports,
 * Dashboard) — nothing here is a new calculation. The five group pages
 * this links to (see insightsCatalog.ts) carry the deeper per-metric
 * content; this stage intentionally doesn't build all 17 individual cards'
 * worth of analytics.
 */
function InsightsPage() {
  const { range, status, summary, timeline, setPresetRange, setCustomRangeValue, retry } = useReportData()
  const insightsData = useInsightsData()

  const recentActivity = timeline.slice(0, 5)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <LineChart className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Insights"
          description="A single place to explore the patterns in what you've recorded — today, this week, and over time."
          captions={['Educational only. HerHealth never diagnoses, predicts, or replaces professional medical advice.']}
        />
      </div>

      <InsightsSubNav />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Date range</p>
        <DateRangeSelector range={range} onSelectPreset={setPresetRange} onApplyCustomRange={setCustomRangeValue} />
      </div>

      {/* Summary KPI cards — real, from useReportData/useInsightsData */}
      {status === 'loading' && (
        <div role="status" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <EmptyState
          icon={LineChart}
          title="We couldn't load your insights"
          description="Please try again."
          action={
            <button
              type="button"
              onClick={retry}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Try again
            </button>
          }
        />
      )}

      {status === 'ready' && summary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Check-ins</p>
            <p className="text-lg font-medium text-foreground">
              {summary.checkIns.count}
              {summary.checkIns.daysInRange > 0 && (
                <span className="text-caption text-muted-foreground"> ({summary.checkIns.consistencyPercent}%)</span>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Mood trend</p>
            <Badge className={trendBadgeClassName(insightsData.moodTrend)}>{insightsData.moodTrend}</Badge>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Energy trend</p>
            <Badge className={trendBadgeClassName(insightsData.energyTrend)}>{insightsData.energyTrend}</Badge>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Active goals</p>
            <p className="text-lg font-medium text-foreground">{summary.goals.activeGoalCount}</p>
          </div>
        </div>
      )}

      {/* Recent activity — real, from the same timeline used on Reports */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-foreground">Recent activity</h2>
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {status === 'ready' && recentActivity.length === 0 && (
          <EmptyState
            icon={LineChart}
            title="No recent activity yet"
            description="Once you record a check-in, period, or goal update, it will appear here."
          />
        )}
        {status === 'ready' && recentActivity.length > 0 && (
          <ul className="flex flex-col gap-2">
            {recentActivity.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-sm"
              >
                <span className="text-foreground">{entry.label}</span>
                <span className="shrink-0 text-caption text-muted-foreground">{formatFriendlyDate(entry.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Grouped insight cards */}
      {INSIGHT_GROUPS.map((group) => (
        <section key={group.key} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <group.icon className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground">{group.label}</h2>
              <p className="text-caption text-muted-foreground">{group.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INSIGHT_CARDS.filter((card) => card.group === group.key).map((card) => (
              <InsightCard
                key={card.key}
                icon={card.icon}
                title={card.name}
                description={card.description}
                href={insightCardHref(card)}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}

export default InsightsPage

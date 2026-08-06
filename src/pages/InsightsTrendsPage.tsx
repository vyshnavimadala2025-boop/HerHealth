import { Link } from 'react-router-dom'
import { Compass, Moon, TrendingUp, Wind } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import InsightsSubNav from '@/features/insights/InsightsSubNav'
import { useInsightsData } from '@/features/insights/useInsightsData'
import TrendsCard from '@/features/insights/TrendsCard'
import DashboardCycleCard from '@/features/periods/DashboardCycleCard'

/**
 * Insights → Health Trends. Mood and Cycle reuse the exact same real
 * components already shown on Dashboard (TrendsCard, DashboardCycleCard).
 * Sleep and Environment have no tracked field yet anywhere in HerHealth,
 * so they're shown honestly as not yet available rather than faked.
 * Goals and Lifestyle already have dedicated, richer trend views of their
 * own (Wellness Goals, Lifestyle Intelligence) — rather than duplicate
 * that content here, this links straight to it.
 */
function InsightsTrendsPage() {
  const insightsData = useInsightsData()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <TrendingUp className="size-6" aria-hidden="true" />
        </div>
        <PageHeader title="Health Trends" description="How your recorded signals have moved over time." />
      </div>

      <InsightsSubNav />

      <div id="mood" className="scroll-mt-24">
        <TrendsCard status={insightsData.status} moodTrend={insightsData.moodTrend} energyTrend={insightsData.energyTrend} />
      </div>

      <div id="cycle" className="scroll-mt-24">
        <DashboardCycleCard
          status={insightsData.status}
          records={insightsData.periodRecords}
          cycleLength={insightsData.cycleLength}
          estimatedNextPeriod={insightsData.estimatedNextPeriod}
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
              title="Not available yet"
              description="Sleep Intelligence is on its way — once it's built, your sleep trend will appear here."
              action={
                <Link to="/coming-soon/sleep-intelligence" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Learn more
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>

      <div id="goals" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Goal progress has its own dedicated trend view, including active and completed goals over time.
            </p>
            <Link to="/insights/reports" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              View goal progress in Reports
            </Link>
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
              Lifestyle Intelligence has its own dedicated progress timeline and weekly trends.
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
              Environmental Wellness tracks your surroundings once that data is available.
            </p>
            <Link to="/environmental-wellness" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Open Environmental Wellness
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default InsightsTrendsPage

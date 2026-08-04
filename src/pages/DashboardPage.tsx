import { useState } from 'react'
import { ClipboardList, HeartPulse, Target } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useDashboardData } from '@/features/checkins/useDashboardData'
import CheckInForm from '@/features/checkins/CheckInForm'
import RecentCheckIns from '@/features/checkins/RecentCheckIns'
import TodayHero from '@/features/checkins/TodayHero'
import SuggestedNextStep from '@/features/checkins/SuggestedNextStep'
import DashboardCycleCard from '@/features/periods/DashboardCycleCard'
import DashboardJournalCard from '@/features/journal/DashboardJournalCard'
import DashboardPcosWellnessCard from '@/features/pcosWellness/DashboardPcosWellnessCard'
import { useInsightsData } from '@/features/insights/useInsightsData'
import WeeklyCheckInSummaryCard from '@/features/insights/WeeklyCheckInSummaryCard'
import TrendsCard from '@/features/insights/TrendsCard'
import WellnessInsightsCard from '@/features/insights/WellnessInsightsCard'
import NextStepTile from '@/components/shared/NextStepTile'

type LoadStatus = 'loading' | 'ready' | 'error'

function DashboardPage() {
  const { user, profile } = useAuth()
  const { todayCheckIn, todayStatus, recentCheckIns, recentStatus, refresh } = useDashboardData()
  const insightsData = useInsightsData()

  const [journalStatus, setJournalStatus] = useState<LoadStatus>('loading')
  const [latestJournalDate, setLatestJournalDate] = useState<string | null>(null)

  const firstName = profile?.fullName?.trim().split(' ')[0] || user?.email

  const handleCheckInSaved = () => {
    refresh()
    insightsData.refresh()
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div id="checkin" className="scroll-mt-24">
        <TodayHero
          firstName={firstName ?? ''}
          todayStatus={todayStatus}
          todayCheckIn={todayCheckIn}
          insightsStatus={insightsData.status}
          weeklySummary={insightsData.weeklySummary}
          moodTrend={insightsData.moodTrend}
          energyTrend={insightsData.energyTrend}
          periodRecords={insightsData.periodRecords}
          estimatedNextPeriod={insightsData.estimatedNextPeriod}
        />
      </div>

      <p className="text-caption text-muted-foreground">
        Your entries are private and visible only to you. Your health overview is based on the
        information you choose to record.
      </p>

      <div id="checkin-form" className="scroll-mt-24">
        {user && (
          <CheckInForm
            userId={user.id}
            initialCheckIn={todayCheckIn}
            todayStatus={todayStatus}
            onSaved={handleCheckInSaved}
          />
        )}
      </div>

      <SuggestedNextStep
        todayStatus={todayStatus}
        todayCheckIn={todayCheckIn}
        journalStatus={journalStatus}
        latestJournalDate={latestJournalDate}
      />

      <details className="group rounded-xl border border-border">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground marker:content-none focus-visible:ring-3 focus-visible:ring-ring/50">
          View recent check-ins
          <span className="text-caption text-muted-foreground transition-transform duration-200 group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="border-t border-border p-4 pt-3">
          <RecentCheckIns status={recentStatus} checkIns={recentCheckIns} />
        </div>
      </details>

      <section id="insights" className="flex scroll-mt-24 flex-col gap-4">
        <h2 className="font-display text-lg text-foreground">Your wellness overview</h2>
        <WeeklyCheckInSummaryCard status={insightsData.status} summary={insightsData.weeklySummary} />

        <TrendsCard
          status={insightsData.status}
          moodTrend={insightsData.moodTrend}
          energyTrend={insightsData.energyTrend}
        />

        <DashboardCycleCard
          status={insightsData.status}
          records={insightsData.periodRecords}
          cycleLength={insightsData.cycleLength}
          estimatedNextPeriod={insightsData.estimatedNextPeriod}
        />

        <WellnessInsightsCard status={insightsData.status} insights={insightsData.insights} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-foreground">Continue your journey</h2>
        <div className="flex flex-wrap gap-3">
          <DashboardJournalCard
            onLoaded={(status, date) => {
              setJournalStatus(status)
              setLatestJournalDate(date)
            }}
          />
          <DashboardPcosWellnessCard />
          <NextStepTile
            icon={HeartPulse}
            label="Cycle Tracker"
            description="Review your cycle history"
            href="/cycle-tracker"
            accentClassName="bg-lavender text-lavender-foreground"
          />
          <NextStepTile
            icon={Target}
            label="Wellness Goals"
            description="Review your goals and progress"
            href="/goals"
            accentClassName="bg-accent text-accent-foreground"
          />
          <NextStepTile
            icon={ClipboardList}
            label="Wellness Reports"
            description="See a private summary of your data"
            href="/reports"
            accentClassName="bg-accent text-accent-foreground"
          />
        </div>
      </section>
    </main>
  )
}

export default DashboardPage

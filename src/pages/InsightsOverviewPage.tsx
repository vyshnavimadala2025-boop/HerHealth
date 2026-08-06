import { useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import InsightsSubNav from '@/features/insights/InsightsSubNav'
import { useReportData } from '@/features/reports/useReportData'
import ReportSummaryCard from '@/features/reports/ReportSummaryCard'

/**
 * Insights → Overview. Monthly Summary reuses the exact ReportSummaryCard
 * already used on Reports, pinned to a 30-day window. AI Health Insights
 * and Weekly Summary now have their own dedicated pages (/insights/ai,
 * /insights/weekly) with much deeper, per-category views — those sections
 * used to live here but were moved out rather than duplicated once each
 * dedicated page existed.
 */
function InsightsOverviewPage() {
  const monthly = useReportData()
  const { setPresetRange: setMonthlyPresetRange } = monthly

  useEffect(() => {
    setMonthlyPresetRange('30d')
  }, [setMonthlyPresetRange])

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <Bookmark className="size-6" aria-hidden="true" />
        </div>
        <PageHeader title="Overview" description="A rule-based summary of your recorded patterns." />
      </div>

      <InsightsSubNav />

      <div id="monthly-summary" className="scroll-mt-24">
        <ReportSummaryCard
          status={monthly.status}
          summary={monthly.summary}
          range={monthly.range}
          pcosWellnessEnabled={monthly.pcosWellnessEnabled}
          onRetry={monthly.retry}
        />
      </div>
    </main>
  )
}

export default InsightsOverviewPage

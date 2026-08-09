import { History } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import InsightsSubNav from '@/features/insights/InsightsSubNav'
import { useReportData } from '@/features/reports/useReportData'
import DateRangeSelector from '@/features/reports/DateRangeSelector'
import PersonalTimeline from '@/features/reports/PersonalTimeline'

/**
 * Insights → History. Reuses the exact same useReportData() timeline and
 * PersonalTimeline component already shown on Reports — "Wellness
 * Timeline" and "Personal History" are the same real, type-filterable
 * timeline, not two separate calculations.
 */
function InsightsHistoryPage() {
  const { range, status, timeline, setPresetRange, setCustomRangeValue, retry, goalsDataUnavailable } = useReportData()

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <History className="size-6" aria-hidden="true" />
        </div>
        <PageHeader title="History" description="A chronological view of everything you've recorded." />
      </div>

      <InsightsSubNav />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Date range</p>
        <DateRangeSelector range={range} onSelectPreset={setPresetRange} onApplyCustomRange={setCustomRangeValue} />
      </div>

      <div id="timeline" className="scroll-mt-24">
        <PersonalTimeline status={status} entries={timeline} onRetry={retry} goalsDataUnavailable={goalsDataUnavailable} />
      </div>
    </main>
  )
}

export default InsightsHistoryPage

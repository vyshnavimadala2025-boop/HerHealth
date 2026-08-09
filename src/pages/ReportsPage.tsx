import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReportData } from '@/features/reports/useReportData'
import DateRangeSelector from '@/features/reports/DateRangeSelector'
import ReportSummaryCard from '@/features/reports/ReportSummaryCard'
import PersonalTimeline from '@/features/reports/PersonalTimeline'
import DataExportCard from '@/features/reports/DataExportCard'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'

function ReportsPage() {
  const {
    range,
    status,
    summary,
    timeline,
    setPresetRange,
    setCustomRangeValue,
    retry,
    pcosWellnessEnabled,
    exportStatus,
    exportData,
    goalsDataUnavailable,
  } = useReportData()

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <PageHeader
        title="Wellness Trends & Personal Reports"
        description="Review your own recorded wellness information over time and export it privately."
        captions={[
          'These summaries are based only on the information you record in HerHealth and are not medical advice or a medical diagnosis.',
          'Your reports, timeline, and exported data are private and visible only to you.',
        ]}
      />
      <PrivacyBadge label="Reports and exports are private to your account" />

      <div className="flex flex-col gap-2 print:hidden">
        <p className="text-sm font-medium">Date range</p>
        <DateRangeSelector range={range} onSelectPreset={setPresetRange} onApplyCustomRange={setCustomRangeValue} />
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="self-start print:hidden"
      >
        <Printer />
        Print this report
      </Button>

      <ReportSummaryCard
        status={status}
        summary={summary}
        range={range}
        pcosWellnessEnabled={pcosWellnessEnabled}
        goalsDataUnavailable={goalsDataUnavailable}
        onRetry={retry}
      />

      <div id="timeline" className="scroll-mt-24">
        <PersonalTimeline status={status} entries={timeline} onRetry={retry} goalsDataUnavailable={goalsDataUnavailable} />
      </div>

      <div id="export" className="scroll-mt-24 print:hidden">
        <DataExportCard status={exportStatus} onExport={exportData} />
      </div>
    </main>
  )
}

export default ReportsPage

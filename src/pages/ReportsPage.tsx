import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReportData } from '@/features/reports/useReportData'
import DateRangeSelector from '@/features/reports/DateRangeSelector'
import ReportSummaryCard from '@/features/reports/ReportSummaryCard'
import PersonalTimeline from '@/features/reports/PersonalTimeline'
import DataExportCard from '@/features/reports/DataExportCard'

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
  } = useReportData()

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Wellness Trends &amp; Personal Reports</h1>
        <p className="text-body text-muted-foreground">
          Review your own recorded wellness information over time and export it privately.
        </p>
        <p className="text-caption text-muted-foreground">
          These summaries are based only on the information you record in HerHealth and are not medical
          advice or a medical diagnosis.
        </p>
        <p className="text-caption text-muted-foreground">
          Your reports, timeline, and exported data are private and visible only to you.
        </p>
      </div>

      <div className="print:hidden">
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
        onRetry={retry}
      />

      <PersonalTimeline status={status} entries={timeline} onRetry={retry} />

      <div className="print:hidden">
        <DataExportCard status={exportStatus} onExport={exportData} />
      </div>
    </main>
  )
}

export default ReportsPage

import { useState } from 'react'
import { Moon } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import { useSleepData } from '@/features/sleepIntelligence/useSleepData'
import { calculateSleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import SleepEntryForm from '@/features/sleepIntelligence/SleepEntryForm'
import SleepSummaryCard from '@/features/sleepIntelligence/SleepSummaryCard'
import SleepHistoryList from '@/features/sleepIntelligence/SleepHistoryList'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type { SleepEntry } from '@/features/sleepIntelligence/types'

/**
 * Sleep Intelligence (Stage 3B) — a general-purpose sleep log, following
 * the exact same architecture as Symptom Explorer (Stage 3A) and PCOS
 * Wellness: a service (sleepService.ts) + hook (useSleepData.ts), a form
 * mirroring PcosWellnessForm.tsx, a history list mirroring
 * PcosWellnessHistory.tsx, a delete dialog mirroring DeleteJournalDialog.tsx.
 * calculateSleepSummary() (sleepCalculations.ts) reuses
 * calculateConsistencyScore() (lifestyleCalculations.ts) and classifyTrend()
 * (trendMath.ts) rather than a new scoring engine, and the summary/trend
 * card reuses MetricCardGrid/MiniTrendChart exactly as Weekly/Monthly
 * Summary and Health Trends already do.
 */
function SleepIntelligencePage() {
  const sleepData = useSleepData()
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null)

  const handleEdit = (entry: SleepEntry) => setEditingEntry(entry)
  const handleCancelEdit = () => setEditingEntry(null)
  const handleSaved = () => setEditingEntry(null)

  const handleDeleted = (entryId: string) => {
    sleepData.removeEntry(entryId)
    if (editingEntry?.id === entryId) setEditingEntry(null)
  }

  const today = getLocalDateString()
  const summary = calculateSleepSummary(sleepData.entries, today)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <Moon className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Sleep Intelligence"
          description="Understand your own tracked sleep patterns over time."
          captions={[
            'Educational only. HerHealth never diagnoses a sleep disorder or predicts a health outcome — consider discussing persistent sleep concerns with a healthcare professional.',
          ]}
        />
      </div>

      <PrivacyBadge label="Your wellness information is private to your account" />

      <SleepSummaryCard status={sleepData.status} summary={summary} chartEntries={sleepData.entries} />

      <SleepEntryForm
        editingEntry={editingEntry}
        onSave={sleepData.save}
        onSaved={handleSaved}
        onCancelEdit={handleCancelEdit}
      />

      <SleepHistoryList
        status={sleepData.status}
        entries={sleepData.entries}
        onEdit={handleEdit}
        onDeleted={handleDeleted}
        onRetry={sleepData.retry}
      />
    </main>
  )
}

export default SleepIntelligencePage

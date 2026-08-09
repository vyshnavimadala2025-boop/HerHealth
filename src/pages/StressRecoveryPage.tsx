import { useState } from 'react'
import { Brain } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/shared/PageHeader'
import TrendsCard from '@/features/insights/TrendsCard'
import { useInsightsData } from '@/features/insights/useInsightsData'
import { useStressRecoveryData } from '@/features/stressRecovery/useStressRecoveryData'
import { calculateStressRecoverySummary, buildSleepRecoveryObservation } from '@/features/stressRecovery/stressRecoveryCalculations'
import { calculateSleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import StressRecoveryEntryForm from '@/features/stressRecovery/StressRecoveryEntryForm'
import StressRecoverySummaryCard from '@/features/stressRecovery/StressRecoverySummaryCard'
import StressRecoveryHistoryList from '@/features/stressRecovery/StressRecoveryHistoryList'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type { StressRecoveryEntry } from '@/features/stressRecovery/types'

const GENERAL_WELLNESS_ACTIONS = [
  'Rest when you can, and protect time for sleep.',
  'Stay hydrated throughout the day.',
  'Move your body in a way that feels good, even briefly.',
  'Try a few minutes of relaxation or mindful breathing.',
  'Keep a consistent daily routine where possible.',
  'Take short breaks during demanding periods.',
]

/**
 * Stress & Recovery (Stage 3D) — deliberately does NOT duplicate mood or
 * energy storage: those already live in daily_checkins and are reused
 * here exactly as Dashboard/AI Insights already display them, via
 * useInsightsData() + the existing TrendsCard component, unmodified. Only
 * the genuinely new dimensions (stress level, recovery level/actions,
 * reflection) get a new table (stress_recovery_entries) and follow the
 * same service/hook/form/list/delete-dialog architecture as Sleep
 * Intelligence (Stage 3B) and Nutrition Companion (Stage 3C).
 * calculateStressRecoverySummary() reuses calculateConsistencyScore() and
 * classifyTrend() — no new scoring engine, no Stress/Recovery Score.
 */
function StressRecoveryPage() {
  const insightsData = useInsightsData()
  const stressRecoveryData = useStressRecoveryData()
  const [editingEntry, setEditingEntry] = useState<StressRecoveryEntry | null>(null)

  const handleEdit = (entry: StressRecoveryEntry) => setEditingEntry(entry)
  const handleCancelEdit = () => setEditingEntry(null)
  const handleSaved = () => setEditingEntry(null)

  const handleDeleted = (entryId: string) => {
    stressRecoveryData.removeEntry(entryId)
    if (editingEntry?.id === entryId) setEditingEntry(null)
  }

  const today = getLocalDateString()
  const summary = calculateStressRecoverySummary(stressRecoveryData.entries, today)
  const sleepSummary = calculateSleepSummary(stressRecoveryData.sleepEntries, today)
  const sleepObservation = buildSleepRecoveryObservation(sleepSummary.qualityTrend, summary.recoveryTrend)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <Brain className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Stress & Recovery"
          description="Track how stress and recovery relate to each other over time."
          captions={[
            'Educational only. HerHealth never diagnoses anxiety, depression, burnout, or any other condition — consider talking with a healthcare professional if concerns persist or interfere with daily life.',
          ]}
        />
      </div>

      <TrendsCard status={insightsData.status} moodTrend={insightsData.moodTrend} energyTrend={insightsData.energyTrend} />

      <StressRecoverySummaryCard
        status={stressRecoveryData.status}
        summary={summary}
        chartEntries={stressRecoveryData.entries}
        sleepObservation={sleepObservation}
      />

      <StressRecoveryEntryForm
        editingEntry={editingEntry}
        onSave={stressRecoveryData.save}
        onSaved={handleSaved}
        onCancelEdit={handleCancelEdit}
      />

      <StressRecoveryHistoryList
        status={stressRecoveryData.status}
        entries={stressRecoveryData.entries}
        onEdit={handleEdit}
        onDeleted={handleDeleted}
        onRetry={stressRecoveryData.retry}
      />

      <Card>
        <CardHeader>
          <CardTitle>General Wellness Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2 text-sm text-foreground">
            {GENERAL_WELLNESS_ACTIONS.map((action) => (
              <li key={action} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {action}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-caption text-muted-foreground">
            General, educational wellness suggestions only — not a treatment plan or clinical intervention.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default StressRecoveryPage

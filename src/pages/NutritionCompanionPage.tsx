import { useState } from 'react'
import { Salad } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import { useNutritionData } from '@/features/nutritionCompanion/useNutritionData'
import { calculateNutritionSummary } from '@/features/nutritionCompanion/nutritionCalculations'
import NutritionEntryForm from '@/features/nutritionCompanion/NutritionEntryForm'
import NutritionSummaryCard from '@/features/nutritionCompanion/NutritionSummaryCard'
import NutritionHistoryList from '@/features/nutritionCompanion/NutritionHistoryList'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type { NutritionEntry } from '@/features/nutritionCompanion/types'

/**
 * Nutrition Companion (Stage 3C) — a general-purpose daily nutrition/
 * hydration awareness log, following the exact same architecture as Sleep
 * Intelligence (Stage 3B): a service (nutritionService.ts) + hook
 * (useNutritionData.ts) mirroring sleepService.ts/useSleepData.ts's
 * upsert-by-day pattern, a form/history-list/delete-dialog trio mirroring
 * SleepEntryForm.tsx/SleepHistoryList.tsx/DeleteSleepEntryDialog.tsx.
 * calculateNutritionSummary() (nutritionCalculations.ts) reuses
 * calculateConsistencyScore() and classifyTrend() exactly as
 * sleepCalculations.ts does — no new scoring engine, no calorie/nutrient
 * calculation (no approved data source exists for that).
 */
function NutritionCompanionPage() {
  const nutritionData = useNutritionData()
  const [editingEntry, setEditingEntry] = useState<NutritionEntry | null>(null)

  const handleEdit = (entry: NutritionEntry) => setEditingEntry(entry)
  const handleCancelEdit = () => setEditingEntry(null)
  const handleSaved = () => setEditingEntry(null)

  const handleDeleted = (entryId: string) => {
    nutritionData.removeEntry(entryId)
    if (editingEntry?.id === entryId) setEditingEntry(null)
  }

  const today = getLocalDateString()
  const summary = calculateNutritionSummary(nutritionData.entries, today)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <Salad className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Nutrition Companion"
          description="Gentle, educational awareness of your own everyday nutrition habits."
          captions={[
            'Educational only. SIRILA never calculates calories or nutrients, diagnoses a deficiency, or prescribes a diet — consider discussing individual dietary needs with a qualified healthcare professional or dietitian.',
          ]}
        />
      </div>

      <PrivacyBadge label="Your wellness information is private to your account" />

      <NutritionSummaryCard status={nutritionData.status} summary={summary} chartEntries={nutritionData.entries} />

      <NutritionEntryForm
        editingEntry={editingEntry}
        onSave={nutritionData.save}
        onSaved={handleSaved}
        onCancelEdit={handleCancelEdit}
      />

      <NutritionHistoryList
        status={nutritionData.status}
        entries={nutritionData.entries}
        onEdit={handleEdit}
        onDeleted={handleDeleted}
        onRetry={nutritionData.retry}
      />
    </main>
  )
}

export default NutritionCompanionPage

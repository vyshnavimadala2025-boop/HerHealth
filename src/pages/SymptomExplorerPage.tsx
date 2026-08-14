import { useState } from 'react'
import { ScanSearch } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import { useSymptomData } from '@/features/symptomExplorer/useSymptomData'
import SymptomLibrary from '@/features/symptomExplorer/SymptomLibrary'
import SymptomEntryForm from '@/features/symptomExplorer/SymptomEntryForm'
import SymptomEntryList from '@/features/symptomExplorer/SymptomEntryList'
import SymptomPatternsCard from '@/features/symptomExplorer/SymptomPatternsCard'
import { buildSymptomPatterns } from '@/features/symptomExplorer/symptomEducation'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type { SymptomEntry, SymptomValue } from '@/features/symptomExplorer/types'

/**
 * Symptom Explorer (Stage 3A) — a general-purpose, non-diagnostic symptom
 * log, distinct from the PCOS/PCOD wellness tracker and pregnancy log
 * (see 0011_symptom_entries.sql's comment for why it isn't folded into
 * either). Follows the same architecture as those two features exactly:
 * a service (symptomService.ts) + hook (useSymptomData.ts) mirroring
 * pcosWellnessService.ts/usePcosWellnessData.ts, a form mirroring
 * PcosWellnessForm.tsx, a history list mirroring PcosWellnessHistory.tsx,
 * and a delete dialog mirroring DeleteJournalDialog.tsx. Only the
 * educational library and the honest, threshold-gated pattern summary
 * are new UI concepts, and both are pure composition over real recorded
 * data — no diagnosis, no fabricated history.
 */
function SymptomExplorerPage() {
  const symptomData = useSymptomData()
  const [editingEntry, setEditingEntry] = useState<SymptomEntry | null>(null)
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomValue[]>([])
  const [searchValue, setSearchValue] = useState('')

  const toggleSymptom = (value: SymptomValue) => {
    setSelectedSymptoms((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const handleEdit = (entry: SymptomEntry) => {
    setEditingEntry(entry)
    setSelectedSymptoms(entry.symptoms)
  }

  const handleCancelEdit = () => {
    setEditingEntry(null)
    setSelectedSymptoms([])
  }

  const handleSaved = () => {
    setEditingEntry(null)
    setSelectedSymptoms([])
  }

  const handleDeleted = (entryId: string) => {
    symptomData.removeEntry(entryId)
    if (editingEntry?.id === entryId) {
      setEditingEntry(null)
      setSelectedSymptoms([])
    }
  }

  const today = getLocalDateString()
  const patterns = symptomData.status === 'ready' ? buildSymptomPatterns(symptomData.entries, today) : []

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <ScanSearch className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Symptom Explorer"
          description="A guided space to explore and record symptoms you've noticed, in your own words."
          captions={[
            'Educational only. SIRILA never diagnoses a condition or confirms a symptom means you have a specific illness — consider discussing persistent or concerning symptoms with a healthcare professional.',
          ]}
        />
      </div>

      <PrivacyBadge label="Your wellness information is private to your account" />

      <SymptomLibrary
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        selected={selectedSymptoms}
        onToggle={toggleSymptom}
      />

      <SymptomEntryForm
        editingEntry={editingEntry}
        selectedSymptoms={selectedSymptoms}
        onToggleSymptom={toggleSymptom}
        onCreate={symptomData.create}
        onUpdate={symptomData.update}
        onSaved={handleSaved}
        onCancelEdit={handleCancelEdit}
      />

      <SymptomEntryList
        status={symptomData.status}
        entries={symptomData.entries}
        onEdit={handleEdit}
        onDeleted={handleDeleted}
        onRetry={symptomData.retry}
      />

      <SymptomPatternsCard status={symptomData.status} patterns={patterns} />
    </main>
  )
}

export default SymptomExplorerPage

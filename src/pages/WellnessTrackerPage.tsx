import { useState } from 'react'
import { usePcosWellnessData } from '@/features/pcosWellness/usePcosWellnessData'
import PcosWellnessOptIn from '@/features/pcosWellness/PcosWellnessOptIn'
import PcosWellnessForm from '@/features/pcosWellness/PcosWellnessForm'
import PcosWellnessHistory from '@/features/pcosWellness/PcosWellnessHistory'
import type { PcosWellnessEntry } from '@/features/pcosWellness/types'

function WellnessTrackerPage() {
  const {
    enabled,
    enabledStatus,
    isTogglingEnabled,
    toggleEnabled,
    entries,
    entriesStatus,
    create,
    update,
    removeEntry,
    retry,
    suggestedDefault,
  } = usePcosWellnessData()
  const [editingEntry, setEditingEntry] = useState<PcosWellnessEntry | null>(null)

  const handleSaved = () => setEditingEntry(null)

  const handleDeleted = (entryId: string) => {
    removeEntry(entryId)
    if (editingEntry?.id === entryId) {
      setEditingEntry(null)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">PCOS/PCOD Wellness Tracking</h1>
        <p className="text-body text-muted-foreground">
          PCOS/PCOD wellness tracking is optional and is intended only for recording personal
          observations.
        </p>
        <p className="text-caption text-muted-foreground">
          Recording these observations does not diagnose PCOS/PCOD or replace advice from a
          qualified healthcare professional.
        </p>
        <p className="text-caption text-muted-foreground">
          Your entries are private and visible only to you.
        </p>
      </div>

      <PcosWellnessOptIn
        enabled={enabled}
        isToggling={isTogglingEnabled}
        suggestedDefault={suggestedDefault}
        onChange={toggleEnabled}
      />

      {enabledStatus === 'ready' && !enabled && (
        <p className="text-sm text-muted-foreground">
          Wellness tracking is optional and currently turned off. You can enable it above at any
          time to start recording entries.
        </p>
      )}

      {enabledStatus === 'ready' && enabled && (
        <>
          <PcosWellnessForm
            editingEntry={editingEntry}
            onCreate={create}
            onUpdate={update}
            onSaved={handleSaved}
            onCancelEdit={() => setEditingEntry(null)}
          />

          <PcosWellnessHistory
            status={entriesStatus}
            entries={entries}
            onEdit={setEditingEntry}
            onDeleted={handleDeleted}
            onRetry={retry}
          />
        </>
      )}
    </main>
  )
}

export default WellnessTrackerPage

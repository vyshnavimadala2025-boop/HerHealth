import { useState } from 'react'
import { Leaf } from 'lucide-react'
import { usePcosWellnessData } from '@/features/pcosWellness/usePcosWellnessData'
import EmptyState from '@/components/shared/EmptyState'
import PcosWellnessOptIn from '@/features/pcosWellness/PcosWellnessOptIn'
import PcosWellnessForm from '@/features/pcosWellness/PcosWellnessForm'
import PcosWellnessHistory from '@/features/pcosWellness/PcosWellnessHistory'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <PageHeader
        title="PCOS/PCOD Wellness Tracking"
        description="PCOS/PCOD wellness tracking is optional and is intended only for recording personal observations."
        captions={[
          'Recording these observations does not diagnose PCOS/PCOD or replace advice from a qualified healthcare professional.',
        ]}
      />
      <PrivacyBadge />

      <PcosWellnessOptIn
        enabled={enabled}
        isToggling={isTogglingEnabled}
        suggestedDefault={suggestedDefault}
        onChange={toggleEnabled}
      />

      {enabledStatus === 'ready' && !enabled && (
        <EmptyState
          icon={Leaf}
          title="Wellness tracking is turned off"
          description="You can enable it above at any time to start recording entries."
        />
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

import { useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useCycleTrackerData } from '@/features/periods/useCycleTrackerData'
import PeriodForm from '@/features/periods/PeriodForm'
import PeriodHistory from '@/features/periods/PeriodHistory'
import CycleOverview from '@/features/periods/CycleOverview'
import PageHeader from '@/components/shared/PageHeader'
import type { PeriodRecord } from '@/features/periods/types'

function CycleTrackerPage() {
  const { user } = useAuth()
  const { records, status, refresh } = useCycleTrackerData()
  const [editingRecord, setEditingRecord] = useState<PeriodRecord | null>(null)

  const handleSaved = () => {
    setEditingRecord(null)
    refresh()
  }

  const handleDeleted = () => {
    setEditingRecord(null)
    refresh()
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <PageHeader
        title="Cycle Tracker"
        description="Track your cycle and understand your personal patterns."
        captions={[
          'Your cycle information is private and visible only to you.',
          'Cycle estimates are based on your recorded dates and are not medical predictions.',
        ]}
      />

      <CycleOverview status={status} records={records} />

      {user && (
        <PeriodForm
          userId={user.id}
          editingRecord={editingRecord}
          onSaved={handleSaved}
          onCancelEdit={() => setEditingRecord(null)}
        />
      )}

      <PeriodHistory
        status={status}
        records={records}
        onEdit={setEditingRecord}
        onDeleted={handleDeleted}
      />
    </main>
  )
}

export default CycleTrackerPage

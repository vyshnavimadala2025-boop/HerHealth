import { useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useCycleTrackerData } from '@/features/periods/useCycleTrackerData'
import PeriodForm from '@/features/periods/PeriodForm'
import PeriodHistory from '@/features/periods/PeriodHistory'
import CycleOverview from '@/features/periods/CycleOverview'
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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Cycle Tracker</h1>
        <p className="text-body text-muted-foreground">
          Track your cycle and understand your personal patterns.
        </p>
        <p className="text-caption text-muted-foreground">
          Your cycle information is private and visible only to you.
        </p>
        <p className="text-caption text-muted-foreground">
          Cycle estimates are based on your recorded dates and are not medical predictions.
        </p>
      </div>

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

      <CycleOverview status={status} records={records} />
    </main>
  )
}

export default CycleTrackerPage

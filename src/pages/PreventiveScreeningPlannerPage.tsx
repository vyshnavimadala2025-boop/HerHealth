import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { useScreeningData } from '@/features/screeningPlanner/useScreeningData'
import ScreeningCategoryBrowser from '@/features/screeningPlanner/ScreeningCategoryBrowser'
import ScreeningItemForm from '@/features/screeningPlanner/ScreeningItemForm'
import ScreeningItemList from '@/features/screeningPlanner/ScreeningItemList'
import { useReminderPreferences } from '@/features/reminders/useReminderPreferences'
import ReminderPreferencesForm from '@/features/reminders/ReminderPreferencesForm'
import type { ScreeningItem } from '@/features/screeningPlanner/types'

/**
 * Preventive Screening Planner (Stage 3F, final Stage 3 sub-stage) —
 * a planning/tracking/educational tool built entirely on new,
 * purpose-built infrastructure for the one thing nothing else in
 * HerHealth captures (a dated, personal screening record), while fully
 * reusing Preventive Reminders as-is: ReminderPreferencesForm and
 * useReminderPreferences are the exact same hook/component GoalsPage.tsx
 * already uses, now also covering the 'screening' activity type (see
 * reminders/types.ts) — no new reminder table, no new reminder service.
 * No screening schedule, age threshold, or eligibility rule is ever
 * invented (see screeningEducation.ts) — every date is user-entered and
 * every category is an organizational tag only.
 */
function PreventiveScreeningPlannerPage() {
  const screeningData = useScreeningData()
  const { preferences, status: reminderStatus, save: saveReminder } = useReminderPreferences()
  const [editingItem, setEditingItem] = useState<ScreeningItem | null>(null)

  const handleSaved = () => setEditingItem(null)
  const handleDeleted = (itemId: string) => {
    screeningData.removeItem(itemId)
    if (editingItem?.id === itemId) setEditingItem(null)
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Preventive Screening Planner"
          description="Stay organized around your own preventive health check-ups."
          captions={[
            'A planning and tracking tool, not a diagnostic tool or medical decision engine. It does not determine which screenings you need.',
          ]}
        />
      </div>

      <ScreeningCategoryBrowser />

      <div id="screening-reminders" className="scroll-mt-24">
        <ReminderPreferencesForm status={reminderStatus} preferences={preferences} onSave={saveReminder} />
      </div>

      <ScreeningItemForm
        editingItem={editingItem}
        onCreate={screeningData.create}
        onUpdate={screeningData.update}
        onSaved={handleSaved}
        onCancelEdit={() => setEditingItem(null)}
      />

      <ScreeningItemList
        status={screeningData.status}
        items={screeningData.items}
        onEdit={setEditingItem}
        onComplete={screeningData.complete}
        onReopen={screeningData.reopen}
        onDeleted={handleDeleted}
        onRetry={screeningData.retry}
      />
    </main>
  )
}

export default PreventiveScreeningPlannerPage

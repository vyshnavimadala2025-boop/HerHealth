import { useMemo, useState } from 'react'
import { useGoalsData } from '@/features/goals/useGoalsData'
import { useProgressSummary } from '@/features/goals/useProgressSummary'
import { useReminderPreferences } from '@/features/reminders/useReminderPreferences'
import ProgressSummaryCard from '@/features/goals/ProgressSummaryCard'
import GoalForm from '@/features/goals/GoalForm'
import GoalList from '@/features/goals/GoalList'
import ReminderPreferencesForm from '@/features/reminders/ReminderPreferencesForm'
import type { WellnessGoal } from '@/features/goals/types'

function GoalsPage() {
  const {
    goals,
    status: goalsStatus,
    create,
    update,
    complete,
    reopen,
    archive,
    removeGoal,
    retry: retryGoals,
  } = useGoalsData()
  const { counts, status: progressStatus } = useProgressSummary()
  const {
    preferences,
    status: reminderStatus,
    save: saveReminder,
  } = useReminderPreferences()
  const [editingGoal, setEditingGoal] = useState<WellnessGoal | null>(null)

  const { activeGoalsCount, completedGoalsCount } = useMemo(
    () => ({
      activeGoalsCount: goals.filter((goal) => goal.status === 'active').length,
      completedGoalsCount: goals.filter((goal) => goal.status === 'completed').length,
    }),
    [goals],
  )

  const handleSaved = () => setEditingGoal(null)

  const handleDeleted = (goalId: string) => {
    removeGoal(goalId)
    if (editingGoal?.id === goalId) {
      setEditingGoal(null)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Wellness Goals &amp; Progress</h1>
        <p className="text-body text-muted-foreground">
          Private, self-directed wellness routines and self-tracking tools.
        </p>
        <p className="text-caption text-muted-foreground">
          This is a personal tracking tool and is not medical advice. You can adjust any goal at
          any time.
        </p>
        <p className="text-caption text-muted-foreground">
          Your goals, progress, and reminder preferences are private and visible only to you.
        </p>
      </div>

      <ProgressSummaryCard
        status={progressStatus}
        counts={counts}
        activeGoalsCount={activeGoalsCount}
        completedGoalsCount={completedGoalsCount}
      />

      <ReminderPreferencesForm
        status={reminderStatus}
        preferences={preferences}
        onSave={saveReminder}
      />

      <GoalForm
        editingGoal={editingGoal}
        onCreate={create}
        onUpdate={update}
        onSaved={handleSaved}
        onCancelEdit={() => setEditingGoal(null)}
      />

      <GoalList
        status={goalsStatus}
        goals={goals}
        onEdit={setEditingGoal}
        onComplete={complete}
        onReopen={reopen}
        onArchive={archive}
        onDeleted={handleDeleted}
        onRetry={retryGoals}
      />
    </main>
  )
}

export default GoalsPage

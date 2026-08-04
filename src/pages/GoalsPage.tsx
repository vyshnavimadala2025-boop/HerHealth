import { useMemo, useState } from 'react'
import { useGoalsData } from '@/features/goals/useGoalsData'
import { useProgressSummary } from '@/features/goals/useProgressSummary'
import { useReminderPreferences } from '@/features/reminders/useReminderPreferences'
import ProgressSummaryCard from '@/features/goals/ProgressSummaryCard'
import GoalForm from '@/features/goals/GoalForm'
import GoalList from '@/features/goals/GoalList'
import ReminderPreferencesForm from '@/features/reminders/ReminderPreferencesForm'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <PageHeader
        title="Wellness Goals & Progress"
        description="Private, self-directed wellness routines and self-tracking tools."
        captions={[
          'This is a personal tracking tool and is not medical advice. You can adjust any goal at any time.',
          'Your goals, progress, and reminder preferences are private and visible only to you.',
        ]}
      />
      <PrivacyBadge label="Goals and progress are private to your account" />

      <div id="progress" className="scroll-mt-24">
        <ProgressSummaryCard
          status={progressStatus}
          counts={counts}
          activeGoalsCount={activeGoalsCount}
          completedGoalsCount={completedGoalsCount}
        />
      </div>

      <div id="reminders" className="scroll-mt-24">
        <ReminderPreferencesForm
          status={reminderStatus}
          preferences={preferences}
          onSave={saveReminder}
        />
      </div>

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

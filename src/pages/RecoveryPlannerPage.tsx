import { useState } from 'react'
import { Feather, Sparkles } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useGoalsData } from '@/features/goals/useGoalsData'
import GoalForm from '@/features/goals/GoalForm'
import GoalList from '@/features/goals/GoalList'
import { useSleepData } from '@/features/sleepIntelligence/useSleepData'
import { calculateSleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import { useStressRecoveryData } from '@/features/stressRecovery/useStressRecoveryData'
import { calculateStressRecoverySummary } from '@/features/stressRecovery/stressRecoveryCalculations'
import { buildRecoveryFocusSuggestions } from '@/features/recoveryPlanner/recoveryFocusSuggestions'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type { WellnessGoal } from '@/features/goals/types'

/**
 * Recovery Planner (Stage 3E) — a focused view over the EXISTING Wellness
 * Goals infrastructure, not a new goal system. useGoalsData(), GoalForm,
 * and GoalList are the exact same hook/components the Goals page uses,
 * unmodified except two small, necessary extension points: GOAL_CATEGORIES
 * gained a 'recovery' value (types.ts), GoalCard's existing "Log progress"
 * button now also shows for that category (it already worked for
 * 'custom' goals), and GoalForm gained an optional defaultCategory prop
 * so this page can pre-select "Recovery action" without touching the
 * Goals page's own behavior. This page filters the same goals list to
 * category === 'recovery' and reuses GoalList exactly as-is — no new
 * list/card/dialog component. The "recovery focus" suggestions reuse
 * Sleep Intelligence's and Stress & Recovery's own real calculations
 * (Stages 3B/3D) — no new scoring engine, no Recovery Score.
 */
function RecoveryPlannerPage() {
  const goalsData = useGoalsData()
  const sleepData = useSleepData()
  const stressRecoveryData = useStressRecoveryData()
  const [editingGoal, setEditingGoal] = useState<WellnessGoal | null>(null)

  const recoveryGoals = goalsData.goals.filter((goal) => goal.category === 'recovery')

  const handleSaved = () => setEditingGoal(null)
  const handleDeleted = (goalId: string) => {
    goalsData.removeGoal(goalId)
    if (editingGoal?.id === goalId) setEditingGoal(null)
  }

  const today = getLocalDateString()
  const sleepSummary = calculateSleepSummary(sleepData.entries, today)
  const stressRecoverySummary = calculateStressRecoverySummary(stressRecoveryData.entries, today)
  const suggestions = buildRecoveryFocusSuggestions(sleepSummary, stressRecoverySummary)

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <Feather className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Recovery Planner"
          description="Plan gentle recovery actions around your own tracked wellness patterns."
          captions={[
            'A personal wellness planning tool, not a medical treatment plan. Suggestions are general and educational — consider discussing individual health needs with a healthcare professional.',
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <CardTitle>Your Recovery Focus</CardTitle>
          </div>
          <CardDescription>Based only on what you&apos;ve tracked in Sleep Intelligence and Stress &amp; Recovery.</CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length > 0 ? (
            <ul className="flex flex-col gap-2 text-sm">
              {suggestions.map((suggestion) => (
                <li key={suggestion.key} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <span className="text-foreground">{suggestion.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose a small recovery action below and track your progress over time. Once you&apos;ve tracked a bit
              more in Sleep Intelligence or Stress &amp; Recovery, personal focus suggestions will appear here.
            </p>
          )}
        </CardContent>
      </Card>

      <div id="new-recovery-action" className="scroll-mt-24">
        <GoalForm
          editingGoal={editingGoal}
          defaultCategory="recovery"
          onCreate={goalsData.create}
          onUpdate={goalsData.update}
          onSaved={handleSaved}
          onCancelEdit={() => setEditingGoal(null)}
        />
      </div>

      <GoalList
        status={goalsData.status}
        goals={recoveryGoals}
        onEdit={setEditingGoal}
        onComplete={goalsData.complete}
        onReopen={goalsData.reopen}
        onArchive={goalsData.archive}
        onDeleted={handleDeleted}
        onRetry={goalsData.retry}
      />
    </main>
  )
}

export default RecoveryPlannerPage

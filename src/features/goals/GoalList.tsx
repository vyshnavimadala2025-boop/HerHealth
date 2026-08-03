import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import GoalCard from '@/features/goals/GoalCard'
import type { WellnessGoal } from '@/features/goals/types'

interface GoalActions {
  onEdit: (goal: WellnessGoal) => void
  onComplete: (goalId: string) => void
  onReopen: (goalId: string) => void
  onArchive: (goalId: string) => void
  onDeleted: (goalId: string) => void
}

interface GoalGroupProps extends GoalActions {
  title: string
  goals: WellnessGoal[]
  emptyText: string
}

function GoalGroup({ title, goals, emptyText, ...actions }: GoalGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {goals.length === 0 ? (
        <p className="text-caption text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} {...actions} />
          ))}
        </ul>
      )}
    </div>
  )
}

interface GoalListProps extends GoalActions {
  status: 'loading' | 'ready' | 'error'
  goals: WellnessGoal[]
  onRetry: () => void
}

function GoalList({ status, goals, onRetry, ...actions }: GoalListProps) {
  const active = goals.filter((goal) => goal.status === 'active')
  const completed = goals.filter((goal) => goal.status === 'completed')
  const archived = goals.filter((goal) => goal.status === 'archived')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wellness Goals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {status === 'loading' && (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading your wellness goals…
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-start gap-2 py-4">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load your wellness goals. Please try again.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}

        {status === 'ready' && goals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t set any wellness goals yet. Add one whenever you&apos;re ready.
          </p>
        )}

        {status === 'ready' && goals.length > 0 && (
          <>
            <GoalGroup
              title="Active goals"
              goals={active}
              emptyText="No active goals right now."
              {...actions}
            />
            <GoalGroup
              title="Completed goals"
              goals={completed}
              emptyText="You haven't completed any goals yet."
              {...actions}
            />
            <GoalGroup
              title="Archived goals"
              goals={archived}
              emptyText="No archived goals."
              {...actions}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default GoalList

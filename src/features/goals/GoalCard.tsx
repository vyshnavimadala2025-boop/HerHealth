import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DeleteGoalDialog from '@/features/goals/DeleteGoalDialog'
import { useAuth } from '@/features/auth/useAuth'
import { getCheckInCount } from '@/features/checkins/checkinService'
import { getJournalEntryCount } from '@/features/journal/journalService'
import { getPeriodRecordCount } from '@/features/periods/periodService'
import { addGoalProgressEntry, getGoalProgressEntries } from '@/features/goals/goalProgressService'
import {
  GOAL_CATEGORIES,
  TARGET_PERIODS,
  formatFriendlyDate,
  getLocalDateString,
  getTargetWindowStart,
  type WellnessGoal,
} from '@/features/goals/types'

function categoryLabel(category: string) {
  return GOAL_CATEGORIES.find((option) => option.value === category)?.label ?? category
}

function periodLabel(period: string | null) {
  if (!period) return null
  return TARGET_PERIODS.find((option) => option.value === period)?.label ?? period
}

interface GoalCardProps {
  goal: WellnessGoal
  onEdit: (goal: WellnessGoal) => void
  onComplete: (goalId: string) => void
  onReopen: (goalId: string) => void
  onArchive: (goalId: string) => void
  onDeleted: (goalId: string) => void
}

function GoalCard({ goal, onEdit, onComplete, onReopen, onArchive, onDeleted }: GoalCardProps) {
  const { user } = useAuth()
  const [windowCount, setWindowCount] = useState<number | null>(null)
  const [isLoggingProgress, setIsLoggingProgress] = useState(false)
  const [progressError, setProgressError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !goal.targetCount || !goal.targetPeriod) {
      setWindowCount(null)
      return
    }
    let active = true
    const windowStart = getTargetWindowStart(goal.targetPeriod)

    const load = async () => {
      try {
        let count: number
        if (goal.category === 'checkins') {
          count = await getCheckInCount(user.id, { startDate: windowStart })
        } else if (goal.category === 'journaling') {
          count = await getJournalEntryCount(user.id, { startDate: windowStart })
        } else if (goal.category === 'cycle_tracking') {
          count = await getPeriodRecordCount(user.id, { startDate: windowStart })
        } else {
          const entries = await getGoalProgressEntries(goal.id)
          count = entries.filter((entry) => entry.progressDate >= windowStart).length
        }
        if (active) setWindowCount(count)
      } catch {
        if (active) setWindowCount(null)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [user, goal.id, goal.category, goal.targetCount, goal.targetPeriod])

  const handleLogProgress = async () => {
    if (!user) return
    setIsLoggingProgress(true)
    setProgressError(null)
    try {
      await addGoalProgressEntry(user.id, goal.id, {
        progressDate: getLocalDateString(),
        note: null,
      })
      setWindowCount((current) => (current ?? 0) + 1)
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsLoggingProgress(false)
    }
  }

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium break-words">{goal.title}</p>
          <p className="text-caption text-muted-foreground">{categoryLabel(goal.category)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Edit this goal"
            onClick={() => onEdit(goal)}
          >
            <Pencil />
          </Button>
          <DeleteGoalDialog goal={goal} onDeleted={() => onDeleted(goal.id)} />
        </div>
      </div>

      {goal.note && <p className="text-muted-foreground break-words">{goal.note}</p>}

      {goal.targetCount && (
        <p className="text-caption text-muted-foreground">
          Target: {goal.targetCount}
          {periodLabel(goal.targetPeriod) ? ` ${periodLabel(goal.targetPeriod)}` : ' (one-time)'}
          {windowCount !== null && ` — ${windowCount} of ${goal.targetCount} so far`}
        </p>
      )}

      <p className="text-caption text-muted-foreground">
        Started {formatFriendlyDate(goal.startDate)}
        {goal.targetDate ? ` · Target date ${formatFriendlyDate(goal.targetDate)}` : ''}
      </p>

      {goal.category === 'custom' && goal.status === 'active' && (
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogProgress}
            disabled={isLoggingProgress}
            className="self-start"
          >
            {isLoggingProgress ? 'Logging…' : 'Log progress for today'}
          </Button>
          {progressError && (
            <p role="alert" className="text-caption text-destructive">
              {progressError}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {goal.status === 'active' && (
          <>
            <Button type="button" size="sm" onClick={() => onComplete(goal.id)}>
              Mark complete
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onArchive(goal.id)}>
              Archive
            </Button>
          </>
        )}
        {goal.status === 'completed' && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => onReopen(goal.id)}>
              Reopen
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onArchive(goal.id)}>
              Archive
            </Button>
          </>
        )}
        {goal.status === 'archived' && (
          <Button type="button" variant="outline" size="sm" onClick={() => onReopen(goal.id)}>
            Reopen
          </Button>
        )}
      </div>
    </li>
  )
}

export default GoalCard

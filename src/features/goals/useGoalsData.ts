import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  archiveGoal,
  completeGoal,
  createGoal,
  getGoals,
  reopenGoal,
  updateGoal,
  type GoalInput,
} from '@/features/goals/goalService'
import type { WellnessGoal } from '@/features/goals/types'

type LoadStatus = 'loading' | 'ready' | 'error'

export function useGoalsData() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<WellnessGoal[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')

  const load = useCallback(async () => {
    if (!user) return
    setStatus('loading')
    try {
      const result = await getGoals(user.id)
      setGoals(result)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const replaceGoal = useCallback((goal: WellnessGoal) => {
    setGoals((current) => current.map((item) => (item.id === goal.id ? goal : item)))
  }, [])

  const addGoal = useCallback((goal: WellnessGoal) => {
    setGoals((current) => [goal, ...current])
  }, [])

  /** Local-state-only removal — the delete service call happens in DeleteGoalDialog itself. */
  const removeGoal = useCallback((goalId: string) => {
    setGoals((current) => current.filter((item) => item.id !== goalId))
  }, [])

  const create = useCallback(
    async (input: GoalInput) => {
      if (!user) throw new Error('You must be signed in to save a wellness goal.')
      const saved = await createGoal(user.id, input)
      addGoal(saved)
      return saved
    },
    [user, addGoal],
  )

  const update = useCallback(
    async (goalId: string, input: GoalInput) => {
      const saved = await updateGoal(goalId, input)
      replaceGoal(saved)
      return saved
    },
    [replaceGoal],
  )

  const complete = useCallback(
    async (goalId: string) => {
      const saved = await completeGoal(goalId)
      replaceGoal(saved)
      return saved
    },
    [replaceGoal],
  )

  const reopen = useCallback(
    async (goalId: string) => {
      const saved = await reopenGoal(goalId)
      replaceGoal(saved)
      return saved
    },
    [replaceGoal],
  )

  const archive = useCallback(
    async (goalId: string) => {
      const saved = await archiveGoal(goalId)
      replaceGoal(saved)
      return saved
    },
    [replaceGoal],
  )

  return {
    goals,
    status,
    create,
    update,
    complete,
    reopen,
    archive,
    removeGoal,
    retry: load,
  }
}

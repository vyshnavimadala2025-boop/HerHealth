import { supabase } from '@/lib/supabaseClient'
import type { GoalCategory, GoalStatus, TargetPeriod, WellnessGoal } from '@/features/goals/types'

interface WellnessGoalRow {
  id: string
  title: string
  category: string
  note: string | null
  target_count: number | null
  target_period: string | null
  status: string
  start_date: string
  target_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

const GOAL_COLUMNS =
  'id, title, category, note, target_count, target_period, status, start_date, target_date, completed_at, created_at, updated_at'

function mapRow(row: WellnessGoalRow): WellnessGoal {
  return {
    id: row.id,
    title: row.title,
    category: row.category as GoalCategory,
    note: row.note,
    targetCount: row.target_count,
    targetPeriod: row.target_period as TargetPeriod | null,
    status: row.status as GoalStatus,
    startDate: row.start_date,
    targetDate: row.target_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getGoals(userId: string): Promise<WellnessGoal[]> {
  const { data, error } = await supabase
    .from('wellness_goals')
    .select(GOAL_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Unable to load your wellness goals. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface GoalInput {
  title: string
  category: GoalCategory
  note: string | null
  targetCount: number | null
  targetPeriod: TargetPeriod | null
  startDate: string
  targetDate: string | null
}

export async function createGoal(userId: string, input: GoalInput): Promise<WellnessGoal> {
  const { data, error } = await supabase
    .from('wellness_goals')
    .insert({
      user_id: userId,
      title: input.title,
      category: input.category,
      note: input.note,
      target_count: input.targetCount,
      target_period: input.targetPeriod,
      start_date: input.startDate,
      target_date: input.targetDate,
    })
    .select(GOAL_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your wellness goal. Please try again.')
  return mapRow(data)
}

export async function updateGoal(goalId: string, input: GoalInput): Promise<WellnessGoal> {
  const { data, error } = await supabase
    .from('wellness_goals')
    .update({
      title: input.title,
      category: input.category,
      note: input.note,
      target_count: input.targetCount,
      target_period: input.targetPeriod,
      start_date: input.startDate,
      target_date: input.targetDate,
    })
    .eq('id', goalId)
    .select(GOAL_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your wellness goal. Please try again.')
  return mapRow(data)
}

async function updateGoalStatus(
  goalId: string,
  payload: { status: GoalStatus; completed_at?: string | null },
): Promise<WellnessGoal> {
  const { data, error } = await supabase
    .from('wellness_goals')
    .update(payload)
    .eq('id', goalId)
    .select(GOAL_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your wellness goal. Please try again.')
  return mapRow(data)
}

export function completeGoal(goalId: string): Promise<WellnessGoal> {
  return updateGoalStatus(goalId, { status: 'completed', completed_at: new Date().toISOString() })
}

export function reopenGoal(goalId: string): Promise<WellnessGoal> {
  return updateGoalStatus(goalId, { status: 'active', completed_at: null })
}

/** Archiving preserves whatever completed_at already was — it isn't a completion or reopening action. */
export function archiveGoal(goalId: string): Promise<WellnessGoal> {
  return updateGoalStatus(goalId, { status: 'archived' })
}

export async function deleteGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('wellness_goals').delete().eq('id', goalId)
  if (error) throw new Error('We could not delete your wellness goal. Please try again.')
}

import { supabase } from '@/lib/supabaseClient'
import type { GoalProgressEntry } from '@/features/goals/types'

interface GoalProgressEntryRow {
  id: string
  goal_id: string
  progress_date: string
  note: string | null
  created_at: string
}

const PROGRESS_COLUMNS = 'id, goal_id, progress_date, note, created_at'

function mapRow(row: GoalProgressEntryRow): GoalProgressEntry {
  return {
    id: row.id,
    goalId: row.goal_id,
    progressDate: row.progress_date,
    note: row.note,
    createdAt: row.created_at,
  }
}

/** Used for 'custom' goals only — category-linked goals derive progress from their source table instead. */
export async function getGoalProgressEntries(goalId: string): Promise<GoalProgressEntry[]> {
  const { data, error } = await supabase
    .from('goal_progress_entries')
    .select(PROGRESS_COLUMNS)
    .eq('goal_id', goalId)
    .order('progress_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error('Unable to load progress for this goal. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface GoalProgressInput {
  progressDate: string
  note: string | null
}

export async function addGoalProgressEntry(
  userId: string,
  goalId: string,
  input: GoalProgressInput,
): Promise<GoalProgressEntry> {
  const { data, error } = await supabase
    .from('goal_progress_entries')
    .insert({
      user_id: userId,
      goal_id: goalId,
      progress_date: input.progressDate,
      note: input.note,
    })
    .select(PROGRESS_COLUMNS)
    .single()

  if (error) throw new Error('We could not log progress for this goal. Please try again.')
  return mapRow(data)
}

export async function deleteGoalProgressEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('goal_progress_entries').delete().eq('id', entryId)
  if (error) throw new Error('We could not remove this progress entry. Please try again.')
}

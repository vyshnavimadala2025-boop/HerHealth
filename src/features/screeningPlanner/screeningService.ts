import { supabase } from '@/lib/supabaseClient'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type { ScreeningCategory, ScreeningItem, ScreeningStatus } from '@/features/screeningPlanner/types'

interface ScreeningItemRow {
  id: string
  title: string
  category: string | null
  planned_date: string | null
  completed_date: string | null
  status: string
  note: string | null
  created_at: string
  updated_at: string
}

const ITEM_COLUMNS = 'id, title, category, planned_date, completed_date, status, note, created_at, updated_at'

function mapRow(row: ScreeningItemRow): ScreeningItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category as ScreeningCategory | null,
    plannedDate: row.planned_date,
    completedDate: row.completed_date,
    status: row.status as ScreeningStatus,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getScreeningItems(userId: string): Promise<ScreeningItem[]> {
  const { data, error } = await supabase
    .from('screening_items')
    .select(ITEM_COLUMNS)
    .eq('user_id', userId)
    .order('planned_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error('Unable to load your screening planner. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface ScreeningItemInput {
  title: string
  category: ScreeningCategory | null
  plannedDate: string | null
  note: string | null
}

export async function createScreeningItem(userId: string, input: ScreeningItemInput): Promise<ScreeningItem> {
  const { data, error } = await supabase
    .from('screening_items')
    .insert({
      user_id: userId,
      title: input.title,
      category: input.category,
      planned_date: input.plannedDate,
      note: input.note,
    })
    .select(ITEM_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your screening plan. Please try again.')
  return mapRow(data)
}

export async function updateScreeningItem(itemId: string, input: ScreeningItemInput): Promise<ScreeningItem> {
  const { data, error } = await supabase
    .from('screening_items')
    .update({
      title: input.title,
      category: input.category,
      planned_date: input.plannedDate,
      note: input.note,
    })
    .eq('id', itemId)
    .select(ITEM_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your screening plan. Please try again.')
  return mapRow(data)
}

async function updateScreeningStatus(
  itemId: string,
  payload: { status: ScreeningStatus; completed_date: string | null },
): Promise<ScreeningItem> {
  const { data, error } = await supabase
    .from('screening_items')
    .update(payload)
    .eq('id', itemId)
    .select(ITEM_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your screening plan. Please try again.')
  return mapRow(data)
}

/** Completion is always an explicit user action — completed_date is set to today when clicked, never inferred from planned_date. */
export function completeScreeningItem(itemId: string): Promise<ScreeningItem> {
  return updateScreeningStatus(itemId, { status: 'completed', completed_date: getLocalDateString() })
}

export function reopenScreeningItem(itemId: string): Promise<ScreeningItem> {
  return updateScreeningStatus(itemId, { status: 'planned', completed_date: null })
}

export async function deleteScreeningItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('screening_items').delete().eq('id', itemId)
  if (error) throw new Error('We could not delete your screening plan. Please try again.')
}

/**
 * Permanently deletes every screening item for this user (for future
 * account-wide data deletion, matching every other feature's deleteAll*
 * function — not yet wired into DataPrivacySection/useDataDeletion.ts;
 * flagged as a follow-up in Stage 3F's report, same as every other new
 * table introduced across Stage 3). Blind bulk delete scoped by user_id;
 * RLS's existing delete policy is the actual enforcement boundary.
 */
export async function deleteAllScreeningItems(userId: string): Promise<void> {
  const { error } = await supabase.from('screening_items').delete().eq('user_id', userId)
  if (error) throw new Error('We could not delete your screening plans. Please try again.')
}

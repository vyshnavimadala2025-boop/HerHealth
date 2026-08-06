import { supabase } from '@/lib/supabaseClient'
import type { ChecklistCategory, PregnancyChecklistItem } from '@/features/pregnancy/types'

interface ChecklistItemRow {
  id: string
  item_name: string
  category: string
  is_checked: boolean
  created_at: string
  updated_at: string
}

const CHECKLIST_COLUMNS = 'id, item_name, category, is_checked, created_at, updated_at'

function mapRow(row: ChecklistItemRow): PregnancyChecklistItem {
  return {
    id: row.id,
    itemName: row.item_name,
    category: row.category as ChecklistCategory,
    isChecked: row.is_checked,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getChecklistItems(userId: string): Promise<PregnancyChecklistItem[]> {
  const { data, error } = await supabase
    .from('pregnancy_checklist_items')
    .select(CHECKLIST_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw new Error('Unable to load your checklist. Please try again.')
  return (data ?? []).map(mapRow)
}

export async function addChecklistItem(
  userId: string,
  itemName: string,
  category: ChecklistCategory,
): Promise<PregnancyChecklistItem> {
  const { data, error } = await supabase
    .from('pregnancy_checklist_items')
    .insert({ user_id: userId, item_name: itemName, category })
    .select(CHECKLIST_COLUMNS)
    .single()

  if (error) throw new Error('We could not add that item. Please try again.')
  return mapRow(data)
}

export async function toggleChecklistItem(itemId: string, isChecked: boolean): Promise<PregnancyChecklistItem> {
  const { data, error } = await supabase
    .from('pregnancy_checklist_items')
    .update({ is_checked: isChecked })
    .eq('id', itemId)
    .select(CHECKLIST_COLUMNS)
    .single()

  if (error) throw new Error('We could not update that item. Please try again.')
  return mapRow(data)
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('pregnancy_checklist_items').delete().eq('id', itemId)
  if (error) throw new Error('We could not remove that item. Please try again.')
}

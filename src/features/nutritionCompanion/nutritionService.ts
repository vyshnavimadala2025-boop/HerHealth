import { supabase } from '@/lib/supabaseClient'
import type { FoodCategoryValue, MealValue, NutritionEntry } from '@/features/nutritionCompanion/types'

interface NutritionEntryRow {
  id: string
  entry_date: string
  meals_logged: string[]
  food_categories: string[]
  hydration_glasses: number | null
  note: string | null
  created_at: string
  updated_at: string
}

const ENTRY_COLUMNS = 'id, entry_date, meals_logged, food_categories, hydration_glasses, note, created_at, updated_at'

function mapRow(row: NutritionEntryRow): NutritionEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    mealsLogged: (row.meals_logged ?? []) as MealValue[],
    foodCategories: (row.food_categories ?? []) as FoodCategoryValue[],
    hydrationGlasses: row.hydration_glasses,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface NutritionEntriesRangeOptions {
  startDate?: string
  endDate?: string
}

export async function getNutritionEntries(
  userId: string,
  range: NutritionEntriesRangeOptions = {},
): Promise<NutritionEntry[]> {
  let query = supabase
    .from('nutrition_entries')
    .select(ENTRY_COLUMNS)
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })

  if (range.startDate) query = query.gte('entry_date', range.startDate)
  if (range.endDate) query = query.lte('entry_date', range.endDate)

  const { data, error } = await query
  if (error) throw new Error('Unable to load your nutrition entries. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface NutritionEntryInput {
  entryDate: string
  mealsLogged: MealValue[]
  foodCategories: FoodCategoryValue[]
  hydrationGlasses: number | null
  note: string | null
}

/**
 * One nutrition record per calendar day — upserted by (user_id, entry_date)
 * exactly like sleepService.ts's saveSleepEntry(), so saving the same date
 * again (editing a past day from history) updates that same row.
 */
export async function saveNutritionEntry(userId: string, input: NutritionEntryInput): Promise<NutritionEntry> {
  const { data, error } = await supabase
    .from('nutrition_entries')
    .upsert(
      {
        user_id: userId,
        entry_date: input.entryDate,
        meals_logged: input.mealsLogged,
        food_categories: input.foodCategories,
        hydration_glasses: input.hydrationGlasses,
        note: input.note,
      },
      { onConflict: 'user_id,entry_date' },
    )
    .select(ENTRY_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your nutrition entry. Please try again.')
  return mapRow(data)
}

export async function deleteNutritionEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('nutrition_entries').delete().eq('id', entryId)
  if (error) throw new Error('We could not delete your nutrition entry. Please try again.')
}

/**
 * Permanently deletes every nutrition entry for this user (for future
 * account-wide data deletion, matching every other feature's deleteAll*
 * function — not yet wired into DataPrivacySection/useDataDeletion.ts;
 * flagged as a follow-up in Stage 3C's report). Blind bulk delete scoped
 * by user_id; RLS's existing delete policy is the actual enforcement
 * boundary.
 */
export async function deleteAllNutritionEntries(userId: string): Promise<void> {
  const { error } = await supabase.from('nutrition_entries').delete().eq('user_id', userId)
  if (error) throw new Error('We could not delete your nutrition entries. Please try again.')
}

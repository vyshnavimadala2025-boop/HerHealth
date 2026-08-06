import { supabase } from '@/lib/supabaseClient'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type {
  CervicalMucus,
  FertilityEnergyLevel,
  FertilityEntry,
  FertilityHabit,
  FertilityMood,
  OvulationTestResult,
  QualityScale,
  StressLevel,
} from '@/features/fertility/types'

interface FertilityEntryRow {
  id: string
  entry_date: string
  cervical_mucus: string | null
  bbt_celsius: number | null
  ovulation_test: string | null
  mood: string | null
  energy_level: string | null
  sleep_quality: string | null
  stress_level: string | null
  nutrition_quality: string | null
  water_intake_glasses: number | null
  exercise_minutes: number | null
  intimacy: boolean
  habits: string[]
  note: string | null
  created_at: string
  updated_at: string
}

const ENTRY_COLUMNS =
  'id, entry_date, cervical_mucus, bbt_celsius, ovulation_test, mood, energy_level, sleep_quality, stress_level, nutrition_quality, water_intake_glasses, exercise_minutes, intimacy, habits, note, created_at, updated_at'

function mapRow(row: FertilityEntryRow): FertilityEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    cervicalMucus: row.cervical_mucus as CervicalMucus | null,
    bbtCelsius: row.bbt_celsius,
    ovulationTest: row.ovulation_test as OvulationTestResult | null,
    mood: row.mood as FertilityMood | null,
    energyLevel: row.energy_level as FertilityEnergyLevel | null,
    sleepQuality: row.sleep_quality as QualityScale | null,
    stressLevel: row.stress_level as StressLevel | null,
    nutritionQuality: row.nutrition_quality as QualityScale | null,
    waterIntakeGlasses: row.water_intake_glasses,
    exerciseMinutes: row.exercise_minutes,
    intimacy: row.intimacy,
    habits: (row.habits ?? []) as FertilityHabit[],
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getFertilityEntries(userId: string): Promise<FertilityEntry[]> {
  const { data, error } = await supabase
    .from('fertility_entries')
    .select(ENTRY_COLUMNS)
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })

  if (error) throw new Error('Unable to load your fertility entries. Please try again.')
  return (data ?? []).map(mapRow)
}

export async function getTodayFertilityEntry(userId: string): Promise<FertilityEntry | null> {
  const today = getLocalDateString()
  const { data, error } = await supabase
    .from('fertility_entries')
    .select(ENTRY_COLUMNS)
    .eq('user_id', userId)
    .eq('entry_date', today)
    .maybeSingle()

  if (error) throw new Error('Unable to load today’s fertility entry. Please try again.')
  return data ? mapRow(data) : null
}

export interface FertilityEntryInput {
  entryDate: string
  cervicalMucus: CervicalMucus | null
  bbtCelsius: number | null
  ovulationTest: OvulationTestResult | null
  mood: FertilityMood | null
  energyLevel: FertilityEnergyLevel | null
  sleepQuality: QualityScale | null
  stressLevel: StressLevel | null
  nutritionQuality: QualityScale | null
  waterIntakeGlasses: number | null
  exerciseMinutes: number | null
  intimacy: boolean
  habits: FertilityHabit[]
  note: string | null
}

function toRowInput(userId: string, input: FertilityEntryInput) {
  return {
    user_id: userId,
    entry_date: input.entryDate,
    cervical_mucus: input.cervicalMucus,
    bbt_celsius: input.bbtCelsius,
    ovulation_test: input.ovulationTest,
    mood: input.mood,
    energy_level: input.energyLevel,
    sleep_quality: input.sleepQuality,
    stress_level: input.stressLevel,
    nutrition_quality: input.nutritionQuality,
    water_intake_glasses: input.waterIntakeGlasses,
    exercise_minutes: input.exerciseMinutes,
    intimacy: input.intimacy,
    habits: input.habits,
    note: input.note,
  }
}

/** Upserts by (user_id, entry_date) — one entry per day, same pattern as daily check-ins. */
export async function saveFertilityEntry(
  userId: string,
  input: FertilityEntryInput,
): Promise<FertilityEntry> {
  const { data, error } = await supabase
    .from('fertility_entries')
    .upsert(toRowInput(userId, input), { onConflict: 'user_id,entry_date' })
    .select(ENTRY_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your fertility entry. Please try again.')
  return mapRow(data)
}

export async function deleteFertilityEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('fertility_entries').delete().eq('id', entryId)
  if (error) throw new Error('We could not delete your fertility entry. Please try again.')
}

/**
 * Permanently deletes every fertility entry for this user (matches the
 * existing per-feature bulk-delete pattern used by data-privacy controls
 * elsewhere in the app).
 */
export async function deleteAllFertilityEntries(userId: string): Promise<void> {
  const { error } = await supabase.from('fertility_entries').delete().eq('user_id', userId)
  if (error) throw new Error('We could not delete your fertility entries. Please try again.')
}

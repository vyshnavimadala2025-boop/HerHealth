import { supabase } from '@/lib/supabaseClient'
import type {
  NutritionHabit,
  PregnancyEnergyLevel,
  PregnancyEntry,
  PregnancyMood,
  PregnancySleepQuality,
  Symptom,
} from '@/features/pregnancy/types'

interface PregnancyEntryRow {
  id: string
  entry_date: string
  mood: string | null
  energy_level: string | null
  sleep_quality: string | null
  water_intake_glasses: number | null
  exercise_minutes: number | null
  weight_kg: number | null
  blood_pressure_systolic: number | null
  blood_pressure_diastolic: number | null
  baby_movement_note: string | null
  symptoms: string[]
  nutrition_habits: string[]
  reflection: string | null
  created_at: string
  updated_at: string
}

const ENTRY_COLUMNS =
  'id, entry_date, mood, energy_level, sleep_quality, water_intake_glasses, exercise_minutes, weight_kg, blood_pressure_systolic, blood_pressure_diastolic, baby_movement_note, symptoms, nutrition_habits, reflection, created_at, updated_at'

function mapRow(row: PregnancyEntryRow): PregnancyEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    mood: row.mood as PregnancyMood | null,
    energyLevel: row.energy_level as PregnancyEnergyLevel | null,
    sleepQuality: row.sleep_quality as PregnancySleepQuality | null,
    waterIntakeGlasses: row.water_intake_glasses,
    exerciseMinutes: row.exercise_minutes,
    weightKg: row.weight_kg,
    bloodPressureSystolic: row.blood_pressure_systolic,
    bloodPressureDiastolic: row.blood_pressure_diastolic,
    babyMovementNote: row.baby_movement_note,
    symptoms: (row.symptoms ?? []) as Symptom[],
    nutritionHabits: (row.nutrition_habits ?? []) as NutritionHabit[],
    reflection: row.reflection,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getPregnancyEntries(userId: string): Promise<PregnancyEntry[]> {
  const { data, error } = await supabase
    .from('pregnancy_entries')
    .select(ENTRY_COLUMNS)
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })

  if (error) throw new Error('Unable to load your pregnancy entries. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface PregnancyEntryInput {
  entryDate: string
  mood: PregnancyMood | null
  energyLevel: PregnancyEnergyLevel | null
  sleepQuality: PregnancySleepQuality | null
  waterIntakeGlasses: number | null
  exerciseMinutes: number | null
  weightKg: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  babyMovementNote: string | null
  symptoms: Symptom[]
  nutritionHabits: NutritionHabit[]
  reflection: string | null
}

export async function savePregnancyEntry(
  userId: string,
  input: PregnancyEntryInput,
): Promise<PregnancyEntry> {
  const { data, error } = await supabase
    .from('pregnancy_entries')
    .upsert(
      {
        user_id: userId,
        entry_date: input.entryDate,
        mood: input.mood,
        energy_level: input.energyLevel,
        sleep_quality: input.sleepQuality,
        water_intake_glasses: input.waterIntakeGlasses,
        exercise_minutes: input.exerciseMinutes,
        weight_kg: input.weightKg,
        blood_pressure_systolic: input.bloodPressureSystolic,
        blood_pressure_diastolic: input.bloodPressureDiastolic,
        baby_movement_note: input.babyMovementNote,
        symptoms: input.symptoms,
        nutrition_habits: input.nutritionHabits,
        reflection: input.reflection,
      },
      { onConflict: 'user_id,entry_date' },
    )
    .select(ENTRY_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your pregnancy entry. Please try again.')
  return mapRow(data)
}

export async function deletePregnancyEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('pregnancy_entries').delete().eq('id', entryId)
  if (error) throw new Error('We could not delete your pregnancy entry. Please try again.')
}

export async function deleteAllPregnancyEntries(userId: string): Promise<void> {
  const { error } = await supabase.from('pregnancy_entries').delete().eq('user_id', userId)
  if (error) throw new Error('We could not delete your pregnancy entries. Please try again.')
}

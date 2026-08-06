import { supabase } from '@/lib/supabaseClient'
import type { PregnancyProfile } from '@/features/pregnancy/types'

interface PregnancyProfileRow {
  id: string
  due_date: string
  preferred_hospital: string | null
  emergency_contact: string | null
  support_person: string | null
  pain_management_preference: string | null
  birth_plan_notes: string | null
  created_at: string
  updated_at: string
}

const PROFILE_COLUMNS =
  'id, due_date, preferred_hospital, emergency_contact, support_person, pain_management_preference, birth_plan_notes, created_at, updated_at'

function mapRow(row: PregnancyProfileRow): PregnancyProfile {
  return {
    id: row.id,
    dueDate: row.due_date,
    preferredHospital: row.preferred_hospital,
    emergencyContact: row.emergency_contact,
    supportPerson: row.support_person,
    painManagementPreference: row.pain_management_preference,
    birthPlanNotes: row.birth_plan_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getPregnancyProfile(userId: string): Promise<PregnancyProfile | null> {
  const { data, error } = await supabase
    .from('pregnancy_profiles')
    .select(PROFILE_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error('Unable to load your pregnancy profile. Please try again.')
  return data ? mapRow(data) : null
}

export interface PregnancyProfileInput {
  dueDate: string
  preferredHospital: string | null
  emergencyContact: string | null
  supportPerson: string | null
  painManagementPreference: string | null
  birthPlanNotes: string | null
}

/** Upserts by user_id — one pregnancy profile per user, same shape as daily-entry upserts elsewhere in the app. */
export async function savePregnancyProfile(
  userId: string,
  input: PregnancyProfileInput,
): Promise<PregnancyProfile> {
  const { data, error } = await supabase
    .from('pregnancy_profiles')
    .upsert(
      {
        user_id: userId,
        due_date: input.dueDate,
        preferred_hospital: input.preferredHospital,
        emergency_contact: input.emergencyContact,
        support_person: input.supportPerson,
        pain_management_preference: input.painManagementPreference,
        birth_plan_notes: input.birthPlanNotes,
      },
      { onConflict: 'user_id' },
    )
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your pregnancy profile. Please try again.')
  return mapRow(data)
}

export async function deletePregnancyProfile(userId: string): Promise<void> {
  const { error } = await supabase.from('pregnancy_profiles').delete().eq('user_id', userId)
  if (error) throw new Error('We could not delete your pregnancy profile. Please try again.')
}

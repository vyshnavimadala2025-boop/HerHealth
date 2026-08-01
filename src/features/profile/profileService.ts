import { supabase } from '@/lib/supabaseClient'
import type { AgeRange, Profile, TrackingPreference } from '@/features/profile/types'

interface ProfileRow {
  id: string
  full_name: string
  email: string
  age_range: string | null
  tracking_preferences: string[]
  onboarding_completed: boolean
}

const PROFILE_COLUMNS = 'id, full_name, email, age_range, tracking_preferences, onboarding_completed'

function mapRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    ageRange: (row.age_range as AgeRange | null) ?? null,
    trackingPreferences: (row.tracking_preferences ?? []) as TrackingPreference[],
    onboardingCompleted: row.onboarding_completed,
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error('Unable to load your profile. Please try again.')
  return data ? mapRow(data) : null
}

export interface CompleteOnboardingInput {
  fullName: string
  ageRange: AgeRange | null
  trackingPreferences: TrackingPreference[]
}

export async function completeOnboarding(
  userId: string,
  input: CompleteOnboardingInput,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: input.fullName,
      age_range: input.ageRange,
      tracking_preferences: input.trackingPreferences,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your profile. Please try again.')
  return mapRow(data)
}

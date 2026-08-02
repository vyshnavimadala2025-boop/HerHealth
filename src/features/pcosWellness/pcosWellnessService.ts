import { supabase } from '@/lib/supabaseClient'
import type { PcosObservation, PcosWellnessEntry } from '@/features/pcosWellness/types'

interface PcosWellnessEntryRow {
  id: string
  entry_date: string
  observations: string[]
  note: string | null
  created_at: string
  updated_at: string
}

const ENTRY_COLUMNS = 'id, entry_date, observations, note, created_at, updated_at'

function mapRow(row: PcosWellnessEntryRow): PcosWellnessEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    observations: (row.observations ?? []) as PcosObservation[],
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getPcosWellnessEntries(userId: string): Promise<PcosWellnessEntry[]> {
  const { data, error } = await supabase
    .from('pcos_wellness_entries')
    .select(ENTRY_COLUMNS)
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error('Unable to load your wellness entries. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface PcosWellnessEntryInput {
  entryDate: string
  observations: PcosObservation[]
  note: string | null
}

export async function createPcosWellnessEntry(
  userId: string,
  input: PcosWellnessEntryInput,
): Promise<PcosWellnessEntry> {
  const { data, error } = await supabase
    .from('pcos_wellness_entries')
    .insert({
      user_id: userId,
      entry_date: input.entryDate,
      observations: input.observations,
      note: input.note,
    })
    .select(ENTRY_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your wellness entry. Please try again.')
  return mapRow(data)
}

export async function updatePcosWellnessEntry(
  entryId: string,
  input: PcosWellnessEntryInput,
): Promise<PcosWellnessEntry> {
  const { data, error } = await supabase
    .from('pcos_wellness_entries')
    .update({
      entry_date: input.entryDate,
      observations: input.observations,
      note: input.note,
    })
    .eq('id', entryId)
    .select(ENTRY_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your wellness entry. Please try again.')
  return mapRow(data)
}

export async function deletePcosWellnessEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('pcos_wellness_entries').delete().eq('id', entryId)
  if (error) throw new Error('We could not delete your wellness entry. Please try again.')
}

/**
 * Lightweight dashboard-only query — selects only the entry_date of the
 * most recent entry. Observations and notes are never selected here, so
 * the dashboard card can never display or leak private wellness detail.
 */
export async function getLatestPcosWellnessEntryDate(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('pcos_wellness_entries')
    .select('entry_date')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error('Unable to load your wellness summary. Please try again.')
  return data ? data.entry_date : null
}

/**
 * Reads/writes the opt-in flag directly on profiles, selecting only that
 * one column. Deliberately isolated from profileService.ts's core
 * PROFILE_COLUMNS/getProfile path, so this new, migration-dependent column
 * can never break login/onboarding/dashboard before 0006 has been run.
 */
export async function getPcosTrackingEnabled(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('pcos_tracking_enabled')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error('Unable to load your wellness tracking preference. Please try again.')
  }
  return data?.pcos_tracking_enabled ?? false
}

export async function setPcosTrackingEnabled(userId: string, enabled: boolean): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ pcos_tracking_enabled: enabled })
    .eq('id', userId)
    .select('pcos_tracking_enabled')
    .single()

  if (error) {
    throw new Error('We could not update your wellness tracking preference. Please try again.')
  }
  return data.pcos_tracking_enabled
}

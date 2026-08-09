import { supabase } from '@/lib/supabaseClient'
import type { SeverityValue, SymptomEntry, SymptomValue, TimingValue } from '@/features/symptomExplorer/types'

interface SymptomEntryRow {
  id: string
  entry_date: string
  symptoms: string[]
  severity: string | null
  timing: string | null
  note: string | null
  created_at: string
  updated_at: string
}

const ENTRY_COLUMNS = 'id, entry_date, symptoms, severity, timing, note, created_at, updated_at'

function mapRow(row: SymptomEntryRow): SymptomEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    symptoms: (row.symptoms ?? []) as SymptomValue[],
    severity: row.severity as SeverityValue | null,
    timing: row.timing as TimingValue | null,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getSymptomEntries(userId: string): Promise<SymptomEntry[]> {
  const { data, error } = await supabase
    .from('symptom_entries')
    .select(ENTRY_COLUMNS)
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error('Unable to load your symptom entries. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface SymptomEntryInput {
  entryDate: string
  symptoms: SymptomValue[]
  severity: SeverityValue | null
  timing: TimingValue | null
  note: string | null
}

export async function createSymptomEntry(userId: string, input: SymptomEntryInput): Promise<SymptomEntry> {
  const { data, error } = await supabase
    .from('symptom_entries')
    .insert({
      user_id: userId,
      entry_date: input.entryDate,
      symptoms: input.symptoms,
      severity: input.severity,
      timing: input.timing,
      note: input.note,
    })
    .select(ENTRY_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your symptom entry. Please try again.')
  return mapRow(data)
}

export async function updateSymptomEntry(entryId: string, input: SymptomEntryInput): Promise<SymptomEntry> {
  const { data, error } = await supabase
    .from('symptom_entries')
    .update({
      entry_date: input.entryDate,
      symptoms: input.symptoms,
      severity: input.severity,
      timing: input.timing,
      note: input.note,
    })
    .eq('id', entryId)
    .select(ENTRY_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your symptom entry. Please try again.')
  return mapRow(data)
}

export async function deleteSymptomEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('symptom_entries').delete().eq('id', entryId)
  if (error) throw new Error('We could not delete your symptom entry. Please try again.')
}

/**
 * Permanently deletes every symptom entry for this user (for future
 * account-wide data deletion, matching every other feature's deleteAll*
 * function — not yet wired into DataPrivacySection/useDataDeletion.ts;
 * see Stage 3A's report for that known follow-up). Blind bulk delete
 * scoped by user_id; RLS's existing delete policy is the actual
 * enforcement boundary.
 */
export async function deleteAllSymptomEntries(userId: string): Promise<void> {
  const { error } = await supabase.from('symptom_entries').delete().eq('user_id', userId)
  if (error) throw new Error('We could not delete your symptom entries. Please try again.')
}

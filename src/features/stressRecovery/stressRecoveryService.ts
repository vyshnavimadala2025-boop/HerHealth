import { supabase } from '@/lib/supabaseClient'
import type { RecoveryAction, RecoveryLevel, StressLevel, StressRecoveryEntry } from '@/features/stressRecovery/types'

interface StressRecoveryEntryRow {
  id: string
  entry_date: string
  stress_level: string | null
  recovery_level: string | null
  recovery_actions: string[]
  reflection: string | null
  created_at: string
  updated_at: string
}

const ENTRY_COLUMNS =
  'id, entry_date, stress_level, recovery_level, recovery_actions, reflection, created_at, updated_at'

function mapRow(row: StressRecoveryEntryRow): StressRecoveryEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    stressLevel: row.stress_level as StressLevel | null,
    recoveryLevel: row.recovery_level as RecoveryLevel | null,
    recoveryActions: (row.recovery_actions ?? []) as RecoveryAction[],
    reflection: row.reflection,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface StressRecoveryEntriesRangeOptions {
  startDate?: string
  endDate?: string
}

export async function getStressRecoveryEntries(
  userId: string,
  range: StressRecoveryEntriesRangeOptions = {},
): Promise<StressRecoveryEntry[]> {
  let query = supabase
    .from('stress_recovery_entries')
    .select(ENTRY_COLUMNS)
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })

  if (range.startDate) query = query.gte('entry_date', range.startDate)
  if (range.endDate) query = query.lte('entry_date', range.endDate)

  const { data, error } = await query
  if (error) throw new Error('Unable to load your stress and recovery data. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface StressRecoveryEntryInput {
  entryDate: string
  stressLevel: StressLevel | null
  recoveryLevel: RecoveryLevel | null
  recoveryActions: RecoveryAction[]
  reflection: string | null
}

/**
 * One record per calendar day — upserted by (user_id, entry_date) exactly
 * like sleepService.ts/nutritionService.ts, so saving the same date again
 * (editing a past day from history) updates that same row.
 */
export async function saveStressRecoveryEntry(
  userId: string,
  input: StressRecoveryEntryInput,
): Promise<StressRecoveryEntry> {
  const { data, error } = await supabase
    .from('stress_recovery_entries')
    .upsert(
      {
        user_id: userId,
        entry_date: input.entryDate,
        stress_level: input.stressLevel,
        recovery_level: input.recoveryLevel,
        recovery_actions: input.recoveryActions,
        reflection: input.reflection,
      },
      { onConflict: 'user_id,entry_date' },
    )
    .select(ENTRY_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your stress and recovery entry. Please try again.')
  return mapRow(data)
}

export async function deleteStressRecoveryEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('stress_recovery_entries').delete().eq('id', entryId)
  if (error) throw new Error('We could not delete your stress and recovery entry. Please try again.')
}

/**
 * Permanently deletes every stress/recovery entry for this user (for
 * future account-wide data deletion, matching every other feature's
 * deleteAll* function — not yet wired into
 * DataPrivacySection/useDataDeletion.ts; flagged as a follow-up in Stage
 * 3D's report). Blind bulk delete scoped by user_id; RLS's existing
 * delete policy is the actual enforcement boundary.
 */
export async function deleteAllStressRecoveryEntries(userId: string): Promise<void> {
  const { error } = await supabase.from('stress_recovery_entries').delete().eq('user_id', userId)
  if (error) throw new Error('We could not delete your stress and recovery entries. Please try again.')
}

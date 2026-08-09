import { supabase } from '@/lib/supabaseClient'
import type { SleepEntry, SleepQuality } from '@/features/sleepIntelligence/types'

interface SleepEntryRow {
  id: string
  entry_date: string
  bedtime: string | null
  wake_time: string | null
  duration_minutes: number | null
  quality: string | null
  note: string | null
  created_at: string
  updated_at: string
}

const ENTRY_COLUMNS = 'id, entry_date, bedtime, wake_time, duration_minutes, quality, note, created_at, updated_at'

/** Postgres `time` comes back as 'HH:MM:SS' — trimmed to 'HH:MM' for <input type="time">, same convention as reminderService.ts's reminder_time. */
function mapRow(row: SleepEntryRow): SleepEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    bedtime: row.bedtime ? row.bedtime.slice(0, 5) : null,
    wakeTime: row.wake_time ? row.wake_time.slice(0, 5) : null,
    durationMinutes: row.duration_minutes,
    quality: row.quality as SleepQuality | null,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface SleepEntriesRangeOptions {
  startDate?: string
  endDate?: string
}

export async function getSleepEntries(userId: string, range: SleepEntriesRangeOptions = {}): Promise<SleepEntry[]> {
  let query = supabase
    .from('sleep_entries')
    .select(ENTRY_COLUMNS)
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })

  if (range.startDate) query = query.gte('entry_date', range.startDate)
  if (range.endDate) query = query.lte('entry_date', range.endDate)

  const { data, error } = await query
  if (error) throw new Error('Unable to load your sleep entries. Please try again.')
  return (data ?? []).map(mapRow)
}

export interface SleepEntryInput {
  entryDate: string
  bedtime: string | null
  wakeTime: string | null
  durationMinutes: number | null
  quality: SleepQuality | null
  note: string | null
}

/**
 * One sleep record per calendar night — upserted by (user_id, entry_date)
 * exactly like checkinService.ts's saveTodayCheckIn(), so saving the same
 * date again (e.g. editing a past night from history) updates that same
 * row instead of erroring on the unique constraint.
 */
export async function saveSleepEntry(userId: string, input: SleepEntryInput): Promise<SleepEntry> {
  const { data, error } = await supabase
    .from('sleep_entries')
    .upsert(
      {
        user_id: userId,
        entry_date: input.entryDate,
        bedtime: input.bedtime,
        wake_time: input.wakeTime,
        duration_minutes: input.durationMinutes,
        quality: input.quality,
        note: input.note,
      },
      { onConflict: 'user_id,entry_date' },
    )
    .select(ENTRY_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your sleep entry. Please try again.')
  return mapRow(data)
}

export async function deleteSleepEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('sleep_entries').delete().eq('id', entryId)
  if (error) throw new Error('We could not delete your sleep entry. Please try again.')
}

/**
 * Permanently deletes every sleep entry for this user (for future
 * account-wide data deletion, matching every other feature's deleteAll*
 * function — not yet wired into DataPrivacySection/useDataDeletion.ts;
 * flagged as a follow-up in Stage 3B's report, same as Symptom Explorer's
 * deleteAllSymptomEntries in Stage 3A). Blind bulk delete scoped by
 * user_id; RLS's existing delete policy is the actual enforcement
 * boundary.
 */
export async function deleteAllSleepEntries(userId: string): Promise<void> {
  const { error } = await supabase.from('sleep_entries').delete().eq('user_id', userId)
  if (error) throw new Error('We could not delete your sleep entries. Please try again.')
}

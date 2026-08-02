import { supabase } from '@/lib/supabaseClient'
import type { JournalEntry } from '@/features/journal/types'

interface JournalEntryRow {
  id: string
  title: string
  content: string
  entry_date: string
  created_at: string
  updated_at: string
}

const JOURNAL_COLUMNS = 'id, title, content, entry_date, created_at, updated_at'

function mapRow(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    entryDate: row.entry_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface GetJournalEntriesOptions {
  limit: number
  offset: number
}

export async function getJournalEntries(
  userId: string,
  { limit, offset }: GetJournalEntriesOptions,
): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select(JOURNAL_COLUMNS)
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error('Unable to load your journal entries. Please try again.')
  return (data ?? []).map(mapRow)
}

/**
 * Lightweight query for dashboard use only — selects the entry_date of the
 * single most recent entry and nothing else. Journal title/content are
 * never selected here, so this card can never display or leak entry text.
 */
export async function getLatestJournalEntryDate(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('entry_date')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error('Unable to load your journal summary. Please try again.')
  return data ? data.entry_date : null
}

export interface JournalEntryInput {
  title: string
  content: string
  entryDate: string
}

export async function createJournalEntry(
  userId: string,
  input: JournalEntryInput,
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      title: input.title,
      content: input.content,
      entry_date: input.entryDate,
    })
    .select(JOURNAL_COLUMNS)
    .single()

  if (error) throw new Error('We could not save your journal entry. Please try again.')
  return mapRow(data)
}

export async function updateJournalEntry(
  entryId: string,
  input: JournalEntryInput,
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .update({
      title: input.title,
      content: input.content,
      entry_date: input.entryDate,
    })
    .eq('id', entryId)
    .select(JOURNAL_COLUMNS)
    .single()

  if (error) throw new Error('We could not update your journal entry. Please try again.')
  return mapRow(data)
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', entryId)
  if (error) throw new Error('We could not delete your journal entry. Please try again.')
}

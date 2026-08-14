import { supabase } from '@/lib/supabaseClient'
import type { AiSymptomJournalEntry, AiSymptomSeverity } from '@/features/aiIntelligence/types'

interface JournalRow {
  id: string
  conversation_id: string | null
  symptom: string
  severity: AiSymptomSeverity | null
  frequency: string | null
  duration: string | null
  location: string | null
  triggers: string[]
  associated_symptoms: string[]
  cycle_context: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

const JOURNAL_COLUMNS =
  'id, conversation_id, symptom, severity, frequency, duration, location, triggers, associated_symptoms, cycle_context, notes, created_at, updated_at'

function mapJournalEntry(row: JournalRow): AiSymptomJournalEntry {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    symptom: row.symptom,
    severity: row.severity,
    frequency: row.frequency,
    duration: row.duration,
    location: row.location,
    triggers: row.triggers ?? [],
    associatedSymptoms: row.associated_symptoms ?? [],
    cycleContext: row.cycle_context,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listJournalEntries(userId: string): Promise<AiSymptomJournalEntry[]> {
  const { data, error } = await supabase
    .from('ai_symptom_journal_entries')
    .select(JOURNAL_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Unable to load your symptom journal. Please try again.')
  return (data ?? []).map(mapJournalEntry)
}

export interface JournalEntryInput {
  conversationId: string | null
  symptom: string
  severity: AiSymptomSeverity | null
  notes: string | null
}

interface JournalRpcRow {
  id: string
  conversation_id: string | null
  symptom: string
  severity: AiSymptomSeverity | null
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Never called automatically — only in response to an explicit user
 * confirmation ("Yes, save this to my symptom journal"), matching Phase 0's
 * "never silently create a persistent medical record" rule. Calls
 * public.ai_save_symptom_journal_entry() (0030), which verifies
 * server-side that conversationId (when supplied) actually belongs to the
 * caller before inserting — a user can never link a journal entry to
 * another user's conversation. The RPC only covers the fields this form
 * uses (symptom/severity/notes/conversation); the fuller field set on the
 * table has no write path yet, since no UI exposes it.
 */
export async function createJournalEntry(input: JournalEntryInput): Promise<AiSymptomJournalEntry> {
  const { data, error } = await supabase
    .rpc('ai_save_symptom_journal_entry', {
      p_symptom: input.symptom.trim(),
      p_conversation_id: input.conversationId,
      p_severity: input.severity,
      p_notes: input.notes?.trim() || null,
    })
    .single<JournalRpcRow>()

  if (error) throw new Error('We could not save this to your symptom journal. Please try again.')
  return {
    id: data.id,
    conversationId: data.conversation_id,
    symptom: data.symptom,
    severity: data.severity,
    frequency: null,
    duration: null,
    location: null,
    triggers: [],
    associatedSymptoms: [],
    cycleContext: null,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('ai_symptom_journal_entries').delete().eq('id', entryId)
  if (error) throw new Error('We could not delete this journal entry. Please try again.')
}

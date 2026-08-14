import { supabase } from '@/lib/supabaseClient'
import type { AiMemoryItem } from '@/features/aiIntelligence/types'

interface MemoryRow {
  id: string
  memory_text: string
  source_conversation_id: string | null
  created_at: string
  updated_at: string
}

const MEMORY_COLUMNS = 'id, memory_text, source_conversation_id, created_at, updated_at'

function mapMemory(row: MemoryRow): AiMemoryItem {
  return {
    id: row.id,
    memoryText: row.memory_text,
    sourceConversationId: row.source_conversation_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listMemory(userId: string): Promise<AiMemoryItem[]> {
  const { data, error } = await supabase
    .from('ai_memory')
    .select(MEMORY_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Unable to load what SIRILA remembers. Please try again.')
  return (data ?? []).map(mapMemory)
}

/**
 * "Remember this" — only ever created by explicit user action, never
 * automatically. Calls public.ai_remember() (0030), which verifies
 * server-side that sourceConversationId (when supplied) actually belongs
 * to the caller before inserting — a user can never link a memory item to
 * another user's conversation. user_id is derived from auth.uid() inside
 * the function, never sent from here.
 */
export async function rememberThis(memoryText: string, sourceConversationId: string | null): Promise<AiMemoryItem> {
  const { data, error } = await supabase
    .rpc('ai_remember', {
      p_memory_text: memoryText.trim(),
      p_source_conversation_id: sourceConversationId,
    })
    .single<MemoryRow>()

  if (error) throw new Error('We could not save that to memory. Please try again.')
  return mapMemory(data)
}

/** "Forget this" — deletes a single remembered item. */
export async function forgetThis(memoryId: string): Promise<void> {
  const { error } = await supabase.from('ai_memory').delete().eq('id', memoryId)
  if (error) throw new Error('We could not forget that item. Please try again.')
}

/** Clears every remembered item for this user — a distinct, explicit bulk action. */
export async function clearAllMemory(userId: string): Promise<void> {
  const { error } = await supabase.from('ai_memory').delete().eq('user_id', userId)
  if (error) throw new Error('We could not clear your SIRILA memory. Please try again.')
}

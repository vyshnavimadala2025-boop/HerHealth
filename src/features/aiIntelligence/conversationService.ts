import { supabase } from '@/lib/supabaseClient'
import type {
  AiCapability,
  AiConversation,
  AiConversationStatus,
  AiMessage,
  AiSafetyTier,
} from '@/features/aiIntelligence/types'

interface ConversationRow {
  id: string
  title: string | null
  capability: AiCapability
  status: AiConversationStatus
  memory_enabled: boolean
  created_at: string
  updated_at: string
}

interface MessageRow {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  safety_tier: AiSafetyTier | null
  model_used: string | null
  created_at: string
}

const CONVERSATION_COLUMNS = 'id, title, capability, status, memory_enabled, created_at, updated_at'
const MESSAGE_COLUMNS = 'id, conversation_id, role, content, safety_tier, model_used, created_at'

function mapConversation(row: ConversationRow): AiConversation {
  return {
    id: row.id,
    title: row.title,
    capability: row.capability,
    status: row.status,
    memoryEnabled: row.memory_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapMessage(row: MessageRow): AiMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    safetyTier: row.safety_tier,
    modelUsed: row.model_used,
    createdAt: row.created_at,
  }
}

export async function listConversations(userId: string): Promise<AiConversation[]> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select(CONVERSATION_COLUMNS)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error('Unable to load your SIRILA Intelligence conversations. Please try again.')
  return (data ?? []).map(mapConversation)
}

export async function createConversation(
  userId: string,
  capability: AiCapability,
  memoryEnabled: boolean,
): Promise<AiConversation> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userId, capability, memory_enabled: memoryEnabled })
    .select(CONVERSATION_COLUMNS)
    .single()

  if (error) throw new Error('We could not start a new conversation. Please try again.')
  return mapConversation(data)
}

export async function getConversation(conversationId: string): Promise<AiConversation | null> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select(CONVERSATION_COLUMNS)
    .eq('id', conversationId)
    .maybeSingle()

  if (error) throw new Error('Unable to load this conversation. Please try again.')
  return data ? mapConversation(data) : null
}

export async function renameConversation(conversationId: string, title: string): Promise<AiConversation> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .update({ title: title.trim() || null })
    .eq('id', conversationId)
    .select(CONVERSATION_COLUMNS)
    .single()

  if (error) throw new Error('We could not rename this conversation. Please try again.')
  return mapConversation(data)
}

export async function setConversationStatus(
  conversationId: string,
  status: AiConversationStatus,
): Promise<AiConversation> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .update({ status })
    .eq('id', conversationId)
    .select(CONVERSATION_COLUMNS)
    .single()

  if (error) throw new Error('We could not update this conversation. Please try again.')
  return mapConversation(data)
}

/** Hard delete — cascades to ai_messages and ai_feedback; ai_symptom_journal_entries/ai_safety_events survive (see 0028). */
export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase.from('ai_conversations').delete().eq('id', conversationId)
  if (error) throw new Error('We could not delete this conversation. Please try again.')
}

export async function getMessages(conversationId: string): Promise<AiMessage[]> {
  const { data, error } = await supabase
    .from('ai_messages')
    .select(MESSAGE_COLUMNS)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw new Error('Unable to load messages for this conversation. Please try again.')
  return (data ?? []).map(mapMessage)
}

export interface SendMessageResult {
  userMessage: AiMessage
  assistantMessage: AiMessage
  safetyTier: AiSafetyTier
  emergencyOverride: boolean
}

interface SendMessageRpcRow {
  user_message_id: string
  assistant_message_id: string
  assistant_content: string
  safety_tier: AiSafetyTier
  emergency_override: boolean
}

/**
 * Calls public.ai_send_message() (0029) — the only write path for a
 * conversation turn. p_assistant_content is a client-generated MOCK reply
 * (see aiProviderAbstraction.ts); the server independently re-classifies
 * the user's own input and will discard this content in favor of a fixed
 * placeholder if it finds an emergency-tier pattern, regardless of what is
 * sent here. Supports cancellation via `signal` — see useConversation.ts
 * for the honest caveat about what "stop" can and cannot guarantee once
 * the request has reached the server.
 */
export async function sendMessage(
  conversationId: string,
  userContent: string,
  assistantContent: string,
  modelUsed: string,
  signal?: AbortSignal,
): Promise<SendMessageResult> {
  let query = supabase.rpc('ai_send_message', {
    p_conversation_id: conversationId,
    p_user_content: userContent,
    p_assistant_content: assistantContent,
    p_model_used: modelUsed,
  })
  if (signal) query = query.abortSignal(signal)

  const { data, error } = await query.single<SendMessageRpcRow>()

  if (error) {
    if (error.hint === 'rate_limit') {
      throw new Error("You've reached today's SIRILA Intelligence message limit. Please try again tomorrow.")
    }
    throw new Error('SIRILA could not send your message. Please try again.')
  }

  const now = new Date().toISOString()
  return {
    userMessage: {
      id: data.user_message_id,
      conversationId,
      role: 'user',
      content: userContent,
      safetyTier: data.safety_tier,
      modelUsed: null,
      createdAt: now,
    },
    assistantMessage: {
      id: data.assistant_message_id,
      conversationId,
      role: 'assistant',
      content: data.assistant_content,
      safetyTier: data.safety_tier,
      modelUsed,
      createdAt: now,
    },
    safetyTier: data.safety_tier,
    emergencyOverride: data.emergency_override,
  }
}

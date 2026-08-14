import { supabase } from '@/lib/supabaseClient'
import type { AiFeedbackInput } from '@/features/aiIntelligence/types'

/**
 * Calls public.ai_submit_feedback() (0030) — the only write path into
 * ai_feedback. The RPC verifies server-side that the caller owns both the
 * conversation and the message before inserting, so a user can never
 * attach feedback to another user's conversation/message even if they
 * knew its id. user_id is derived from auth.uid() inside the function,
 * never sent from here.
 */
export async function submitAiFeedback(input: AiFeedbackInput): Promise<void> {
  const { error } = await supabase.rpc('ai_submit_feedback', {
    p_conversation_id: input.conversationId,
    p_message_id: input.messageId,
    p_rating: input.rating,
    p_reason: input.reason,
  })

  if (error) throw new Error('We could not save your feedback. Please try again.')
}

import { supabase } from '@/lib/supabaseClient'
import type { FeedbackSubmissionInput } from '@/features/feedback/types'

/**
 * Direct insert, protected by RLS ("Users can create own feedback",
 * auth.uid() = user_id — see 0027_admin_feedback.sql), same pattern as
 * every other user-facing write in this app. There is no admin bypass on
 * the insert path — users can only ever create their own feedback row.
 */
export async function submitFeedback(userId: string, input: FeedbackSubmissionInput): Promise<void> {
  const { error } = await supabase.from('feedback_submissions').insert({
    user_id: userId,
    type: input.type,
    description: input.description.trim(),
    category: input.category,
  })

  if (error) throw new Error('We could not submit your feedback. Please try again.')
}

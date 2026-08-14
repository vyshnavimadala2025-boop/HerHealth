import { useState } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/useAuth'
import { submitAiFeedback } from '@/features/aiIntelligence/aiFeedbackService'
import { AI_FEEDBACK_REASON_OPTIONS } from '@/features/aiIntelligence/constants'
import type { AiFeedbackRating, AiFeedbackReason } from '@/features/aiIntelligence/types'

interface ResponseFeedbackProps {
  conversationId: string
  messageId: string
}

/** Helpful / Not Helpful — never forced; the user can simply not click either. */
function ResponseFeedback({ conversationId, messageId }: ResponseFeedbackProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState<AiFeedbackRating | null>(null)
  const [showReasons, setShowReasons] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (nextRating: AiFeedbackRating, reason: AiFeedbackReason | null) => {
    if (!user || submitting) return
    setSubmitting(true)
    try {
      await submitAiFeedback({ conversationId, messageId, rating: nextRating, reason })
      setRating(nextRating)
      setShowReasons(false)
      toast.success('Thanks for the feedback.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (rating) {
    return <p className="text-caption text-muted-foreground">Thanks — you marked this as {rating === 'helpful' ? 'helpful' : 'not helpful'}.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Mark as helpful"
          disabled={submitting}
          onClick={() => submit('helpful', null)}
        >
          <ThumbsUp className="size-3.5" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Mark as not helpful"
          disabled={submitting}
          onClick={() => setShowReasons(true)}
        >
          <ThumbsDown className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      {showReasons && (
        <div className="flex flex-wrap gap-1.5">
          {AI_FEEDBACK_REASON_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={submitting}
              onClick={() => submit('not_helpful', option.value as AiFeedbackReason)}
              className="rounded-full border border-border px-2.5 py-1 text-caption text-muted-foreground hover:border-primary hover:text-foreground"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ResponseFeedback

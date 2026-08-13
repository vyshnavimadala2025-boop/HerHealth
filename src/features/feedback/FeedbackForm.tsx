import { useState, type FormEvent } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/features/auth/useAuth'
import { submitFeedback } from '@/features/feedback/feedbackService'
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_DESCRIPTION_MAX_LENGTH,
  FEEDBACK_TYPES,
  type FeedbackCategory,
  type FeedbackType,
} from '@/features/feedback/types'

function FeedbackForm() {
  const { user } = useAuth()
  const [type, setType] = useState<FeedbackType>('bug')
  const [category, setCategory] = useState<string>('')
  const [description, setDescription] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isSubmitting || !user) return

    const trimmed = description.trim()
    if (!trimmed) {
      setFieldError('Please describe your feedback.')
      return
    }
    if (trimmed.length > FEEDBACK_DESCRIPTION_MAX_LENGTH) {
      setFieldError(`Please keep your feedback under ${FEEDBACK_DESCRIPTION_MAX_LENGTH} characters.`)
      return
    }
    setFieldError(null)

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    try {
      await submitFeedback(user.id, {
        type,
        description: trimmed,
        category: category ? (category as FeedbackCategory) : null,
      })
      setSubmitSuccess(true)
      setDescription('')
      setCategory('')
      setType('bug')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">What kind of feedback is this?</legend>
        <RadioGroup value={type} onValueChange={(value) => setType(value as FeedbackType)} className="gap-2">
          {FEEDBACK_TYPES.map((option) => (
            <label key={option.value} className="flex min-h-11 items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-sm has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent/40">
              <RadioGroupItem value={option.value} id={`feedback-type-${option.value}`} />
              {option.label}
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-category">Related feature (optional)</Label>
        <select
          id="feedback-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="border-input h-9 rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Not specific to a feature</option>
          {FEEDBACK_CATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-description">Tell us more</Label>
        <Textarea
          id="feedback-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          maxLength={FEEDBACK_DESCRIPTION_MAX_LENGTH}
          aria-invalid={!!fieldError}
          aria-describedby={fieldError ? 'feedback-description-error' : 'feedback-description-hint'}
          placeholder="What happened, or what would you like to see?"
        />
        <p id="feedback-description-hint" className="text-caption text-muted-foreground">
          {description.length}/{FEEDBACK_DESCRIPTION_MAX_LENGTH}
        </p>
        {fieldError && (
          <p id="feedback-description-error" role="alert" className="text-caption text-destructive">
            {fieldError}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-dashed border-border p-3 text-caption text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Please don&rsquo;t include passwords, medical information, or other sensitive personal information in your
          feedback.
        </p>
      </div>

      {submitError && (
        <p role="alert" className="text-caption text-destructive">
          {submitError}
        </p>
      )}
      {submitSuccess && (
        <p role="status" className="text-caption text-primary">
          Thank you — your feedback has been submitted.
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
        {isSubmitting ? 'Submitting…' : 'Submit feedback'}
      </Button>
    </form>
  )
}

export default FeedbackForm

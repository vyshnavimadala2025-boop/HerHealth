import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  GOAL_CATEGORIES,
  NOTE_MAX_LENGTH,
  TARGET_PERIODS,
  TITLE_MAX_LENGTH,
  getLocalDateString,
  type GoalCategory,
  type TargetPeriod,
  type WellnessGoal,
} from '@/features/goals/types'
import type { GoalInput } from '@/features/goals/goalService'

interface FieldErrors {
  title?: string
  note?: string
  targetCount?: string
  startDate?: string
  targetDate?: string
}

interface GoalFormProps {
  editingGoal: WellnessGoal | null
  /** Pre-selected category for a brand-new goal (e.g. Recovery Planner passes 'recovery') — ignored while editing, where the goal's own category always wins. Defaults to 'custom', preserving the Goals page's existing behavior exactly. */
  defaultCategory?: GoalCategory
  onCreate: (input: GoalInput) => Promise<WellnessGoal>
  onUpdate: (id: string, input: GoalInput) => Promise<WellnessGoal>
  onSaved: () => void
  onCancelEdit: () => void
}

function GoalForm({ editingGoal, defaultCategory = 'custom', onCreate, onUpdate, onSaved, onCancelEdit }: GoalFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<GoalCategory>(defaultCategory)
  const [note, setNote] = useState('')
  const [targetCount, setTargetCount] = useState('')
  const [targetPeriod, setTargetPeriod] = useState<TargetPeriod | ''>('')
  const [startDate, setStartDate] = useState(getLocalDateString())
  const [targetDate, setTargetDate] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title)
      setCategory(editingGoal.category)
      setNote(editingGoal.note ?? '')
      setTargetCount(editingGoal.targetCount != null ? String(editingGoal.targetCount) : '')
      setTargetPeriod(editingGoal.targetPeriod ?? '')
      setStartDate(editingGoal.startDate)
      setTargetDate(editingGoal.targetDate ?? '')
    } else {
      setTitle('')
      setCategory(defaultCategory)
      setNote('')
      setTargetCount('')
      setTargetPeriod('')
      setStartDate(getLocalDateString())
      setTargetDate('')
    }
    setErrors({})
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingGoal, defaultCategory])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isSavingRef.current) return

    const trimmedTitle = title.trim()
    const trimmedNote = note.trim()
    const nextErrors: FieldErrors = {}

    if (!trimmedTitle) {
      nextErrors.title = 'Title is required'
    } else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      nextErrors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer`
    }
    if (trimmedNote.length > NOTE_MAX_LENGTH) {
      nextErrors.note = `Note must be ${NOTE_MAX_LENGTH} characters or fewer`
    }

    let parsedTargetCount: number | null = null
    if (targetCount.trim()) {
      const parsed = Number(targetCount)
      if (!Number.isInteger(parsed) || parsed <= 0) {
        nextErrors.targetCount = 'Target must be a whole number greater than 0'
      } else {
        parsedTargetCount = parsed
      }
    }

    if (!startDate) {
      nextErrors.startDate = 'Start date is required'
    }
    if (targetDate && startDate && targetDate < startDate) {
      nextErrors.targetDate = 'Target date cannot be before the start date'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const input: GoalInput = {
        title: trimmedTitle,
        category,
        note: trimmedNote ? trimmedNote : null,
        targetCount: parsedTargetCount,
        targetPeriod: parsedTargetCount ? targetPeriod || null : null,
        startDate,
        targetDate: targetDate ? targetDate : null,
      }
      if (editingGoal) {
        await onUpdate(editingGoal.id, input)
      } else {
        await onCreate(input)
      }
      setSaveSuccess(true)
      onSaved()

      if (!editingGoal) {
        setTitle('')
        setCategory(defaultCategory)
        setNote('')
        setTargetCount('')
        setTargetPeriod('')
        setStartDate(getLocalDateString())
        setTargetDate('')
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  const isEditing = !!editingGoal

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Target className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>{isEditing ? 'Edit Wellness Goal' : 'Add a Wellness Goal'}</CardTitle>
        </div>
        <CardDescription>
          This is a personal wellness routine and self-tracking tool, not a medical treatment
          plan. You can adjust this goal at any time.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-title">Title</Label>
            <Input
              id="goal-title"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'goal-title-error' : undefined}
            />
            {errors.title && (
              <p id="goal-title-error" className="text-caption text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Category</span>
            <RadioGroup
              value={category}
              onValueChange={(value) => setCategory(value as GoalCategory)}
              className="flex flex-col gap-2"
            >
              {GOAL_CATEGORIES.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`goal-category-${option.value}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5 text-sm transition-colors',
                    category === option.value && 'border-primary bg-accent/40',
                  )}
                >
                  <RadioGroupItem id={`goal-category-${option.value}`} value={option.value} />
                  {option.label}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-note">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="goal-note"
              value={note}
              maxLength={NOTE_MAX_LENGTH}
              onChange={(event) => setNote(event.target.value)}
              aria-invalid={!!errors.note}
              aria-describedby={errors.note ? 'goal-note-error' : 'goal-note-count'}
            />
            <div className="flex items-center justify-between">
              {errors.note ? (
                <p id="goal-note-error" className="text-caption text-destructive">
                  {errors.note}
                </p>
              ) : (
                <span />
              )}
              <p id="goal-note-count" className="text-caption text-muted-foreground">
                {note.length}/{NOTE_MAX_LENGTH}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-target-count">
                Target <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="goal-target-count"
                type="number"
                min={1}
                step={1}
                value={targetCount}
                onChange={(event) => setTargetCount(event.target.value)}
                aria-invalid={!!errors.targetCount}
                aria-describedby={errors.targetCount ? 'goal-target-count-error' : undefined}
              />
              {errors.targetCount && (
                <p id="goal-target-count-error" className="text-caption text-destructive">
                  {errors.targetCount}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-target-period">
                Frequency <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <select
                id="goal-target-period"
                value={targetPeriod}
                onChange={(event) => setTargetPeriod(event.target.value as TargetPeriod | '')}
                disabled={!targetCount.trim()}
                className="border-input h-9 w-full rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">One-time target</option>
                {TARGET_PERIODS.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-start-date">Start date</Label>
              <Input
                id="goal-start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                aria-invalid={!!errors.startDate}
                aria-describedby={errors.startDate ? 'goal-start-date-error' : undefined}
              />
              {errors.startDate && (
                <p id="goal-start-date-error" className="text-caption text-destructive">
                  {errors.startDate}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-target-date">
                Target date <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="goal-target-date"
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
                aria-invalid={!!errors.targetDate}
                aria-describedby={errors.targetDate ? 'goal-target-date-error' : undefined}
              />
              {errors.targetDate && (
                <p id="goal-target-date-error" className="text-caption text-destructive">
                  {errors.targetDate}
                </p>
              )}
            </div>
          </div>

          {saveError && (
            <p role="alert" className="text-caption text-destructive">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p role="status" className="text-caption text-primary">
              {isEditing ? 'Goal updated.' : 'Goal saved.'}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSaving ? 'Saving…' : isEditing ? 'Update Goal' : 'Save Goal'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default GoalForm

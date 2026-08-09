import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import {
  NOTE_MAX_LENGTH,
  SCREENING_CATEGORY_OPTIONS,
  TITLE_MAX_LENGTH,
  type ScreeningCategory,
  type ScreeningItem,
} from '@/features/screeningPlanner/types'
import type { ScreeningItemInput } from '@/features/screeningPlanner/screeningService'
import { cn } from '@/lib/utils'

interface FieldErrors {
  title?: string
  note?: string
}

interface ScreeningItemFormProps {
  editingItem: ScreeningItem | null
  onCreate: (input: ScreeningItemInput) => Promise<ScreeningItem>
  onUpdate: (id: string, input: ScreeningItemInput) => Promise<ScreeningItem>
  onSaved: () => void
  onCancelEdit: () => void
}

function ScreeningItemForm({ editingItem, onCreate, onUpdate, onSaved, onCancelEdit }: ScreeningItemFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ScreeningCategory | null>(null)
  const [plannedDate, setPlannedDate] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title)
      setCategory(editingItem.category)
      setPlannedDate(editingItem.plannedDate ?? '')
      setNote(editingItem.note ?? '')
    } else {
      setTitle('')
      setCategory(null)
      setPlannedDate('')
      setNote('')
    }
    setErrors({})
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingItem])

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
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const input: ScreeningItemInput = {
        title: trimmedTitle,
        category,
        plannedDate: plannedDate ? plannedDate : null,
        note: trimmedNote ? trimmedNote : null,
      }
      if (editingItem) {
        await onUpdate(editingItem.id, input)
      } else {
        await onCreate(input)
      }
      setSaveSuccess(true)
      onSaved()

      if (!editingItem) {
        setTitle('')
        setCategory(null)
        setPlannedDate('')
        setNote('')
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  const isEditing = !!editingItem

  return (
    <Card id="new-screening-plan" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>{isEditing ? 'Edit Screening Plan' : 'Add a Screening Plan'}</CardTitle>
        </div>
        <CardDescription>
          Everything below is your own personal planning record — nothing here has been medically verified. This is
          not a medical determination of whether a screening is required.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="screening-title">Title</Label>
            <Input
              id="screening-title"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              placeholder="e.g. Annual check-up"
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'screening-title-error' : undefined}
            />
            {errors.title && (
              <p id="screening-title-error" className="text-caption text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span id="screening-category-label" className="text-sm font-medium">
              Category <span className="font-normal text-muted-foreground">(optional, for organization only)</span>
            </span>
            <RadioGroup
              aria-labelledby="screening-category-label"
              value={category ?? ''}
              onValueChange={(value) => setCategory(value ? (value as ScreeningCategory) : null)}
              className="flex flex-col gap-2"
            >
              {SCREENING_CATEGORY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`screening-category-${option.value}`}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5 text-sm transition-colors',
                    category === option.value && 'border-primary bg-accent/40',
                  )}
                >
                  <RadioGroupItem id={`screening-category-${option.value}`} value={option.value} />
                  {option.label}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="screening-planned-date">
              Planned date <span className="font-normal text-muted-foreground">(optional, user-entered)</span>
            </Label>
            <Input
              id="screening-planned-date"
              type="date"
              value={plannedDate}
              onChange={(event) => setPlannedDate(event.target.value)}
              className="max-w-48"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="screening-note">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="screening-note"
              value={note}
              maxLength={NOTE_MAX_LENGTH}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional — provider, location, or any context in your own words"
              aria-invalid={!!errors.note}
              aria-describedby={errors.note ? 'screening-note-error' : 'screening-note-count'}
            />
            <div className="flex items-center justify-between">
              {errors.note ? (
                <p id="screening-note-error" className="text-caption text-destructive">
                  {errors.note}
                </p>
              ) : (
                <span />
              )}
              <p id="screening-note-count" className="text-caption text-muted-foreground">
                {note.length}/{NOTE_MAX_LENGTH}
              </p>
            </div>
          </div>

          {saveError && (
            <p role="alert" className="text-caption text-destructive">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p role="status" className="text-caption text-primary">
              {isEditing ? 'Screening plan updated.' : 'Screening plan saved.'}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {isEditing && (
            <Button type="button" variant="outline" className="flex-1" onClick={onCancelEdit} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSaving ? 'Saving…' : isEditing ? 'Update Plan' : 'Save Plan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default ScreeningItemForm

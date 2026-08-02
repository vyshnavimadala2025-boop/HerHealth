import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  CONTENT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  getLocalDateString,
  type JournalEntry,
} from '@/features/journal/types'
import type { JournalEntryInput } from '@/features/journal/journalService'

interface FieldErrors {
  entryDate?: string
  title?: string
  content?: string
}

interface JournalEntryFormProps {
  editingEntry: JournalEntry | null
  onCreate: (input: JournalEntryInput) => Promise<JournalEntry>
  onUpdate: (id: string, input: JournalEntryInput) => Promise<JournalEntry>
  onSaved: () => void
  onCancelEdit: () => void
}

function JournalEntryForm({
  editingEntry,
  onCreate,
  onUpdate,
  onSaved,
  onCancelEdit,
}: JournalEntryFormProps) {
  const [entryDate, setEntryDate] = useState(getLocalDateString())
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingEntry) {
      setEntryDate(editingEntry.entryDate)
      setTitle(editingEntry.title)
      setContent(editingEntry.content)
    } else {
      setEntryDate(getLocalDateString())
      setTitle('')
      setContent('')
    }
    setErrors({})
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingEntry])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isSavingRef.current) return

    const today = getLocalDateString()
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    const nextErrors: FieldErrors = {}
    if (!entryDate) {
      nextErrors.entryDate = 'Entry date is required'
    } else if (entryDate > today) {
      nextErrors.entryDate = 'Entry date cannot be in the future'
    }
    if (!trimmedTitle) {
      nextErrors.title = 'Title is required'
    } else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      nextErrors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer`
    }
    if (!trimmedContent) {
      nextErrors.content = 'Journal content is required'
    } else if (trimmedContent.length > CONTENT_MAX_LENGTH) {
      nextErrors.content = `Journal content must be ${CONTENT_MAX_LENGTH} characters or fewer`
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const input: JournalEntryInput = { title: trimmedTitle, content: trimmedContent, entryDate }
      if (editingEntry) {
        await onUpdate(editingEntry.id, input)
      } else {
        await onCreate(input)
      }
      setSaveSuccess(true)
      onSaved()

      if (!editingEntry) {
        setEntryDate(getLocalDateString())
        setTitle('')
        setContent('')
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  const isEditing = !!editingEntry

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Journal Entry' : 'Write a Journal Entry'}</CardTitle>
        <CardDescription>
          Your journal entries are private personal records and are not analyzed for medical
          purposes.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="journal-date">Entry date</Label>
            <Input
              id="journal-date"
              type="date"
              value={entryDate}
              max={getLocalDateString()}
              onChange={(event) => setEntryDate(event.target.value)}
              aria-invalid={!!errors.entryDate}
              aria-describedby={errors.entryDate ? 'journal-date-error' : undefined}
            />
            {errors.entryDate && (
              <p id="journal-date-error" className="text-caption text-destructive">
                {errors.entryDate}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="journal-title">Title</Label>
            <Input
              id="journal-title"
              type="text"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'journal-title-error' : 'journal-title-count'}
            />
            <div className="flex items-center justify-between">
              {errors.title ? (
                <p id="journal-title-error" className="text-caption text-destructive">
                  {errors.title}
                </p>
              ) : (
                <span />
              )}
              <p id="journal-title-count" className="text-caption text-muted-foreground">
                {title.length}/{TITLE_MAX_LENGTH}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="journal-content">Journal entry</Label>
            <Textarea
              id="journal-content"
              value={content}
              maxLength={CONTENT_MAX_LENGTH}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-32"
              aria-invalid={!!errors.content}
              aria-describedby={errors.content ? 'journal-content-error' : 'journal-content-count'}
            />
            <div className="flex items-center justify-between">
              {errors.content ? (
                <p id="journal-content-error" className="text-caption text-destructive">
                  {errors.content}
                </p>
              ) : (
                <span />
              )}
              <p id="journal-content-count" className="text-caption text-muted-foreground">
                {content.length}/{CONTENT_MAX_LENGTH}
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
              {isEditing ? 'Journal entry updated.' : 'Journal entry saved.'}
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
            {isSaving ? 'Saving…' : isEditing ? 'Update Entry' : 'Save Entry'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default JournalEntryForm

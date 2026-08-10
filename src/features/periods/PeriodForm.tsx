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
import { createPeriodRecord, updatePeriodRecord } from '@/features/periods/periodService'
import { NOTE_MAX_LENGTH, type PeriodRecord } from '@/features/periods/types'
import { getLocalDateString } from '@/features/periods/dateUtils'

interface FieldErrors {
  startDate?: string
  endDate?: string
}

interface PeriodFormProps {
  userId: string
  editingRecord: PeriodRecord | null
  onSaved: (record: PeriodRecord) => void
  onCancelEdit: () => void
}

function PeriodForm({ userId, editingRecord, onSaved, onCancelEdit }: PeriodFormProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingRecord) {
      setStartDate(editingRecord.startDate)
      setEndDate(editingRecord.endDate ?? '')
      setNote(editingRecord.note ?? '')
    } else {
      setStartDate('')
      setEndDate('')
      setNote('')
    }
    setErrors({})
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingRecord])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isSavingRef.current) return

    const today = getLocalDateString()
    const nextErrors: FieldErrors = {}
    if (!startDate) {
      nextErrors.startDate = 'Start date is required'
    } else if (startDate > today) {
      nextErrors.startDate = 'Start date cannot be in the future'
    }
    if (endDate) {
      if (endDate > today) {
        nextErrors.endDate = 'End date cannot be in the future'
      } else if (startDate && endDate < startDate) {
        nextErrors.endDate = 'End date cannot be before the start date'
      }
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const trimmedNote = note.trim().slice(0, NOTE_MAX_LENGTH)
      const input = {
        startDate,
        endDate: endDate || null,
        note: trimmedNote ? trimmedNote : null,
      }
      const saved = editingRecord
        ? await updatePeriodRecord(editingRecord.id, input)
        : await createPeriodRecord(userId, input)

      setSaveSuccess(true)
      onSaved(saved)

      if (!editingRecord) {
        setStartDate('')
        setEndDate('')
        setNote('')
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  const isEditing = !!editingRecord

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Period' : 'Add a Period'}</CardTitle>
        <CardDescription>
          HerHealth supports personal cycle tracking and does not provide medical diagnosis.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="period-start">Period start date</Label>
            <Input
              id="period-start"
              type="date"
              value={startDate}
              max={getLocalDateString()}
              onChange={(event) => setStartDate(event.target.value)}
              aria-invalid={!!errors.startDate}
              aria-describedby={errors.startDate ? 'period-start-error' : undefined}
            />
            {errors.startDate && (
              <p id="period-start-error" className="text-caption text-destructive">
                {errors.startDate}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="period-end">
              Period end date <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="period-end"
              type="date"
              value={endDate}
              max={getLocalDateString()}
              onChange={(event) => setEndDate(event.target.value)}
              aria-invalid={!!errors.endDate}
              aria-describedby={errors.endDate ? 'period-end-error' : undefined}
            />
            {errors.endDate && (
              <p id="period-end-error" className="text-caption text-destructive">
                {errors.endDate}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="period-note">Note</Label>
            <Textarea
              id="period-note"
              value={note}
              maxLength={NOTE_MAX_LENGTH}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
            />
            <p className="text-caption text-muted-foreground text-right">
              {note.length}/{NOTE_MAX_LENGTH}
            </p>
          </div>

          {saveError && (
            <p role="alert" className="text-caption text-destructive">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p role="status" className="text-caption text-primary">
              {isEditing ? 'Period updated.' : 'Period saved.'}
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
            {isSaving ? 'Saving period…' : isEditing ? 'Update Period' : 'Save Period'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default PeriodForm

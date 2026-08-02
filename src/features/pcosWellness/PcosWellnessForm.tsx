import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
  NOTE_MAX_LENGTH,
  OBSERVATION_OPTIONS,
  getLocalDateString,
  type PcosObservation,
  type PcosWellnessEntry,
} from '@/features/pcosWellness/types'
import type { PcosWellnessEntryInput } from '@/features/pcosWellness/pcosWellnessService'
import { cn } from '@/lib/utils'

interface FieldErrors {
  entryDate?: string
  note?: string
}

interface PcosWellnessFormProps {
  editingEntry: PcosWellnessEntry | null
  onCreate: (input: PcosWellnessEntryInput) => Promise<PcosWellnessEntry>
  onUpdate: (id: string, input: PcosWellnessEntryInput) => Promise<PcosWellnessEntry>
  onSaved: () => void
  onCancelEdit: () => void
}

function PcosWellnessForm({
  editingEntry,
  onCreate,
  onUpdate,
  onSaved,
  onCancelEdit,
}: PcosWellnessFormProps) {
  const [entryDate, setEntryDate] = useState(getLocalDateString())
  const [observations, setObservations] = useState<PcosObservation[]>([])
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingEntry) {
      setEntryDate(editingEntry.entryDate)
      setObservations(editingEntry.observations)
      setNote(editingEntry.note ?? '')
    } else {
      setEntryDate(getLocalDateString())
      setObservations([])
      setNote('')
    }
    setErrors({})
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingEntry])

  const toggleObservation = (value: PcosObservation) => {
    setObservations((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isSavingRef.current) return

    const today = getLocalDateString()
    const trimmedNote = note.trim()
    const nextErrors: FieldErrors = {}
    if (!entryDate) {
      nextErrors.entryDate = 'Entry date is required'
    } else if (entryDate > today) {
      nextErrors.entryDate = 'Entry date cannot be in the future'
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
      const input: PcosWellnessEntryInput = {
        entryDate,
        observations,
        note: trimmedNote ? trimmedNote : null,
      }
      if (editingEntry) {
        await onUpdate(editingEntry.id, input)
      } else {
        await onCreate(input)
      }
      setSaveSuccess(true)
      onSaved()

      if (!editingEntry) {
        setEntryDate(getLocalDateString())
        setObservations([])
        setNote('')
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
        <CardTitle>{isEditing ? 'Edit Wellness Entry' : 'Add a Wellness Entry'}</CardTitle>
        <CardDescription>
          HerHealth records the information you choose to enter. It does not diagnose PCOS, PCOD,
          or any other medical condition.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pcos-entry-date">Entry date</Label>
            <Input
              id="pcos-entry-date"
              type="date"
              value={entryDate}
              max={getLocalDateString()}
              onChange={(event) => setEntryDate(event.target.value)}
              aria-invalid={!!errors.entryDate}
              aria-describedby={errors.entryDate ? 'pcos-entry-date-error' : undefined}
            />
            {errors.entryDate && (
              <p id="pcos-entry-date-error" className="text-caption text-destructive">
                {errors.entryDate}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Observations <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {OBSERVATION_OPTIONS.map((option) => {
                const checked = observations.includes(option.value)
                return (
                  <label
                    key={option.value}
                    htmlFor={`pcos-observation-${option.value}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors hover:bg-muted/50',
                      checked ? 'border-primary bg-accent/40' : 'border-border',
                    )}
                  >
                    <Checkbox
                      id={`pcos-observation-${option.value}`}
                      checked={checked}
                      onCheckedChange={() => toggleObservation(option.value)}
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pcos-note">Note</Label>
            <Textarea
              id="pcos-note"
              value={note}
              maxLength={NOTE_MAX_LENGTH}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              aria-invalid={!!errors.note}
              aria-describedby={errors.note ? 'pcos-note-error' : 'pcos-note-count'}
            />
            <div className="flex items-center justify-between">
              {errors.note ? (
                <p id="pcos-note-error" className="text-caption text-destructive">
                  {errors.note}
                </p>
              ) : (
                <span />
              )}
              <p id="pcos-note-count" className="text-caption text-muted-foreground">
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
              {isEditing ? 'Wellness entry updated.' : 'Wellness entry saved.'}
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

export default PcosWellnessForm

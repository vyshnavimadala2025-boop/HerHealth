import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import {
  NOTE_MAX_LENGTH,
  SEVERITY_OPTIONS,
  SYMPTOM_OPTIONS,
  TIMING_OPTIONS,
  type SeverityValue,
  type SymptomEntry,
  type SymptomValue,
  type TimingValue,
} from '@/features/symptomExplorer/types'
import type { SymptomEntryInput } from '@/features/symptomExplorer/symptomService'
import { getLocalDateString } from '@/features/periods/dateUtils'
import { cn } from '@/lib/utils'

interface FieldErrors {
  entryDate?: string
  symptoms?: string
  note?: string
}

interface SymptomEntryFormProps {
  editingEntry: SymptomEntry | null
  selectedSymptoms: SymptomValue[]
  onToggleSymptom: (value: SymptomValue) => void
  onCreate: (input: SymptomEntryInput) => Promise<SymptomEntry>
  onUpdate: (id: string, input: SymptomEntryInput) => Promise<SymptomEntry>
  onSaved: () => void
  onCancelEdit: () => void
}

function SymptomEntryForm({
  editingEntry,
  selectedSymptoms,
  onToggleSymptom,
  onCreate,
  onUpdate,
  onSaved,
  onCancelEdit,
}: SymptomEntryFormProps) {
  const [entryDate, setEntryDate] = useState(getLocalDateString())
  const [severity, setSeverity] = useState<SeverityValue | null>(null)
  const [timing, setTiming] = useState<TimingValue | null>(null)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingEntry) {
      setEntryDate(editingEntry.entryDate)
      setSeverity(editingEntry.severity)
      setTiming(editingEntry.timing)
      setNote(editingEntry.note ?? '')
    } else {
      setEntryDate(getLocalDateString())
      setSeverity(null)
      setTiming(null)
      setNote('')
    }
    setErrors({})
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingEntry])

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
    if (selectedSymptoms.length === 0) {
      nextErrors.symptoms = 'Select at least one symptom from the library above'
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
      const input: SymptomEntryInput = {
        entryDate,
        symptoms: selectedSymptoms,
        severity,
        timing,
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
        setSeverity(null)
        setTiming(null)
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
    <Card id="symptom-entry-form" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Symptom Entry' : 'Record a Symptom Entry'}</CardTitle>
        <CardDescription>
          This records what you choose to enter. It does not diagnose any condition or replace advice from a
          qualified healthcare professional.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="symptom-entry-date">Entry date</Label>
            <Input
              id="symptom-entry-date"
              type="date"
              value={entryDate}
              max={getLocalDateString()}
              onChange={(event) => setEntryDate(event.target.value)}
              aria-invalid={!!errors.entryDate}
              aria-describedby={errors.entryDate ? 'symptom-entry-date-error' : undefined}
            />
            {errors.entryDate && (
              <p id="symptom-entry-date-error" className="text-caption text-destructive">
                {errors.entryDate}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Selected symptoms</span>
            {selectedSymptoms.length === 0 ? (
              <p className="text-caption text-muted-foreground">
                Select one or more symptoms from Explore Symptoms above.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SYMPTOM_OPTIONS.filter((option) => selectedSymptoms.includes(option.value)).map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`symptom-selected-${option.value}`}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-primary bg-accent/40 p-2.5 text-sm transition-colors"
                  >
                    <Checkbox
                      id={`symptom-selected-${option.value}`}
                      checked
                      onCheckedChange={() => onToggleSymptom(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            )}
            {errors.symptoms && (
              <p role="alert" className="text-caption text-destructive">
                {errors.symptoms}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span id="symptom-severity-label" className="text-sm font-medium">
              Severity <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <RadioGroup
              aria-labelledby="symptom-severity-label"
              value={severity ?? ''}
              onValueChange={(value) => setSeverity(value ? (value as SeverityValue) : null)}
              className="flex flex-wrap gap-1.5"
            >
              {SEVERITY_OPTIONS.map((option) => {
                const checked = severity === option.value
                return (
                  <label
                    key={option.value}
                    htmlFor={`symptom-severity-${option.value}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                      checked ? 'border-primary bg-accent/40' : 'border-border hover:bg-muted/50',
                    )}
                  >
                    <RadioGroupItem id={`symptom-severity-${option.value}`} value={option.value} />
                    {option.label}
                  </label>
                )
              })}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-2">
            <span id="symptom-timing-label" className="text-sm font-medium">
              Timing <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <RadioGroup
              aria-labelledby="symptom-timing-label"
              value={timing ?? ''}
              onValueChange={(value) => setTiming(value ? (value as TimingValue) : null)}
              className="flex flex-wrap gap-1.5"
            >
              {TIMING_OPTIONS.map((option) => {
                const checked = timing === option.value
                return (
                  <label
                    key={option.value}
                    htmlFor={`symptom-timing-${option.value}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                      checked ? 'border-primary bg-accent/40' : 'border-border hover:bg-muted/50',
                    )}
                  >
                    <RadioGroupItem id={`symptom-timing-${option.value}`} value={option.value} />
                    {option.label}
                  </label>
                )
              })}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="symptom-note">Note</Label>
            <Textarea
              id="symptom-note"
              value={note}
              maxLength={NOTE_MAX_LENGTH}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional — context in your own words"
              aria-invalid={!!errors.note}
              aria-describedby={errors.note ? 'symptom-note-error' : 'symptom-note-count'}
            />
            <div className="flex items-center justify-between">
              {errors.note ? (
                <p id="symptom-note-error" className="text-caption text-destructive">
                  {errors.note}
                </p>
              ) : (
                <span />
              )}
              <p id="symptom-note-count" className="text-caption text-muted-foreground">
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
              {isEditing ? 'Symptom entry updated.' : 'Symptom entry saved.'}
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
            {isSaving ? 'Saving…' : isEditing ? 'Update Entry' : 'Save Entry'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default SymptomEntryForm

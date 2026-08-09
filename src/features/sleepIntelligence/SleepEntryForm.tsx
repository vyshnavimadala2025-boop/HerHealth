import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { NOTE_MAX_LENGTH, SLEEP_QUALITY_OPTIONS, type SleepEntry, type SleepQuality } from '@/features/sleepIntelligence/types'
import type { SleepEntryInput } from '@/features/sleepIntelligence/sleepService'
import { computeDurationMinutes } from '@/features/sleepIntelligence/sleepCalculations'
import { getLocalDateString } from '@/features/periods/dateUtils'
import { cn } from '@/lib/utils'

interface FieldErrors {
  entryDate?: string
  note?: string
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return 'Enter both times to calculate'
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return `${hours}h ${remainder}m`
}

interface SleepEntryFormProps {
  editingEntry: SleepEntry | null
  onSave: (input: SleepEntryInput) => Promise<SleepEntry>
  onSaved: () => void
  onCancelEdit: () => void
}

/**
 * A single save() upserts by (user_id, entry_date) — see sleepService.ts
 * — so this form doubles as both "record tonight" and "edit a past
 * night" depending on whether editingEntry is set, without a separate
 * update code path.
 */
function SleepEntryForm({ editingEntry, onSave, onSaved, onCancelEdit }: SleepEntryFormProps) {
  const [entryDate, setEntryDate] = useState(getLocalDateString())
  const [bedtime, setBedtime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [quality, setQuality] = useState<SleepQuality | null>(null)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingEntry) {
      setEntryDate(editingEntry.entryDate)
      setBedtime(editingEntry.bedtime ?? '')
      setWakeTime(editingEntry.wakeTime ?? '')
      setQuality(editingEntry.quality)
      setNote(editingEntry.note ?? '')
    } else {
      setEntryDate(getLocalDateString())
      setBedtime('')
      setWakeTime('')
      setQuality(null)
      setNote('')
    }
    setErrors({})
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingEntry])

  const computedDuration = computeDurationMinutes(bedtime || null, wakeTime || null)

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
      const input: SleepEntryInput = {
        entryDate,
        bedtime: bedtime || null,
        wakeTime: wakeTime || null,
        durationMinutes: computedDuration,
        quality,
        note: trimmedNote ? trimmedNote : null,
      }
      await onSave(input)
      setSaveSuccess(true)
      onSaved()

      if (!editingEntry) {
        setEntryDate(getLocalDateString())
        setBedtime('')
        setWakeTime('')
        setQuality(null)
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
    <Card id="sleep-entry-form" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Sleep Entry' : 'Record a Night’s Sleep'}</CardTitle>
        <CardDescription>
          This records what you choose to enter. It does not diagnose a sleep disorder or replace advice from a
          qualified healthcare professional.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sleep-entry-date">Night of</Label>
            <Input
              id="sleep-entry-date"
              type="date"
              value={entryDate}
              max={getLocalDateString()}
              onChange={(event) => setEntryDate(event.target.value)}
              className="max-w-48"
              aria-invalid={!!errors.entryDate}
              aria-describedby={errors.entryDate ? 'sleep-entry-date-error' : undefined}
            />
            {errors.entryDate && (
              <p id="sleep-entry-date-error" className="text-caption text-destructive">
                {errors.entryDate}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sleep-bedtime">
                Bedtime <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="sleep-bedtime"
                type="time"
                value={bedtime}
                onChange={(event) => setBedtime(event.target.value)}
                className="max-w-40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sleep-wake-time">
                Wake time <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="sleep-wake-time"
                type="time"
                value={wakeTime}
                onChange={(event) => setWakeTime(event.target.value)}
                className="max-w-40"
              />
            </div>
          </div>

          <p className="text-caption text-muted-foreground">
            Calculated sleep duration: <span className="font-medium text-foreground">{formatDuration(computedDuration)}</span>
          </p>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Sleep quality <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <RadioGroup
              value={quality ?? ''}
              onValueChange={(value) => setQuality(value ? (value as SleepQuality) : null)}
              className="flex flex-wrap gap-1.5"
            >
              {SLEEP_QUALITY_OPTIONS.map((option) => {
                const checked = quality === option.value
                return (
                  <label
                    key={option.value}
                    htmlFor={`sleep-quality-${option.value}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                      checked ? 'border-primary bg-accent/40' : 'border-border hover:bg-muted/50',
                    )}
                  >
                    <RadioGroupItem id={`sleep-quality-${option.value}`} value={option.value} />
                    {option.label}
                  </label>
                )
              })}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sleep-note">Note</Label>
            <Textarea
              id="sleep-note"
              value={note}
              maxLength={NOTE_MAX_LENGTH}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional — routine or context in your own words"
              aria-invalid={!!errors.note}
              aria-describedby={errors.note ? 'sleep-note-error' : 'sleep-note-count'}
            />
            <div className="flex items-center justify-between">
              {errors.note ? (
                <p id="sleep-note-error" className="text-caption text-destructive">
                  {errors.note}
                </p>
              ) : (
                <span />
              )}
              <p id="sleep-note-count" className="text-caption text-muted-foreground">
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
              {isEditing ? 'Sleep entry updated.' : 'Sleep entry saved.'}
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

export default SleepEntryForm

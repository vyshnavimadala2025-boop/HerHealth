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
  RECOVERY_ACTION_OPTIONS,
  RECOVERY_LEVEL_OPTIONS,
  REFLECTION_MAX_LENGTH,
  STRESS_LEVEL_OPTIONS,
  type RecoveryAction,
  type RecoveryLevel,
  type StressLevel,
  type StressRecoveryEntry,
} from '@/features/stressRecovery/types'
import type { StressRecoveryEntryInput } from '@/features/stressRecovery/stressRecoveryService'
import { getLocalDateString } from '@/features/periods/dateUtils'
import { cn } from '@/lib/utils'

interface FieldErrors {
  entryDate?: string
  reflection?: string
}

interface StressRecoveryEntryFormProps {
  editingEntry: StressRecoveryEntry | null
  onSave: (input: StressRecoveryEntryInput) => Promise<StressRecoveryEntry>
  onSaved: () => void
  onCancelEdit: () => void
}

/** Stress and recovery levels reuse the exact same 4-tier option set, so this one control renders both. */
function LevelRadioGroup({
  idPrefix,
  options,
  value,
  onChange,
}: {
  idPrefix: string
  options: readonly { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const checked = value === option.value
        return (
          <label
            key={option.value}
            htmlFor={`${idPrefix}-${option.value}`}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
              checked ? 'border-primary bg-accent/40' : 'border-border hover:bg-muted/50',
            )}
          >
            <RadioGroupItem id={`${idPrefix}-${option.value}`} value={option.value} />
            {option.label}
          </label>
        )
      })}
    </RadioGroup>
  )
}

/**
 * A single save() upserts by (user_id, entry_date) — see
 * stressRecoveryService.ts — mirroring SleepEntryForm.tsx/
 * NutritionEntryForm.tsx's exact approach. Deliberately does not ask for
 * mood/energy here — those are Daily Check-In's data and are shown
 * read-only elsewhere on this page via the existing check-in pipeline,
 * not re-collected.
 */
function StressRecoveryEntryForm({ editingEntry, onSave, onSaved, onCancelEdit }: StressRecoveryEntryFormProps) {
  const [entryDate, setEntryDate] = useState(getLocalDateString())
  const [stressLevel, setStressLevel] = useState<StressLevel | null>(null)
  const [recoveryLevel, setRecoveryLevel] = useState<RecoveryLevel | null>(null)
  const [recoveryActions, setRecoveryActions] = useState<RecoveryAction[]>([])
  const [reflection, setReflection] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingEntry) {
      setEntryDate(editingEntry.entryDate)
      setStressLevel(editingEntry.stressLevel)
      setRecoveryLevel(editingEntry.recoveryLevel)
      setRecoveryActions(editingEntry.recoveryActions)
      setReflection(editingEntry.reflection ?? '')
    } else {
      setEntryDate(getLocalDateString())
      setStressLevel(null)
      setRecoveryLevel(null)
      setRecoveryActions([])
      setReflection('')
    }
    setErrors({})
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingEntry])

  const toggleRecoveryAction = (value: RecoveryAction) => {
    setRecoveryActions((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isSavingRef.current) return

    const today = getLocalDateString()
    const trimmedReflection = reflection.trim()
    const nextErrors: FieldErrors = {}
    if (!entryDate) {
      nextErrors.entryDate = 'Entry date is required'
    } else if (entryDate > today) {
      nextErrors.entryDate = 'Entry date cannot be in the future'
    }
    if (trimmedReflection.length > REFLECTION_MAX_LENGTH) {
      nextErrors.reflection = `Reflection must be ${REFLECTION_MAX_LENGTH} characters or fewer`
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const input: StressRecoveryEntryInput = {
        entryDate,
        stressLevel,
        recoveryLevel,
        recoveryActions,
        reflection: trimmedReflection ? trimmedReflection : null,
      }
      await onSave(input)
      setSaveSuccess(true)
      onSaved()

      if (!editingEntry) {
        setEntryDate(getLocalDateString())
        setStressLevel(null)
        setRecoveryLevel(null)
        setRecoveryActions([])
        setReflection('')
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
    <Card id="stress-recovery-entry-form" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Check-In' : 'Stress & Recovery Check-In'}</CardTitle>
        <CardDescription>
          This records what you choose to enter for wellness awareness only. It does not diagnose anxiety,
          depression, burnout, or any other condition, and does not replace advice from a qualified healthcare
          professional.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stress-recovery-entry-date">Date</Label>
            <Input
              id="stress-recovery-entry-date"
              type="date"
              value={entryDate}
              max={getLocalDateString()}
              onChange={(event) => setEntryDate(event.target.value)}
              className="max-w-48"
              aria-invalid={!!errors.entryDate}
              aria-describedby={errors.entryDate ? 'stress-recovery-entry-date-error' : undefined}
            />
            {errors.entryDate && (
              <p id="stress-recovery-entry-date-error" className="text-caption text-destructive">
                {errors.entryDate}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Stress level <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <LevelRadioGroup
              idPrefix="stress-level"
              options={STRESS_LEVEL_OPTIONS}
              value={stressLevel ?? ''}
              onChange={(value) => setStressLevel(value ? (value as StressLevel) : null)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Recovery level <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <LevelRadioGroup
              idPrefix="recovery-level"
              options={RECOVERY_LEVEL_OPTIONS}
              value={recoveryLevel ?? ''}
              onChange={(value) => setRecoveryLevel(value ? (value as RecoveryLevel) : null)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Recovery actions today <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {RECOVERY_ACTION_OPTIONS.map((option) => {
                const checked = recoveryActions.includes(option.value)
                return (
                  <label
                    key={option.value}
                    htmlFor={`recovery-action-${option.value}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors hover:bg-muted/50',
                      checked ? 'border-primary bg-accent/40' : 'border-border',
                    )}
                  >
                    <Checkbox
                      id={`recovery-action-${option.value}`}
                      checked={checked}
                      onCheckedChange={() => toggleRecoveryAction(option.value)}
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stress-recovery-reflection">Reflection</Label>
            <Textarea
              id="stress-recovery-reflection"
              value={reflection}
              maxLength={REFLECTION_MAX_LENGTH}
              onChange={(event) => setReflection(event.target.value)}
              placeholder="Optional — context in your own words"
              aria-invalid={!!errors.reflection}
              aria-describedby={errors.reflection ? 'stress-recovery-reflection-error' : 'stress-recovery-reflection-count'}
            />
            <div className="flex items-center justify-between">
              {errors.reflection ? (
                <p id="stress-recovery-reflection-error" className="text-caption text-destructive">
                  {errors.reflection}
                </p>
              ) : (
                <span />
              )}
              <p id="stress-recovery-reflection-count" className="text-caption text-muted-foreground">
                {reflection.length}/{REFLECTION_MAX_LENGTH}
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
              {isEditing ? 'Entry updated.' : 'Entry saved.'}
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

export default StressRecoveryEntryForm

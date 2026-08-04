import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, ClipboardCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { saveTodayCheckIn } from '@/features/checkins/checkinService'
import {
  MOOD_OPTIONS,
  ENERGY_LEVEL_OPTIONS,
  WELLBEING_OPTIONS,
  NOTE_MAX_LENGTH,
  type Mood,
  type EnergyLevel,
  type Wellbeing,
  type CheckIn,
} from '@/features/checkins/types'
import { cn } from '@/lib/utils'

interface OptionGroupProps<T extends string> {
  name: string
  label: string
  options: readonly { value: T; label: string }[]
  value: T | null
  onChange: (value: T) => void
  error: string | null
}

function OptionGroup<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  error,
}: OptionGroupProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span id={`${name}-label`} className="text-sm font-medium">
        {label}
      </span>
      <RadioGroup
        aria-labelledby={`${name}-label`}
        value={value ?? undefined}
        onValueChange={(next) => onChange(next as T)}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {options.map((option) => {
          const checked = value === option.value
          return (
            <label
              key={option.value}
              htmlFor={`${name}-${option.value}`}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-2.5 text-sm transition-colors hover:bg-muted/50',
                checked ? 'border-primary bg-accent/40' : 'border-border',
              )}
            >
              <span className="flex items-center gap-2">
                <RadioGroupItem id={`${name}-${option.value}`} value={option.value} />
                {option.label}
              </span>
              {checked && <Check className="size-3.5 text-primary" aria-hidden="true" />}
            </label>
          )
        })}
      </RadioGroup>
      {error && (
        <p role="alert" className="text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

interface CheckInFormProps {
  userId: string
  initialCheckIn: CheckIn | null
  todayStatus: 'loading' | 'ready' | 'error'
  onSaved: (checkIn: CheckIn) => void
}

interface FieldErrors {
  mood?: string
  energyLevel?: string
  wellbeing?: string
}

function CheckInForm({ userId, initialCheckIn, todayStatus, onSaved }: CheckInFormProps) {
  const [mood, setMood] = useState<Mood | null>(null)
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null)
  const [wellbeing, setWellbeing] = useState<Wellbeing | null>(null)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)
  const prefilledRef = useRef(false)

  useEffect(() => {
    if (initialCheckIn && !prefilledRef.current) {
      setMood(initialCheckIn.mood)
      setEnergyLevel(initialCheckIn.energyLevel)
      setWellbeing(initialCheckIn.wellbeing)
      setNote(initialCheckIn.note ?? '')
      prefilledRef.current = true
    }
  }, [initialCheckIn])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isSavingRef.current) return

    const nextErrors: FieldErrors = {}
    if (!mood) nextErrors.mood = 'Please select your mood'
    if (!energyLevel) nextErrors.energyLevel = 'Please select your energy level'
    if (!wellbeing) nextErrors.wellbeing = 'Please select your general wellbeing'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const trimmedNote = note.trim().slice(0, NOTE_MAX_LENGTH)
      const saved = await saveTodayCheckIn(userId, {
        mood: mood as Mood,
        energyLevel: energyLevel as EnergyLevel,
        wellbeing: wellbeing as Wellbeing,
        note: trimmedNote ? trimmedNote : null,
      })
      prefilledRef.current = true
      setSaveSuccess(true)
      onSaved(saved)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  const isUpdate = !!initialCheckIn
  const controlsDisabled = todayStatus === 'loading' || isSaving

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardCheck className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>How are you feeling today?</CardTitle>
        </div>
        <CardDescription>
          HerHealth supports personal wellness tracking and does not provide medical diagnosis.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-5">
          <OptionGroup
            name="checkin-mood"
            label="Mood"
            options={MOOD_OPTIONS}
            value={mood}
            onChange={setMood}
            error={errors.mood ?? null}
          />
          <OptionGroup
            name="checkin-energy"
            label="Energy level"
            options={ENERGY_LEVEL_OPTIONS}
            value={energyLevel}
            onChange={setEnergyLevel}
            error={errors.energyLevel ?? null}
          />
          <OptionGroup
            name="checkin-wellbeing"
            label="General wellbeing"
            options={WELLBEING_OPTIONS}
            value={wellbeing}
            onChange={setWellbeing}
            error={errors.wellbeing ?? null}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="checkin-note">Anything you&apos;d like to note today?</Label>
            <Textarea
              id="checkin-note"
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
              {isUpdate ? 'Check-in updated.' : 'Check-in saved.'}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={controlsDisabled}>
            {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSaving
              ? 'Saving your check-in…'
              : isUpdate
                ? "Update Today's Check-In"
                : "Save Today's Check-In"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default CheckInForm

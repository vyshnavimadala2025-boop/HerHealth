import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, ClipboardCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { savePregnancyEntry } from '@/features/pregnancy/pregnancyEntryService'
import { getLocalDateString } from '@/features/periods/dateUtils'
import {
  PREGNANCY_MOOD_OPTIONS,
  PREGNANCY_ENERGY_OPTIONS,
  PREGNANCY_SLEEP_OPTIONS,
  SYMPTOM_OPTIONS,
  NUTRITION_HABIT_OPTIONS,
  NOTE_MAX_LENGTH,
  type PregnancyMood,
  type PregnancyEnergyLevel,
  type PregnancySleepQuality,
  type Symptom,
  type NutritionHabit,
  type PregnancyEntry,
} from '@/features/pregnancy/types'
import { cn } from '@/lib/utils'

interface OptionGroupProps<T extends string> {
  name: string
  label: string
  options: readonly { value: T; label: string }[]
  value: T | null
  onChange: (value: T) => void
}

function OptionGroup<T extends string>({ name, label, options, value, onChange }: OptionGroupProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span id={`${name}-label`} className="text-sm font-medium text-foreground">
        {label} <span className="font-normal text-muted-foreground">(optional)</span>
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
                'flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg border p-2.5 text-sm transition-colors hover:bg-muted/50',
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
    </div>
  )
}

interface PregnancyEntryFormProps {
  userId: string
  editingEntry: PregnancyEntry | null
  onSaved: () => void
  onCancelEdit: () => void
}

function PregnancyEntryForm({ userId, editingEntry, onSaved, onCancelEdit }: PregnancyEntryFormProps) {
  const [entryDate, setEntryDate] = useState(getLocalDateString())
  const [mood, setMood] = useState<PregnancyMood | null>(null)
  const [energyLevel, setEnergyLevel] = useState<PregnancyEnergyLevel | null>(null)
  const [sleepQuality, setSleepQuality] = useState<PregnancySleepQuality | null>(null)
  const [waterIntake, setWaterIntake] = useState('')
  const [exerciseMinutes, setExerciseMinutes] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [bpSystolic, setBpSystolic] = useState('')
  const [bpDiastolic, setBpDiastolic] = useState('')
  const [babyMovementNote, setBabyMovementNote] = useState('')
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [nutritionHabits, setNutritionHabits] = useState<NutritionHabit[]>([])
  const [reflection, setReflection] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingEntry) {
      setEntryDate(editingEntry.entryDate)
      setMood(editingEntry.mood)
      setEnergyLevel(editingEntry.energyLevel)
      setSleepQuality(editingEntry.sleepQuality)
      setWaterIntake(editingEntry.waterIntakeGlasses !== null ? String(editingEntry.waterIntakeGlasses) : '')
      setExerciseMinutes(editingEntry.exerciseMinutes !== null ? String(editingEntry.exerciseMinutes) : '')
      setWeightKg(editingEntry.weightKg !== null ? String(editingEntry.weightKg) : '')
      setBpSystolic(editingEntry.bloodPressureSystolic !== null ? String(editingEntry.bloodPressureSystolic) : '')
      setBpDiastolic(editingEntry.bloodPressureDiastolic !== null ? String(editingEntry.bloodPressureDiastolic) : '')
      setBabyMovementNote(editingEntry.babyMovementNote ?? '')
      setSymptoms(editingEntry.symptoms)
      setNutritionHabits(editingEntry.nutritionHabits)
      setReflection(editingEntry.reflection ?? '')
    } else {
      setEntryDate(getLocalDateString())
      setMood(null)
      setEnergyLevel(null)
      setSleepQuality(null)
      setWaterIntake('')
      setExerciseMinutes('')
      setWeightKg('')
      setBpSystolic('')
      setBpDiastolic('')
      setBabyMovementNote('')
      setSymptoms([])
      setNutritionHabits([])
      setReflection('')
    }
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingEntry])

  const toggleSymptom = (value: Symptom) => {
    setSymptoms((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]))
  }

  const toggleHabit = (value: NutritionHabit) => {
    setNutritionHabits((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isSavingRef.current) return

    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const trimmedReflection = reflection.trim().slice(0, NOTE_MAX_LENGTH)
      const trimmedMovementNote = babyMovementNote.trim().slice(0, NOTE_MAX_LENGTH)
      await savePregnancyEntry(userId, {
        entryDate,
        mood,
        energyLevel,
        sleepQuality,
        waterIntakeGlasses: waterIntake ? Number(waterIntake) : null,
        exerciseMinutes: exerciseMinutes ? Number(exerciseMinutes) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        bloodPressureSystolic: bpSystolic ? Number(bpSystolic) : null,
        bloodPressureDiastolic: bpDiastolic ? Number(bpDiastolic) : null,
        babyMovementNote: trimmedMovementNote ? trimmedMovementNote : null,
        symptoms,
        nutritionHabits,
        reflection: trimmedReflection ? trimmedReflection : null,
      })
      setSaveSuccess(true)
      onSaved()
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
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardCheck className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>{isEditing ? 'Edit Wellness Entry' : "Today's Wellness Entry"}</CardTitle>
        </div>
        <CardDescription>
          HerHealth supports personal pregnancy wellness tracking and does not provide medical
          advice. Every field is optional — record only what feels useful to you.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pregnancy-entry-date">Entry date</Label>
            <Input
              id="pregnancy-entry-date"
              type="date"
              className="h-11 max-w-xs rounded-xl"
              value={entryDate}
              max={getLocalDateString()}
              onChange={(event) => setEntryDate(event.target.value)}
            />
          </div>

          <OptionGroup name="pregnancy-mood" label="Mood" options={PREGNANCY_MOOD_OPTIONS} value={mood} onChange={setMood} />
          <OptionGroup
            name="pregnancy-energy"
            label="Energy level"
            options={PREGNANCY_ENERGY_OPTIONS}
            value={energyLevel}
            onChange={setEnergyLevel}
          />
          <OptionGroup
            name="pregnancy-sleep"
            label="Sleep quality"
            options={PREGNANCY_SLEEP_OPTIONS}
            value={sleepQuality}
            onChange={setSleepQuality}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pregnancy-water">
                Water intake (glasses) <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input id="pregnancy-water" type="number" min="0" max="30" inputMode="numeric" className="h-11 rounded-xl" value={waterIntake} onChange={(event) => setWaterIntake(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pregnancy-exercise">
                Exercise (minutes) <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input id="pregnancy-exercise" type="number" min="0" max="600" inputMode="numeric" className="h-11 rounded-xl" value={exerciseMinutes} onChange={(event) => setExerciseMinutes(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pregnancy-weight">
                Weight (kg) <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input id="pregnancy-weight" type="number" step="0.1" min="20" max="300" inputMode="decimal" className="h-11 rounded-xl" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pregnancy-bp">
                Blood pressure (optional) <span className="font-normal text-muted-foreground">manual entry</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input id="pregnancy-bp" type="number" min="60" max="250" inputMode="numeric" placeholder="Systolic" className="h-11 rounded-xl" value={bpSystolic} onChange={(event) => setBpSystolic(event.target.value)} />
                <span className="text-muted-foreground">/</span>
                <Input type="number" min="40" max="150" inputMode="numeric" placeholder="Diastolic" className="h-11 rounded-xl" value={bpDiastolic} onChange={(event) => setBpDiastolic(event.target.value)} aria-label="Diastolic blood pressure" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">
              Symptoms <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SYMPTOM_OPTIONS.map((option) => {
                const checked = symptoms.includes(option.value)
                return (
                  <label
                    key={option.value}
                    htmlFor={`pregnancy-symptom-${option.value}`}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors hover:bg-muted/50',
                      checked ? 'border-primary bg-accent/40' : 'border-border',
                    )}
                  >
                    <Checkbox id={`pregnancy-symptom-${option.value}`} checked={checked} onCheckedChange={() => toggleSymptom(option.value)} />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">
              Nutrition <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {NUTRITION_HABIT_OPTIONS.map((option) => {
                const checked = nutritionHabits.includes(option.value)
                return (
                  <label
                    key={option.value}
                    htmlFor={`pregnancy-nutrition-${option.value}`}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-sm transition-colors hover:bg-muted/50',
                      checked ? 'border-primary bg-accent/40' : 'border-border',
                    )}
                  >
                    <Checkbox id={`pregnancy-nutrition-${option.value}`} checked={checked} onCheckedChange={() => toggleHabit(option.value)} />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pregnancy-movement">
              Baby movement notes <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="pregnancy-movement"
              value={babyMovementNote}
              maxLength={NOTE_MAX_LENGTH}
              onChange={(event) => setBabyMovementNote(event.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pregnancy-reflection">Daily reflection</Label>
            <Textarea
              id="pregnancy-reflection"
              value={reflection}
              maxLength={NOTE_MAX_LENGTH}
              onChange={(event) => setReflection(event.target.value)}
              placeholder="Optional"
            />
            <p className="text-caption text-muted-foreground text-right">
              {reflection.length}/{NOTE_MAX_LENGTH}
            </p>
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
            <Button type="button" variant="outline" size="lg" className="h-11 flex-1 rounded-xl" onClick={onCancelEdit} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button type="submit" size="lg" className="h-11 flex-1 rounded-xl" disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSaving ? 'Saving…' : isEditing ? 'Update Entry' : 'Save Entry'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default PregnancyEntryForm

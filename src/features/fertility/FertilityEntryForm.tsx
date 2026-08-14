import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { saveFertilityEntry } from '@/features/fertility/fertilityService'
import { getLocalDateString } from '@/features/periods/dateUtils'
import {
  CERVICAL_MUCUS_OPTIONS,
  OVULATION_TEST_OPTIONS,
  FERTILITY_MOOD_OPTIONS,
  FERTILITY_ENERGY_OPTIONS,
  QUALITY_SCALE_OPTIONS,
  STRESS_LEVEL_OPTIONS,
  HABIT_OPTIONS,
  NOTE_MAX_LENGTH,
  type CervicalMucus,
  type OvulationTestResult,
  type FertilityMood,
  type FertilityEnergyLevel,
  type QualityScale,
  type StressLevel,
  type FertilityHabit,
  type FertilityEntry,
} from '@/features/fertility/types'
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

interface FertilityEntryFormProps {
  userId: string
  editingEntry: FertilityEntry | null
  /** Pre-fills the date for a new entry (e.g. after picking a day on the calendar). Ignored while editing an existing entry. */
  initialDate?: string
  onSaved: () => void
  onCancelEdit: () => void
}

function FertilityEntryForm({ userId, editingEntry, initialDate, onSaved, onCancelEdit }: FertilityEntryFormProps) {
  const [entryDate, setEntryDate] = useState(initialDate ?? getLocalDateString())
  const [cervicalMucus, setCervicalMucus] = useState<CervicalMucus | null>(null)
  const [bbt, setBbt] = useState('')
  const [ovulationTest, setOvulationTest] = useState<OvulationTestResult | null>(null)
  const [mood, setMood] = useState<FertilityMood | null>(null)
  const [energyLevel, setEnergyLevel] = useState<FertilityEnergyLevel | null>(null)
  const [sleepQuality, setSleepQuality] = useState<QualityScale | null>(null)
  const [stressLevel, setStressLevel] = useState<StressLevel | null>(null)
  const [nutritionQuality, setNutritionQuality] = useState<QualityScale | null>(null)
  const [waterIntake, setWaterIntake] = useState('')
  const [exerciseMinutes, setExerciseMinutes] = useState('')
  const [intimacy, setIntimacy] = useState(false)
  const [habits, setHabits] = useState<FertilityHabit[]>([])
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingEntry) {
      setEntryDate(editingEntry.entryDate)
      setCervicalMucus(editingEntry.cervicalMucus)
      setBbt(editingEntry.bbtCelsius !== null ? String(editingEntry.bbtCelsius) : '')
      setOvulationTest(editingEntry.ovulationTest)
      setMood(editingEntry.mood)
      setEnergyLevel(editingEntry.energyLevel)
      setSleepQuality(editingEntry.sleepQuality)
      setStressLevel(editingEntry.stressLevel)
      setNutritionQuality(editingEntry.nutritionQuality)
      setWaterIntake(editingEntry.waterIntakeGlasses !== null ? String(editingEntry.waterIntakeGlasses) : '')
      setExerciseMinutes(editingEntry.exerciseMinutes !== null ? String(editingEntry.exerciseMinutes) : '')
      setIntimacy(editingEntry.intimacy)
      setHabits(editingEntry.habits)
      setNote(editingEntry.note ?? '')
    } else {
      setEntryDate(initialDate ?? getLocalDateString())
      setCervicalMucus(null)
      setBbt('')
      setOvulationTest(null)
      setMood(null)
      setEnergyLevel(null)
      setSleepQuality(null)
      setStressLevel(null)
      setNutritionQuality(null)
      setWaterIntake('')
      setExerciseMinutes('')
      setIntimacy(false)
      setHabits([])
      setNote('')
    }
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingEntry, initialDate])

  const toggleHabit = (value: FertilityHabit) => {
    setHabits((current) =>
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
      const trimmedNote = note.trim().slice(0, NOTE_MAX_LENGTH)
      await saveFertilityEntry(userId, {
        entryDate,
        cervicalMucus,
        bbtCelsius: bbt ? Number(bbt) : null,
        ovulationTest,
        mood,
        energyLevel,
        sleepQuality,
        stressLevel,
        nutritionQuality,
        waterIntakeGlasses: waterIntake ? Number(waterIntake) : null,
        exerciseMinutes: exerciseMinutes ? Number(exerciseMinutes) : null,
        intimacy,
        habits,
        note: trimmedNote ? trimmedNote : null,
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
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>{isEditing ? 'Edit Fertility Entry' : 'Today’s Fertility Entry'}</CardTitle>
        </div>
        <CardDescription>
          SIRILA supports personal fertility wellness tracking and does not diagnose or predict
          pregnancy. Every field below is optional — record only what feels useful to you.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fertility-entry-date">Entry date</Label>
            <Input
              id="fertility-entry-date"
              type="date"
              className="h-11 max-w-xs rounded-xl"
              value={entryDate}
              max={getLocalDateString()}
              onChange={(event) => setEntryDate(event.target.value)}
            />
          </div>

          <OptionGroup
            name="fertility-cervical-mucus"
            label="Cervical mucus"
            options={CERVICAL_MUCUS_OPTIONS}
            value={cervicalMucus}
            onChange={setCervicalMucus}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fertility-bbt">
                Basal body temperature (°C) <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="fertility-bbt"
                type="number"
                step="0.01"
                min="34"
                max="42"
                inputMode="decimal"
                className="h-11 rounded-xl"
                placeholder="e.g. 36.50"
                value={bbt}
                onChange={(event) => setBbt(event.target.value)}
              />
            </div>
          </div>

          <OptionGroup
            name="fertility-ovulation-test"
            label="Ovulation test result"
            options={OVULATION_TEST_OPTIONS}
            value={ovulationTest}
            onChange={setOvulationTest}
          />

          <OptionGroup name="fertility-mood" label="Mood" options={FERTILITY_MOOD_OPTIONS} value={mood} onChange={setMood} />
          <OptionGroup
            name="fertility-energy"
            label="Energy level"
            options={FERTILITY_ENERGY_OPTIONS}
            value={energyLevel}
            onChange={setEnergyLevel}
          />
          <OptionGroup
            name="fertility-sleep"
            label="Sleep quality"
            options={QUALITY_SCALE_OPTIONS}
            value={sleepQuality}
            onChange={setSleepQuality}
          />
          <OptionGroup
            name="fertility-stress"
            label="Stress level"
            options={STRESS_LEVEL_OPTIONS}
            value={stressLevel}
            onChange={setStressLevel}
          />
          <OptionGroup
            name="fertility-nutrition"
            label="Nutrition quality"
            options={QUALITY_SCALE_OPTIONS}
            value={nutritionQuality}
            onChange={setNutritionQuality}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fertility-water">
                Water intake (glasses) <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="fertility-water"
                type="number"
                min="0"
                max="30"
                inputMode="numeric"
                className="h-11 rounded-xl"
                value={waterIntake}
                onChange={(event) => setWaterIntake(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fertility-exercise">
                Exercise (minutes) <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="fertility-exercise"
                type="number"
                min="0"
                max="600"
                inputMode="numeric"
                className="h-11 rounded-xl"
                value={exerciseMinutes}
                onChange={(event) => setExerciseMinutes(event.target.value)}
              />
            </div>
          </div>

          <label
            htmlFor="fertility-intimacy"
            className="flex min-h-11 w-fit cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm transition-colors hover:bg-muted/50"
          >
            <Checkbox id="fertility-intimacy" checked={intimacy} onCheckedChange={(value) => setIntimacy(value === true)} />
            Logged today
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">
              Healthy habits <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {HABIT_OPTIONS.map((option) => {
                const checked = habits.includes(option.value)
                return (
                  <label
                    key={option.value}
                    htmlFor={`fertility-habit-${option.value}`}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-sm transition-colors hover:bg-muted/50',
                      checked ? 'border-primary bg-accent/40' : 'border-border',
                    )}
                  >
                    <Checkbox
                      id={`fertility-habit-${option.value}`}
                      checked={checked}
                      onCheckedChange={() => toggleHabit(option.value)}
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fertility-note">Private notes</Label>
            <Textarea
              id="fertility-note"
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

export default FertilityEntryForm

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import {
  FOOD_CATEGORY_OPTIONS,
  MAX_HYDRATION_GLASSES,
  MEAL_OPTIONS,
  NOTE_MAX_LENGTH,
  type FoodCategoryValue,
  type MealValue,
  type NutritionEntry,
} from '@/features/nutritionCompanion/types'
import type { NutritionEntryInput } from '@/features/nutritionCompanion/nutritionService'
import { getLocalDateString } from '@/features/periods/dateUtils'
import { cn } from '@/lib/utils'

interface FieldErrors {
  entryDate?: string
  hydrationGlasses?: string
  note?: string
}

interface NutritionEntryFormProps {
  editingEntry: NutritionEntry | null
  onSave: (input: NutritionEntryInput) => Promise<NutritionEntry>
  onSaved: () => void
  onCancelEdit: () => void
}

/**
 * A single save() upserts by (user_id, entry_date) — see
 * nutritionService.ts — so this form doubles as both "log today" and
 * "edit a past day" depending on whether editingEntry is set, mirroring
 * SleepEntryForm.tsx's exact approach.
 */
function NutritionEntryForm({ editingEntry, onSave, onSaved, onCancelEdit }: NutritionEntryFormProps) {
  const [entryDate, setEntryDate] = useState(getLocalDateString())
  const [mealsLogged, setMealsLogged] = useState<MealValue[]>([])
  const [foodCategories, setFoodCategories] = useState<FoodCategoryValue[]>([])
  const [hydrationGlasses, setHydrationGlasses] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (editingEntry) {
      setEntryDate(editingEntry.entryDate)
      setMealsLogged(editingEntry.mealsLogged)
      setFoodCategories(editingEntry.foodCategories)
      setHydrationGlasses(editingEntry.hydrationGlasses !== null ? String(editingEntry.hydrationGlasses) : '')
      setNote(editingEntry.note ?? '')
    } else {
      setEntryDate(getLocalDateString())
      setMealsLogged([])
      setFoodCategories([])
      setHydrationGlasses('')
      setNote('')
    }
    setErrors({})
    setSaveError(null)
    setSaveSuccess(false)
  }, [editingEntry])

  const toggleMeal = (value: MealValue) => {
    setMealsLogged((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]))
  }

  const toggleFoodCategory = (value: FoodCategoryValue) => {
    setFoodCategories((current) =>
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
    if (hydrationGlasses) {
      const parsed = Number(hydrationGlasses)
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_HYDRATION_GLASSES) {
        nextErrors.hydrationGlasses = `Enter a whole number from 0 to ${MAX_HYDRATION_GLASSES}`
      }
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
      const input: NutritionEntryInput = {
        entryDate,
        mealsLogged,
        foodCategories,
        hydrationGlasses: hydrationGlasses ? Number(hydrationGlasses) : null,
        note: trimmedNote ? trimmedNote : null,
      }
      await onSave(input)
      setSaveSuccess(true)
      onSaved()

      if (!editingEntry) {
        setEntryDate(getLocalDateString())
        setMealsLogged([])
        setFoodCategories([])
        setHydrationGlasses('')
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
    <Card id="nutrition-entry-form" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Nutrition Entry' : 'Record Today’s Nutrition'}</CardTitle>
        <CardDescription>
          This records what you choose to enter for awareness only. It is not a calorie or nutrient calculator and
          does not replace advice from a qualified healthcare professional or dietitian.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nutrition-entry-date">Date</Label>
            <Input
              id="nutrition-entry-date"
              type="date"
              value={entryDate}
              max={getLocalDateString()}
              onChange={(event) => setEntryDate(event.target.value)}
              className="max-w-48"
              aria-invalid={!!errors.entryDate}
              aria-describedby={errors.entryDate ? 'nutrition-entry-date-error' : undefined}
            />
            {errors.entryDate && (
              <p id="nutrition-entry-date-error" className="text-caption text-destructive">
                {errors.entryDate}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Meals logged <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MEAL_OPTIONS.map((option) => {
                const checked = mealsLogged.includes(option.value)
                return (
                  <label
                    key={option.value}
                    htmlFor={`nutrition-meal-${option.value}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors hover:bg-muted/50',
                      checked ? 'border-primary bg-accent/40' : 'border-border',
                    )}
                  >
                    <Checkbox
                      id={`nutrition-meal-${option.value}`}
                      checked={checked}
                      onCheckedChange={() => toggleMeal(option.value)}
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Food categories noticed <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FOOD_CATEGORY_OPTIONS.map((option) => {
                const checked = foodCategories.includes(option.value)
                return (
                  <label
                    key={option.value}
                    htmlFor={`nutrition-category-${option.value}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors hover:bg-muted/50',
                      checked ? 'border-primary bg-accent/40' : 'border-border',
                    )}
                  >
                    <Checkbox
                      id={`nutrition-category-${option.value}`}
                      checked={checked}
                      onCheckedChange={() => toggleFoodCategory(option.value)}
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nutrition-hydration">
              Water intake (glasses) <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="nutrition-hydration"
              type="number"
              min="0"
              max={MAX_HYDRATION_GLASSES}
              inputMode="numeric"
              className="max-w-32"
              value={hydrationGlasses}
              onChange={(event) => setHydrationGlasses(event.target.value)}
              aria-invalid={!!errors.hydrationGlasses}
              aria-describedby={errors.hydrationGlasses ? 'nutrition-hydration-error' : undefined}
            />
            {errors.hydrationGlasses && (
              <p id="nutrition-hydration-error" className="text-caption text-destructive">
                {errors.hydrationGlasses}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nutrition-note">Note</Label>
            <Textarea
              id="nutrition-note"
              value={note}
              maxLength={NOTE_MAX_LENGTH}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional — what you ate or noticed, in your own words"
              aria-invalid={!!errors.note}
              aria-describedby={errors.note ? 'nutrition-note-error' : 'nutrition-note-count'}
            />
            <div className="flex items-center justify-between">
              {errors.note ? (
                <p id="nutrition-note-error" className="text-caption text-destructive">
                  {errors.note}
                </p>
              ) : (
                <span />
              )}
              <p id="nutrition-note-count" className="text-caption text-muted-foreground">
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
              {isEditing ? 'Nutrition entry updated.' : 'Nutrition entry saved.'}
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

export default NutritionEntryForm

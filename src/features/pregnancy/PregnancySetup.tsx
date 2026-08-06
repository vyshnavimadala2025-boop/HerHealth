import { useState, type FormEvent } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { savePregnancyProfile } from '@/features/pregnancy/pregnancyProfileService'
import { getLocalDateString, addDays } from '@/features/periods/dateUtils'

interface PregnancySetupProps {
  userId: string
  onSaved: () => void
}

/**
 * Shown when the user has no pregnancy_profiles row yet. Only asks for a
 * due date — everything else in Baby Growth (current week, trimester,
 * baby size) is computed from that one value via pregnancyCalculations.ts.
 */
function PregnancySetup({ userId, onSaved }: PregnancySetupProps) {
  const [dueDate, setDueDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const earliestDueDate = getLocalDateString()
  const latestDueDate = addDays(getLocalDateString(), 300)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!dueDate) {
      setError('Please enter your estimated due date')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      await savePregnancyProfile(userId, {
        dueDate,
        preferredHospital: null,
        emergencyContact: null,
        supportPerson: null,
        painManagementPreference: null,
        birthPlanNotes: null,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Welcome to Baby Growth</CardTitle>
        </div>
        <CardDescription>
          A supportive, week-by-week wellness companion for your pregnancy. Enter your estimated
          due date to begin — you can update this anytime.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pregnancy-due-date">Estimated due date</Label>
            <Input
              id="pregnancy-due-date"
              type="date"
              className="h-11 rounded-xl"
              min={earliestDueDate}
              max={latestDueDate}
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-caption text-destructive">
              {error}
            </p>
          )}
          <p className="text-caption text-muted-foreground">
            This information is private to your account and is used only to personalize your
            wellness companion. It is not medical guidance.
          </p>
        </CardContent>
        <CardFooter>
          <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSaving ? 'Saving…' : 'Begin My Journey'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default PregnancySetup

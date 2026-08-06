import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { savePregnancyProfile } from '@/features/pregnancy/pregnancyProfileService'
import type { PregnancyProfile } from '@/features/pregnancy/types'

interface BirthPlanOrganizerProps {
  userId: string
  profile: PregnancyProfile
  onSaved: () => void
}

/** A single free-form record per user, so it lives on pregnancy_profiles rather than its own table — everything here is editable and optional. */
function BirthPlanOrganizer({ userId, profile, onSaved }: BirthPlanOrganizerProps) {
  const [preferredHospital, setPreferredHospital] = useState(profile.preferredHospital ?? '')
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact ?? '')
  const [supportPerson, setSupportPerson] = useState(profile.supportPerson ?? '')
  const [painManagementPreference, setPainManagementPreference] = useState(profile.painManagementPreference ?? '')
  const [birthPlanNotes, setBirthPlanNotes] = useState(profile.birthPlanNotes ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setPreferredHospital(profile.preferredHospital ?? '')
    setEmergencyContact(profile.emergencyContact ?? '')
    setSupportPerson(profile.supportPerson ?? '')
    setPainManagementPreference(profile.painManagementPreference ?? '')
    setBirthPlanNotes(profile.birthPlanNotes ?? '')
  }, [profile])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await savePregnancyProfile(userId, {
        dueDate: profile.dueDate,
        preferredHospital: preferredHospital.trim() || null,
        emergencyContact: emergencyContact.trim() || null,
        supportPerson: supportPerson.trim() || null,
        painManagementPreference: painManagementPreference.trim() || null,
        birthPlanNotes: birthPlanNotes.trim() || null,
      })
      setSuccess(true)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-primary">
            <NotebookPen className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Birth Plan Organizer</CardTitle>
        </div>
        <CardDescription>Your preferences, private to your account and editable anytime.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="birthplan-hospital">Preferred hospital</Label>
              <Input id="birthplan-hospital" className="h-11 rounded-xl" value={preferredHospital} onChange={(event) => setPreferredHospital(event.target.value)} placeholder="Optional" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="birthplan-emergency">Emergency contact</Label>
              <Input id="birthplan-emergency" className="h-11 rounded-xl" value={emergencyContact} onChange={(event) => setEmergencyContact(event.target.value)} placeholder="Optional" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="birthplan-support">Support person</Label>
              <Input id="birthplan-support" className="h-11 rounded-xl" value={supportPerson} onChange={(event) => setSupportPerson(event.target.value)} placeholder="Optional" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="birthplan-pain">Pain management preference</Label>
              <Input id="birthplan-pain" className="h-11 rounded-xl" value={painManagementPreference} onChange={(event) => setPainManagementPreference(event.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="birthplan-notes">Notes</Label>
            <Textarea id="birthplan-notes" value={birthPlanNotes} onChange={(event) => setBirthPlanNotes(event.target.value)} placeholder="Optional" maxLength={1000} />
          </div>
          {error && (
            <p role="alert" className="text-caption text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="text-caption text-primary">
              Birth plan saved.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" size="lg" className="h-11 w-fit rounded-xl" disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSaving ? 'Saving…' : 'Save Birth Plan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default BirthPlanOrganizer

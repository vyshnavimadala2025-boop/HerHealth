import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import { useAuth } from '@/features/auth/useAuth'
import { updateFullName } from '@/features/profile/profileService'
import { AGE_RANGES, TRACKING_PREFERENCES } from '@/features/profile/types'

function labelFor(options: readonly { value: string; label: string }[], value: string | null | undefined) {
  if (!value) return null
  return options.find((option) => option.value === value)?.label ?? null
}

function ProfileInfoForm() {
  const { user, profile, profileStatus, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (profile) setFullName(profile.fullName)
  }, [profile])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isSavingRef.current || !user) return

    const trimmed = fullName.trim()
    if (!trimmed) {
      setFieldError('Full name is required')
      return
    }
    setFieldError(null)

    isSavingRef.current = true
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await updateFullName(user.id, trimmed)
      await refreshProfile()
      setSaveSuccess(true)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  if (profileStatus === 'loading') {
    return (
      <Card>
        <CardContent role="status" className="flex flex-col gap-3 py-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
            <User className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Profile</CardTitle>
        </div>
        <CardDescription>Your profile information is private to your account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-fullname">Full name</Label>
            <Input
              id="profile-fullname"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              aria-invalid={!!fieldError}
              aria-describedby={fieldError ? 'profile-fullname-error' : undefined}
            />
            {fieldError && (
              <p id="profile-fullname-error" className="text-caption text-destructive">
                {fieldError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Age range</Label>
            <p className="text-sm text-muted-foreground">
              {labelFor(AGE_RANGES, profile?.ageRange) ?? 'Not set'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tracking preferences</Label>
            <p className="text-sm text-muted-foreground">
              {profile && profile.trackingPreferences.length > 0
                ? profile.trackingPreferences
                    .map((value) => labelFor(TRACKING_PREFERENCES, value))
                    .filter(Boolean)
                    .join(', ')
                : 'None selected'}
            </p>
          </div>

          {saveError && (
            <p role="alert" className="text-caption text-destructive">
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <p role="status" className="text-caption text-primary">
              Profile updated.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default ProfileInfoForm

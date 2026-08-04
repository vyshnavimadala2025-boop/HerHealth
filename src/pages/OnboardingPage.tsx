import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/features/auth/useAuth'
import { completeOnboarding } from '@/features/profile/profileService'
import type { AgeRange, TrackingPreference } from '@/features/profile/types'
import WelcomeStep from '@/features/onboarding/steps/WelcomeStep'
import ProfileStep from '@/features/onboarding/steps/ProfileStep'
import PreferencesStep from '@/features/onboarding/steps/PreferencesStep'
import ConsentStep from '@/features/onboarding/steps/ConsentStep'
import CompletionStep from '@/features/onboarding/steps/CompletionStep'

function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState(profile?.fullName ?? '')
  const [fullNameError, setFullNameError] = useState<string | null>(null)
  const [ageRange, setAgeRange] = useState<AgeRange | null>(profile?.ageRange ?? null)
  const [trackingPreferences, setTrackingPreferences] = useState<TrackingPreference[]>(
    profile?.trackingPreferences ?? [],
  )
  const [consent, setConsent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isSavingRef = useRef(false)

  const goBack = () => setStep((current) => Math.max(current - 1, 0))

  const handleProfileContinue = () => {
    const trimmed = fullName.trim()
    if (!trimmed) {
      setFullNameError('Full name is required')
      return
    }
    setFullNameError(null)
    setStep(2)
  }

  const togglePreference = (value: TrackingPreference) => {
    setTrackingPreferences((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    )
  }

  const handleComplete = async () => {
    if (isSavingRef.current || !user) return
    isSavingRef.current = true
    setIsSaving(true)
    setSubmitError(null)
    try {
      await completeOnboarding(user.id, {
        fullName: fullName.trim(),
        ageRange,
        trackingPreferences,
      })
      await refreshProfile()
      setStep(4)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-muted/30 p-6 py-12 animate-in fade-in duration-500 motion-reduce:animate-none">
      <Card className="w-full max-w-md shadow-lg">
        {step === 0 && <WelcomeStep onContinue={() => setStep(1)} />}
        {step === 1 && (
          <ProfileStep
            fullName={fullName}
            onFullNameChange={setFullName}
            fullNameError={fullNameError}
            ageRange={ageRange}
            onAgeRangeChange={setAgeRange}
            onBack={goBack}
            onContinue={handleProfileContinue}
          />
        )}
        {step === 2 && (
          <PreferencesStep
            selected={trackingPreferences}
            onToggle={togglePreference}
            onBack={goBack}
            onContinue={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <ConsentStep
            consent={consent}
            onConsentChange={setConsent}
            onBack={goBack}
            onContinue={handleComplete}
            isSaving={isSaving}
            error={submitError}
          />
        )}
        {step === 4 && (
          <CompletionStep onGoToDashboard={() => navigate('/dashboard', { replace: true })} />
        )}
      </Card>
    </main>
  )
}

export default OnboardingPage

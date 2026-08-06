import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { completeOnboarding } from '@/features/profile/profileService'
import type { AgeRange, TrackingPreference } from '@/features/profile/types'
import OnboardingLayout from '@/features/onboarding/OnboardingLayout'
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
    <OnboardingLayout>
      {/* `key={step}` remounts on every step change, retriggering the
          entrance animation for a lightweight step-transition effect
          without extra transition-state bookkeeping. */}
      <div
        key={step}
        className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-2 duration-300 motion-reduce:animate-none"
      >
        {step === 0 && <WelcomeStep onContinue={() => setStep(1)} onSkip={() => setStep(3)} />}
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
            selectedPreferences={trackingPreferences}
          />
        )}
        {step === 4 && (
          <CompletionStep onGoToDashboard={() => navigate('/dashboard', { replace: true })} />
        )}
      </div>
    </OnboardingLayout>
  )
}

export default OnboardingPage

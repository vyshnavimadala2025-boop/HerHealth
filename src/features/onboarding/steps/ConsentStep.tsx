import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import OnboardingProgress from '@/features/onboarding/OnboardingProgress'
import { TRACKING_PREFERENCES, type TrackingPreference } from '@/features/profile/types'

interface ConsentStepProps {
  consent: boolean
  onConsentChange: (value: boolean) => void
  onBack: () => void
  onContinue: () => void
  isSaving: boolean
  error: string | null
  selectedPreferences: TrackingPreference[]
}

function ConsentStep({
  consent,
  onConsentChange,
  onBack,
  onContinue,
  isSaving,
  error,
  selectedPreferences,
}: ConsentStepProps) {
  const selectedLabels = TRACKING_PREFERENCES.filter((option) =>
    selectedPreferences.includes(option.value),
  ).map((option) => option.label)

  return (
    <div className="flex flex-col gap-6">
      <OnboardingProgress step={3} totalSteps={4} />

      <div className="flex flex-col gap-2">
        <h1 className="text-heading font-display text-foreground">Privacy and consent</h1>
        <p className="text-body text-muted-foreground">
          SIRILA is a wellness and tracking platform, not a medical provider. Your data stays
          private to your account.
        </p>
      </div>

      {selectedLabels.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl bg-muted/30 p-3.5">
          <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
            Your focus
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-accent px-2.5 py-1 text-caption font-medium text-accent-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <label
          htmlFor="onboarding-consent"
          className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-border p-3.5 text-sm transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
        >
          <Checkbox
            id="onboarding-consent"
            checked={consent}
            onCheckedChange={(value) => onConsentChange(value === true)}
            className="mt-0.5"
          />
          <span className="text-foreground">
            I understand that SIRILA is a wellness and tracking platform and does not provide
            medical diagnosis or emergency medical care.
          </span>
        </label>
        {error && (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-14 flex-1 rounded-xl text-base"
          onClick={onBack}
          disabled={isSaving}
        >
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-14 flex-1 rounded-xl text-base transition-transform duration-200 hover:-translate-y-0.5"
          onClick={onContinue}
          disabled={!consent || isSaving}
          aria-live="polite"
        >
          {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
          {isSaving ? 'Setting up your space…' : 'Create My Wellness Space'}
        </Button>
      </div>
    </div>
  )
}

export default ConsentStep

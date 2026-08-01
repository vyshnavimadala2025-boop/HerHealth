import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import OnboardingProgress from '@/features/onboarding/OnboardingProgress'

interface ConsentStepProps {
  consent: boolean
  onConsentChange: (value: boolean) => void
  onBack: () => void
  onContinue: () => void
  isSaving: boolean
  error: string | null
}

function ConsentStep({
  consent,
  onConsentChange,
  onBack,
  onContinue,
  isSaving,
  error,
}: ConsentStepProps) {
  return (
    <>
      <CardHeader>
        <OnboardingProgress step={4} totalSteps={4} />
        <CardTitle>Privacy and consent</CardTitle>
        <CardDescription>
          HerHealth is a wellness and tracking platform, not a medical provider. Your data stays
          private to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <label htmlFor="onboarding-consent" className="flex items-start gap-3 text-sm">
          <Checkbox
            id="onboarding-consent"
            checked={consent}
            onCheckedChange={(value) => onConsentChange(value === true)}
            className="mt-0.5"
          />
          <span>
            I understand that HerHealth is a wellness and tracking platform and does not provide
            medical diagnosis or emergency medical care.
          </span>
        </label>
        {error && (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={isSaving}
        >
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={onContinue}
          disabled={!consent || isSaving}
        >
          {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
          {isSaving ? 'Setting up your HerHealth space…' : 'Continue'}
        </Button>
      </CardFooter>
    </>
  )
}

export default ConsentStep

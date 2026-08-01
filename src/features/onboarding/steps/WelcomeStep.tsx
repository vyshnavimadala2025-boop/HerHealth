import { HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import OnboardingProgress from '@/features/onboarding/OnboardingProgress'

interface WelcomeStepProps {
  onContinue: () => void
}

function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <>
      <CardHeader className="flex flex-col items-center gap-3 text-center">
        <OnboardingProgress step={1} totalSteps={4} />
        <HeartPulse className="mt-2 size-8 text-primary" aria-hidden="true" />
        <CardTitle className="text-heading">Welcome to HerHealth</CardTitle>
        <CardDescription className="text-body">
          Set up your profile to personalize your health tracking experience.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button type="button" className="w-full" onClick={onContinue}>
          Continue
        </Button>
      </CardFooter>
    </>
  )
}

export default WelcomeStep

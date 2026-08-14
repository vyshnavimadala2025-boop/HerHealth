import { HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeStepProps {
  onContinue: () => void
  onSkip: () => void
}

/**
 * "Skip for Now" jumps straight to the consent step (the only step that
 * can't be skipped) rather than bypassing onboarding entirely — name and
 * age/preferences stay whatever they already are (name is already set
 * from signup), so nothing is lost, just deferred to Profile settings.
 */
function WelcomeStep({ onContinue, onSkip }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <HeartPulse className="size-6" aria-hidden="true" />
      </div>
      <h1 className="text-heading font-display text-foreground">Welcome to SIRILA</h1>
      <p className="text-body text-muted-foreground">
        Let&apos;s create a wellness experience that feels personal, supportive, and right for
        you.
      </p>
      <p className="text-caption text-muted-foreground">
        This only takes a few minutes, and you can update your preferences anytime.
      </p>
      <Button
        type="button"
        size="lg"
        className="mt-3 h-14 w-full rounded-xl text-base transition-transform duration-200 hover:-translate-y-0.5"
        onClick={onContinue}
      >
        Get Started
      </Button>
      <button
        type="button"
        onClick={onSkip}
        className="text-caption font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Skip for Now
      </button>
    </div>
  )
}

export default WelcomeStep

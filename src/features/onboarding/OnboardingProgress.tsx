import { cn } from '@/lib/utils'

interface OnboardingProgressProps {
  step: number
  totalSteps: number
}

/**
 * Track uses `bg-primary/15` rather than a chip token like `blush`/
 * `lavender` — those tokens swap to a *dark* shade in dark mode (they're
 * designed as light-bg-in-light-mode / dark-bg-in-dark-mode pairs for
 * accent chips), which would nearly vanish against the equally-dark
 * onboarding panel. An opacity blend of `primary` stays visibly softer
 * than the active segments in both themes since it composites against
 * whatever the current panel background already is.
 */
function OnboardingProgress({ step, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
        Step {step} of {totalSteps}
      </p>
      <div
        className="flex w-full items-center gap-1.5"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${step} of ${totalSteps}`}
      >
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              index < step ? 'bg-primary' : 'bg-primary/15',
            )}
          />
        ))}
      </div>
    </div>
  )
}

export default OnboardingProgress

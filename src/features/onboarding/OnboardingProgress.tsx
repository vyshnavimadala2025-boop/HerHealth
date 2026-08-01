import { cn } from '@/lib/utils'

interface OnboardingProgressProps {
  step: number
  totalSteps: number
}

function OnboardingProgress({ step, totalSteps }: OnboardingProgressProps) {
  return (
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
            'h-1.5 flex-1 rounded-full transition-colors',
            index < step ? 'bg-primary' : 'bg-muted',
          )}
        />
      ))}
    </div>
  )
}

export default OnboardingProgress

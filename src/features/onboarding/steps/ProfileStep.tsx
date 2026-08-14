import type { ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import OnboardingProgress from '@/features/onboarding/OnboardingProgress'
import { AGE_RANGES, type AgeRange } from '@/features/profile/types'
import { cn } from '@/lib/utils'

interface ProfileStepProps {
  fullName: string
  onFullNameChange: (value: string) => void
  fullNameError: string | null
  ageRange: AgeRange | null
  onAgeRangeChange: (value: AgeRange) => void
  onBack: () => void
  onContinue: () => void
}

function ProfileStep({
  fullName,
  onFullNameChange,
  fullNameError,
  ageRange,
  onAgeRangeChange,
  onBack,
  onContinue,
}: ProfileStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <OnboardingProgress step={1} totalSteps={4} />

      <div className="flex flex-col gap-2">
        <h1 className="text-heading font-display text-foreground">Let&apos;s make SIRILA feel more personal.</h1>
        <p className="text-body text-muted-foreground">Tell us a little about you.</p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="onboarding-fullName">Full name</Label>
          <Input
            id="onboarding-fullName"
            className="h-13 rounded-xl"
            value={fullName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onFullNameChange(event.target.value)}
            aria-invalid={!!fullNameError}
            aria-describedby={fullNameError ? 'onboarding-fullName-error' : undefined}
          />
          {fullNameError && (
            <p id="onboarding-fullName-error" className="text-caption text-destructive">
              {fullNameError}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <span id="onboarding-ageRange-label" className="text-sm font-medium text-foreground">
            Age range <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <RadioGroup
            aria-labelledby="onboarding-ageRange-label"
            value={ageRange ?? undefined}
            onValueChange={(value) => onAgeRangeChange(value as AgeRange)}
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {AGE_RANGES.map((option) => {
              const checked = ageRange === option.value
              return (
                <label
                  key={option.value}
                  htmlFor={`onboarding-ageRange-${option.value}`}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition-all duration-200 hover:border-primary/40 hover:shadow-sm',
                    checked ? 'border-primary bg-accent/50' : 'border-border bg-background',
                  )}
                >
                  <RadioGroupItem id={`onboarding-ageRange-${option.value}`} value={option.value} />
                  {option.label}
                </label>
              )
            })}
          </RadioGroup>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-14 flex-1 rounded-xl text-base"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-14 flex-1 rounded-xl text-base transition-transform duration-200 hover:-translate-y-0.5"
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default ProfileStep

import type { ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import OnboardingProgress from '@/features/onboarding/OnboardingProgress'
import { AGE_RANGES, type AgeRange } from '@/features/profile/types'

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
    <>
      <CardHeader>
        <OnboardingProgress step={2} totalSteps={4} />
        <CardTitle>Basic profile</CardTitle>
        <CardDescription>Tell us a little about you.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="onboarding-fullName">Full name</Label>
          <Input
            id="onboarding-fullName"
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

        <div className="flex flex-col gap-2">
          <span id="onboarding-ageRange-label" className="text-sm font-medium">
            Age range <span className="font-normal text-muted-foreground">(optional)</span>
          </span>
          <RadioGroup
            aria-labelledby="onboarding-ageRange-label"
            value={ageRange ?? undefined}
            onValueChange={(value) => onAgeRangeChange(value as AgeRange)}
          >
            {AGE_RANGES.map((option) => (
              <label
                key={option.value}
                htmlFor={`onboarding-ageRange-${option.value}`}
                className="flex items-center gap-2 text-sm"
              >
                <RadioGroupItem id={`onboarding-ageRange-${option.value}`} value={option.value} />
                {option.label}
              </label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="button" className="flex-1" onClick={onContinue}>
          Continue
        </Button>
      </CardFooter>
    </>
  )
}

export default ProfileStep

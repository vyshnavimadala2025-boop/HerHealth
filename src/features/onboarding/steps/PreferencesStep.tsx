import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import OnboardingProgress from '@/features/onboarding/OnboardingProgress'
import { TRACKING_PREFERENCES, type TrackingPreference } from '@/features/profile/types'
import { cn } from '@/lib/utils'

interface PreferencesStepProps {
  selected: TrackingPreference[]
  onToggle: (value: TrackingPreference) => void
  onBack: () => void
  onContinue: () => void
}

function PreferencesStep({ selected, onToggle, onBack, onContinue }: PreferencesStepProps) {
  return (
    <>
      <CardHeader>
        <OnboardingProgress step={3} totalSteps={4} />
        <CardTitle>Tracking preferences</CardTitle>
        <CardDescription>Choose what you&apos;d like to track. You can change this later.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TRACKING_PREFERENCES.map((option) => {
            const checked = selected.includes(option.value)
            return (
              <label
                key={option.value}
                htmlFor={`onboarding-pref-${option.value}`}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50',
                  checked ? 'border-primary bg-accent/40' : 'border-border',
                )}
              >
                <Checkbox
                  id={`onboarding-pref-${option.value}`}
                  checked={checked}
                  onCheckedChange={() => onToggle(option.value)}
                />
                {option.label}
              </label>
            )
          })}
        </div>
        <p className="text-caption text-muted-foreground">
          Your selections help personalize your experience. HerHealth does not provide medical
          diagnosis.
        </p>
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

export default PreferencesStep

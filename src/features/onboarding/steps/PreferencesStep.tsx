import {
  Droplet,
  Flower2,
  HeartPulse,
  Leaf,
  NotebookPen,
  Smile,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import OnboardingProgress from '@/features/onboarding/OnboardingProgress'
import { TRACKING_PREFERENCES, type TrackingPreference } from '@/features/profile/types'
import { cn } from '@/lib/utils'

const PREFERENCE_ICONS: Record<TrackingPreference, LucideIcon> = {
  menstrual_cycle: HeartPulse,
  period_symptoms: Droplet,
  mood_wellbeing: Smile,
  lifestyle_habits: Leaf,
  pcos_tracking: Flower2,
  general_notes: NotebookPen,
}

interface PreferencesStepProps {
  selected: TrackingPreference[]
  onToggle: (value: TrackingPreference) => void
  onBack: () => void
  onContinue: () => void
}

function PreferencesStep({ selected, onToggle, onBack, onContinue }: PreferencesStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <OnboardingProgress step={2} totalSteps={4} />

      <div className="flex flex-col gap-2">
        <h1 className="text-heading font-display text-foreground">What would you like to focus on?</h1>
        <p className="text-body text-muted-foreground">
          Choose the areas you&apos;d like HerHealth to support. There is no right or wrong
          answer, and you can change these anytime.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {TRACKING_PREFERENCES.map((option) => {
            const checked = selected.includes(option.value)
            const Icon = PREFERENCE_ICONS[option.value]
            return (
              <label
                key={option.value}
                htmlFor={`onboarding-pref-${option.value}`}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition-all duration-200 hover:border-primary/40 hover:shadow-sm',
                  checked ? 'border-primary bg-accent/50' : 'border-border bg-background',
                )}
              >
                <Checkbox
                  id={`onboarding-pref-${option.value}`}
                  checked={checked}
                  onCheckedChange={() => onToggle(option.value)}
                />
                <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                {option.label}
              </label>
            )
          })}
        </div>
        <p className="text-caption text-muted-foreground">
          Your selections help personalize your experience. HerHealth does not provide medical
          diagnosis.
        </p>
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

export default PreferencesStep

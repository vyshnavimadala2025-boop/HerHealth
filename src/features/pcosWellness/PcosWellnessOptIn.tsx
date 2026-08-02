import { Loader2 } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface PcosWellnessOptInProps {
  enabled: boolean
  isToggling: boolean
  suggestedDefault: boolean
  onChange: (next: boolean) => void
}

function PcosWellnessOptIn({ enabled, isToggling, suggestedDefault, onChange }: PcosWellnessOptInProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PCOS/PCOD Wellness Tracking</CardTitle>
        <CardDescription>
          This is optional. HerHealth does not assume you have PCOS or PCOD — you choose whether
          to track this.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <RadioGroup
          value={enabled ? 'enabled' : 'disabled'}
          onValueChange={(value) => onChange(value === 'enabled')}
          className="flex flex-col gap-2"
        >
          <label
            htmlFor="pcos-opt-in-enabled"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm"
          >
            <RadioGroupItem id="pcos-opt-in-enabled" value="enabled" disabled={isToggling} />
            I want to track PCOS/PCOD-related wellness information
          </label>
          <label
            htmlFor="pcos-opt-in-disabled"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm"
          >
            <RadioGroupItem id="pcos-opt-in-disabled" value="disabled" disabled={isToggling} />
            Not currently tracking
          </label>
        </RadioGroup>

        {isToggling && (
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            Saving your preference…
          </div>
        )}

        {!enabled && !isToggling && suggestedDefault && (
          <p className="text-caption text-muted-foreground">
            You indicated interest in PCOS-related tracking during onboarding — you can enable it
            above at any time.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default PcosWellnessOptIn

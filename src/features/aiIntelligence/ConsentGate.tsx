import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { getConsentState, setConsentState } from '@/features/aiIntelligence/consent'
import type { AiConsentState } from '@/features/aiIntelligence/types'

interface ConsentGateProps {
  onContinue: () => void
}

/**
 * Shown before the first real use of SIRILA Intelligence. Three distinct,
 * non-bundled consent categories (Phase 0 Section 6) — Category A
 * (processing) is required to use the feature at all; Categories B
 * (existing SIRILA context) and C (persistent memory) are genuinely
 * optional and can be left unchecked. All three are changeable later —
 * see the AI Settings section this should eventually live in (not built
 * this phase; consent state is read directly from localStorage wherever
 * it's needed for now).
 */
function ConsentGate({ onContinue }: ConsentGateProps) {
  const [consent, setConsent] = useState<AiConsentState>(getConsentState)

  const handleContinue = () => {
    setConsentState(consent)
    onContinue()
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>Before you start</CardTitle>
        <CardDescription>
          SIRILA Intelligence is a conversation, not a diagnosis. Choose what you're comfortable with — you can
          change any of this later.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-xl border border-border p-3">
          <Checkbox
            id="consent-processing"
            checked={consent.processing}
            onCheckedChange={(checked) => setConsent((current) => ({ ...current, processing: checked === true }))}
          />
          <div className="flex flex-col gap-1">
            <Label htmlFor="consent-processing" className="font-medium">
              Let SIRILA process what I share here
            </Label>
            <p className="text-caption text-muted-foreground">
              Required to use SIRILA Intelligence. What you type is used only to generate a response in this
              conversation.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border p-3">
          <Checkbox
            id="consent-context"
            checked={consent.useWellnessContext}
            onCheckedChange={(checked) =>
              setConsent((current) => ({ ...current, useWellnessContext: checked === true }))
            }
          />
          <div className="flex flex-col gap-1">
            <Label htmlFor="consent-context" className="font-medium">
              Use my existing SIRILA wellness information for context
            </Label>
            <p className="text-caption text-muted-foreground">
              Optional. Lets SIRILA reference recent cycle, sleep, or stress data you've already recorded, only when
              relevant to your question.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border p-3">
          <Checkbox
            id="consent-memory"
            checked={consent.memory}
            onCheckedChange={(checked) => setConsent((current) => ({ ...current, memory: checked === true }))}
          />
          <div className="flex flex-col gap-1">
            <Label htmlFor="consent-memory" className="font-medium">
              Let me choose to save things for SIRILA to remember later
            </Label>
            <p className="text-caption text-muted-foreground">
              Optional. Without this, SIRILA only remembers the current conversation. With it, you can explicitly
              say "remember this" to save a specific detail.
            </p>
          </div>
        </div>

        <Button type="button" disabled={!consent.processing} onClick={handleContinue} className="self-start">
          Continue
        </Button>
      </CardContent>
    </Card>
  )
}

export default ConsentGate

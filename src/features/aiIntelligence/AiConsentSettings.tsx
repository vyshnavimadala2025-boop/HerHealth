import { useState } from 'react'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getConsentState, setConsentState } from '@/features/aiIntelligence/consent'
import type { AiConsentState } from '@/features/aiIntelligence/types'

interface ConsentRow {
  key: keyof AiConsentState
  label: string
  description: string
}

const ROWS: ConsentRow[] = [
  {
    key: 'processing',
    label: 'Let SIRILA process what I share in SIRILA Intelligence',
    description:
      'Required to use SIRILA Intelligence at all. Withdrawing this stops all future AI conversations until you grant it again.',
  },
  {
    key: 'useWellnessContext',
    label: 'Use my existing SIRILA wellness information for context',
    description:
      'Optional. Lets SIRILA reference recent cycle, sleep, or stress data you\'ve already recorded, only when relevant. Withdrawing this immediately stops that data being supplied to future requests.',
  },
  {
    key: 'memory',
    label: 'Let me choose to save things for SIRILA to remember later',
    description:
      'Optional. Without this, "Remember this" is unavailable and SIRILA only uses the current conversation. Withdrawing does not delete items already remembered — forget those individually below.',
  },
]

/**
 * Settings → Privacy control for SIRILA Intelligence consent (Phase 2
 * Finding 3). Three distinct, independently-toggleable categories, never
 * bundled. Each toggle applies immediately — the same getConsentState()
 * read that gates every AI request (see useConversation.ts) picks up the
 * change on the very next request, so withdrawal takes effect right away.
 * Withdrawing consent never deletes existing conversations or memory —
 * that's a separate, explicit action (delete a conversation, or Data &
 * Privacy above for full account data deletion).
 */
function AiConsentSettings() {
  const [consent, setConsent] = useState<AiConsentState>(getConsentState)

  const update = (key: keyof AiConsentState, value: boolean) => {
    const next = { ...consent, [key]: value }
    setConsent(next)
    setConsentState(next)
    toast.success(value ? 'Permission granted.' : 'Permission withdrawn.')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>SIRILA Intelligence Privacy</CardTitle>
        </div>
        <CardDescription>
          Control what SIRILA Intelligence can use. You can withdraw or grant any of these at any time — changes
          apply immediately to future requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-start gap-3 rounded-lg border border-border p-3">
            <Checkbox
              id={`ai-consent-${row.key}`}
              checked={consent[row.key]}
              onCheckedChange={(checked) => update(row.key, checked === true)}
            />
            <div className="flex flex-col gap-1">
              <Label htmlFor={`ai-consent-${row.key}`} className="font-medium">
                {row.label}
              </Label>
              <p className="text-caption text-muted-foreground">{row.description}</p>
            </div>
          </div>
        ))}
        <p className="text-caption text-muted-foreground">
          Withdrawing consent here does not delete your existing SIRILA Intelligence conversations or symptom
          journal entries — delete those individually from SIRILA Intelligence, or use Data &amp; Privacy above to
          delete everything at once.
        </p>
      </CardContent>
    </Card>
  )
}

export default AiConsentSettings

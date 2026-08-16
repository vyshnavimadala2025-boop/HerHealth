import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getConsentState, setConsentState } from '@/features/aiIntelligence/consent'

interface VisualInsightConsentNoticeProps {
  onContinue: () => void
}

/**
 * One-time notice shown on first "Attach image" use — deliberately
 * separate from the main ConsentGate (Phase 3A.0 Section 13), since a
 * user may use SIRILA Intelligence via text only for a long time and
 * never need to see this. Grants only Category D (imageAnalysis) —
 * never bundled with processing/context/memory consent.
 */
function VisualInsightConsentNotice({ onContinue }: VisualInsightConsentNoticeProps) {
  const handleContinue = () => {
    setConsentState({ ...getConsentState(), imageAnalysis: true })
    onContinue()
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <ImageIcon className="size-5" aria-hidden="true" />
        </div>
        <CardTitle>Before you attach an image</CardTitle>
        <CardDescription>
          Your image is private to your account, stored securely, and only used to help SIRILA understand what
          you're describing — never for advertising or shared with anyone else.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-caption text-muted-foreground">
          You can remove this permission anytime in Settings → Privacy without affecting your other SIRILA
          Intelligence permissions. This does not diagnose or medically analyze your image — it helps SIRILA respond
          with more context, the same as adding more description in words would.
        </p>
        <Button type="button" onClick={handleContinue} className="self-start">
          Allow image attachments
        </Button>
      </CardContent>
    </Card>
  )
}

export default VisualInsightConsentNotice

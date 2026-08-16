import { FlaskConical } from 'lucide-react'

/**
 * The fixed, neutral development message shown after a successful upload
 * in Phase 3A.1. No AI processing has run — this is not a result, not an
 * observation, not a claim about the image's content in any way. Matches
 * the Edge Function's MOCK_DEVELOPMENT_MESSAGE exactly, so the UI and the
 * server boundary never say two different things.
 */
function VisualInsightMockNotice() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-3 text-caption text-muted-foreground">
      <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>Image uploaded successfully. Visual analysis is not enabled in this development build.</p>
    </div>
  )
}

export default VisualInsightMockNotice

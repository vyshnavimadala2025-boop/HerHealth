import { FlaskConical } from 'lucide-react'

/**
 * Mandatory, unmissable banner for every SIRILA Intelligence surface while
 * it's gated to development builds (Phase 2 Section 15). Two real
 * blockers are still open: the Privacy Page's existing "your journal is
 * never analyzed" language contradicts this feature (Phase 0 Section 5),
 * and emergency-tier response wording has not received clinical/legal
 * sign-off (0029_ai_send_message.sql). Do not remove this banner as part
 * of making the feature "feel more finished" — it can only come down once
 * both of those are genuinely resolved.
 */
function PreviewGateNotice() {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-dashed border-attention bg-attention/10 p-3 text-caption text-attention-foreground">
      <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        <strong className="font-medium">Internal preview.</strong> SIRILA Intelligence uses placeholder AI responses
        and safety copy pending clinical/legal review. Not yet available to all users.
      </p>
    </div>
  )
}

export default PreviewGateNotice

import { FlaskConical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AnalyzeImageResult } from '@/features/aiIntelligence/aiProviderAbstraction'

interface VisualInsightProcessingResultProps {
  result: AnalyzeImageResult
}

/**
 * Renders the mock processing result (Phase 3A.2). Every field here comes
 * from a fixed, deterministic mock RPC response — visualObservations is
 * always empty, safetyTier is always 'routine', message is always the
 * same neutral development sentence. Nothing on this screen is derived
 * from the image's actual content in any way, and the "mock" labeling is
 * never hidden or minimized.
 */
function VisualInsightProcessingResult({ result }: VisualInsightProcessingResultProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-3">
      <div className="flex items-center gap-2 text-caption font-medium text-foreground">
        <FlaskConical className="size-4 shrink-0" aria-hidden="true" />
        Mock development result
        <Badge variant="outline" className="capitalize">
          {result.safetyTier}
        </Badge>
      </div>
      <p className="text-caption text-muted-foreground">{result.message}</p>
      {result.requiresFollowUp && (
        <p className="text-caption text-muted-foreground">
          (Mock) SIRILA would ask a follow-up question here once real analysis is enabled.
        </p>
      )}
      {result.limitations && result.limitations.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-caption font-medium text-foreground">Limitations</p>
          <ul className="list-disc pl-4 text-caption text-muted-foreground">
            {result.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </div>
      )}
      {result.recommendedNextSteps && result.recommendedNextSteps.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-caption font-medium text-foreground">You could consider</p>
          <ul className="list-disc pl-4 text-caption text-muted-foreground">
            {result.recommendedNextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default VisualInsightProcessingResult

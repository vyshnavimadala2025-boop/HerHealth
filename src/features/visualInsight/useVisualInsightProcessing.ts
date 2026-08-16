import { useCallback, useRef, useState } from 'react'
import type { AnalyzeImageResult } from '@/features/aiIntelligence/aiProviderAbstraction'
import { getConsentState } from '@/features/aiIntelligence/consent'
import { getVisualInsightProvider, VisualInsightProviderError } from '@/features/visualInsight/provider'
import { mockSafetyScreeningStage } from '@/features/visualInsight/provider/mockSafetyStages'

const ERROR_CATEGORY_MESSAGE: Record<string, string> = {
  rate_limited: "You've reached today's Visual Insight processing limit. Please try again tomorrow.",
  invalid_image: 'This image is not ready to be processed. Please try uploading it again.',
  safety_verification_failed: 'This image could not be processed.',
}

export type ProcessingState = 'idle' | 'queued' | 'validating' | 'processing' | 'completed' | 'failed' | 'cancelled'

/**
 * Client-side processing state machine (Phase 3A.2). The underlying
 * mock RPC call is a single fast round trip — there is no real async job
 * queue — so 'queued'/'validating'/'processing' are UI-only states shown
 * around that one call, the same honest approach already used for
 * "Stop" on text messages in useConversation.ts, not a fabricated
 * multi-stage backend process.
 */
export function useVisualInsightProcessing() {
  const [state, setState] = useState<ProcessingState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeImageResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const process = useCallback(
    async (imageId: string | null | undefined, conversationId: string | null, userDescription: string | null) => {
      setError(null)
      setResult(null)

      if (!imageId) {
        setState('failed')
        setError('No image selected to process.')
        return
      }

      if (!getConsentState().imageAnalysis) {
        setState('failed')
        setError('Image analysis consent has been withdrawn. Grant it again in Settings → Privacy to continue.')
        return
      }

      const controller = new AbortController()
      abortRef.current = controller

      try {
        setState('queued')
        await new Promise((resolve) => setTimeout(resolve, 80))
        if (controller.signal.aborted) throw new DOMException('cancelled', 'AbortError')

        setState('validating')
        const screening = await mockSafetyScreeningStage.screen({ imageId })
        if (controller.signal.aborted) throw new DOMException('cancelled', 'AbortError')
        if (!screening.safe) {
          setState('failed')
          setError('This image could not be processed.')
          return
        }

        setState('processing')
        const provider = getVisualInsightProvider()
        const analysis = await provider.analyze({ imageId, conversationId, userDescription })
        if (controller.signal.aborted) throw new DOMException('cancelled', 'AbortError')

        setResult({
          status: 'mock',
          visualObservations: analysis.observations,
          uncertainty: analysis.uncertainty,
          requiresFollowUp: analysis.requiresFollowUp,
          safetyTier: analysis.safetyClassification,
          message: analysis.message,
          processedAt: analysis.processing.processedAt,
          limitations: analysis.limitations,
          recommendedNextSteps: analysis.recommendedNextSteps,
        })
        setState('completed')
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setState('cancelled')
          return
        }
        setState('failed')
        if (err instanceof VisualInsightProviderError) {
          if (err.providerDetail === 'already_processed') {
            setError('This image has already been processed.')
          } else {
            setError(ERROR_CATEGORY_MESSAGE[err.category] ?? 'We could not process this image. Please try again.')
          }
        } else {
          setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        }
      } finally {
        abortRef.current = null
      }
    },
    [],
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setError(null)
    setResult(null)
  }, [])

  return { state, error, result, process, cancel, reset }
}

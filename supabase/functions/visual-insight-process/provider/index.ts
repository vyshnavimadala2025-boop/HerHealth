import { ACTIVE_PROVIDER, OPENAI_ENABLED, VISUAL_INSIGHT_PROCESSING_ENABLED, XAI_ENABLED } from './config.ts'
import { mockServerProvider } from './mockProvider.ts'
import { openAiServerProvider } from './openaiAdapter.ts'
import { grokServerProvider } from './grokAdapter.ts'
import { VisualInsightProviderError, type VisualInsightServerProvider } from './types.ts'

export type { VisualInsightServerProvider, VisualInsightRequest, VisualInsightResult, RpcCapableClient } from './types.ts'
export { VisualInsightProviderError } from './types.ts'

/**
 * Provider factory (Phase 3A.4, kill switch added for Observability &
 * Rollback Readiness, xAI/Grok added as an adapter alongside OpenAI when
 * the provider target changed). Checks VISUAL_INSIGHT_PROCESSING_ENABLED
 * first — the emergency kill switch — before any provider-selection
 * logic. Beyond that: for either real adapter, two independent
 * conditions (ACTIVE_PROVIDER === that provider's name AND its own
 * *_ENABLED flag === true) must both hold before it is ever returned —
 * and even then, both openaiAdapter.ts's and grokAdapter.ts's analyze()
 * throw unconditionally today (see each file's header), so there is
 * currently no way to reach a real network call through this factory
 * regardless of how these constants are set. Requesting any other
 * provider name throws immediately rather than silently falling back to
 * mock, which would hide a misconfiguration.
 */
export function getServerVisualInsightProvider(): VisualInsightServerProvider {
  if (!VISUAL_INSIGHT_PROCESSING_ENABLED) {
    throw new VisualInsightProviderError(
      'provider_unavailable',
      'Visual Insight is temporarily unavailable. Please try again later.',
    )
  }

  if (ACTIVE_PROVIDER === 'mock') {
    return mockServerProvider
  }

  if (ACTIVE_PROVIDER === 'openai') {
    if (!OPENAI_ENABLED) {
      throw new Error(
        'SIRILA Visual Insight: OpenAI is configured as ACTIVE_PROVIDER but OPENAI_ENABLED is false. ' +
          'See supabase/functions/visual-insight-process/provider/config.ts.',
      )
    }
    return openAiServerProvider
  }

  if (ACTIVE_PROVIDER === 'xai') {
    if (!XAI_ENABLED) {
      throw new Error(
        'SIRILA Visual Insight: xAI/Grok is configured as ACTIVE_PROVIDER but XAI_ENABLED is false. ' +
          'See supabase/functions/visual-insight-process/provider/config.ts.',
      )
    }
    return grokServerProvider
  }

  throw new Error(
    `SIRILA Visual Insight: provider "${ACTIVE_PROVIDER}" is not implemented in this build. ` +
      'See supabase/functions/visual-insight-process/provider/config.ts.',
  )
}

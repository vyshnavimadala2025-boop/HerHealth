import { ACTIVE_PROVIDER, VISUAL_INSIGHT_PROCESSING_ENABLED } from '@/features/visualInsight/provider/config'
import { mockVisualInsightProvider } from '@/features/visualInsight/provider/mockProvider'
import { VisualInsightProviderError, type VisualInsightProvider } from '@/features/visualInsight/provider/types'

export type { VisualInsightProvider, VisualInsightRequest, VisualInsightResult } from '@/features/visualInsight/provider/types'
export { VisualInsightProviderError } from '@/features/visualInsight/provider/types'

/**
 * Provider factory (Phase 3A.3 §8, kill switch added for Observability &
 * Rollback Readiness). Checks VISUAL_INSIGHT_PROCESSING_ENABLED first —
 * the emergency kill switch — before any provider-selection logic, so a
 * rollback never depends on reasoning about which provider is active.
 * Beyond that: fails safe, requesting any provider other than 'mock'
 * throws immediately rather than silently falling back to mock (which
 * would hide a misconfiguration) or attempting a call with no
 * credentials. There is no code path in this repository, today, that can
 * construct a real provider instance.
 */
export function getVisualInsightProvider(): VisualInsightProvider {
  if (!VISUAL_INSIGHT_PROCESSING_ENABLED) {
    throw new VisualInsightProviderError(
      'provider_unavailable',
      'Visual Insight is temporarily unavailable. Please try again later.',
    )
  }

  if (ACTIVE_PROVIDER === 'mock') {
    return mockVisualInsightProvider
  }

  // Unreachable while ACTIVE_PROVIDER is hardcoded to 'mock' (see
  // config.ts) — kept as an explicit, typed failure rather than an
  // impossible branch, so that a future edit to ACTIVE_PROVIDER without a
  // matching real implementation fails loudly at call time instead of
  // silently.
  throw new Error(
    `SIRILA Visual Insight: provider "${ACTIVE_PROVIDER}" is not implemented in this build. ` +
      'No real provider is connected — see src/features/visualInsight/provider/config.ts.',
  )
}

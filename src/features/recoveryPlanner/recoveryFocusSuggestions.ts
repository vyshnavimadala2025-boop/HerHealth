import type { SleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import type { StressRecoverySummary } from '@/features/stressRecovery/stressRecoveryCalculations'

export interface RecoveryFocusSuggestion {
  key: string
  message: string
}

/**
 * "Understand a recovery focus" (Stage 3E requirement #4) — composes
 * honest, threshold-gated suggestions purely from Sleep Intelligence's
 * (Stage 3B) and Stress & Recovery's (Stage 3D) own real calculations, no
 * new data source and no new scoring. Every message describes only what
 * was actually tracked ("your recent sleep tracking has been
 * inconsistent") and never infers a medical condition or cause
 * ("you have insomnia" / "your sleep is causing your stress" are exactly
 * the phrasing this function must never produce). When no specific real
 * signal applies — including when there isn't enough data yet — this
 * returns an empty array; the caller shows a neutral starting message
 * rather than a fabricated concern.
 */
export function buildRecoveryFocusSuggestions(
  sleepSummary: SleepSummary,
  stressRecoverySummary: StressRecoverySummary,
): RecoveryFocusSuggestion[] {
  const suggestions: RecoveryFocusSuggestion[] = []

  if (sleepSummary.hasSufficientData && sleepSummary.consistencyPercent < 50) {
    suggestions.push({
      key: 'sleep-consistency',
      message:
        'Your recent sleep tracking has been inconsistent. You may want to focus on maintaining a consistent sleep routine.',
    })
  }

  if (stressRecoverySummary.hasSufficientData && stressRecoverySummary.recoveryTrend === 'Decreasing') {
    suggestions.push({
      key: 'recovery-trend',
      message:
        'Your tracked recovery level has been trending down recently. Making space for a recovery action that has helped before may be worth considering.',
    })
  }

  if (stressRecoverySummary.hasSufficientData && stressRecoverySummary.stressTrend === 'Rising') {
    suggestions.push({
      key: 'stress-trend',
      message: 'Your tracked stress level has been rising recently. A brief recovery action today may be worth considering.',
    })
  }

  return suggestions
}

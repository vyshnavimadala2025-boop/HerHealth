import { useEffect, useState } from 'react'
import { Fingerprint } from 'lucide-react'
import NextStepTile from '@/components/shared/NextStepTile'
import { getBaselineSummary, type BaselineSummary } from './baselineStore'
import { isInteractionIntelligenceEnabled } from './consent'

/**
 * Dashboard "Continue your journey" tile for Interaction Intelligence.
 * Reads real local state (never fake numbers) so the tile itself already
 * communicates whether this is a new discovery, an in-progress baseline,
 * an established one, or currently paused — rather than always showing
 * the same generic "explore" copy regardless of where the user actually
 * is with the feature.
 */
function InteractionIntelligenceDashboardTile() {
  const [ready, setReady] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [baseline, setBaseline] = useState<BaselineSummary | null>(null)

  useEffect(() => {
    setEnabled(isInteractionIntelligenceEnabled())
    setBaseline(getBaselineSummary())
    setReady(true)
  }, [])

  const description = (() => {
    if (!enabled) {
      return (baseline?.sessionCount ?? 0) > 0
        ? 'Currently off — tap to re-enable'
        : 'Discover your personal rhythm — optional, privacy-first'
    }
    if (baseline?.status === 'established') {
      return `${baseline.consistency ?? '—'}% consistency · Baseline established`
    }
    return `Building your baseline · ${baseline?.sessionCount ?? 0}/7 sessions`
  })()

  return (
    <NextStepTile
      icon={Fingerprint}
      label="Interaction Intelligence"
      description={description}
      href="/interaction-intelligence"
      isLoading={!ready}
      accentClassName="bg-peach text-peach-foreground"
    />
  )
}

export default InteractionIntelligenceDashboardTile

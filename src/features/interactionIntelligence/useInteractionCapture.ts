import { useEffect, useRef } from 'react'
import { computeTimingSamples, summarizeTimingSamples, type TimedEvent } from './timingMath'
import { recordSessionSummary } from './baselineStore'
import { isInteractionIntelligenceEnabled } from './consent'

const FLUSH_ON_EVENT_COUNT = 60

/**
 * App-wide capture, mounted once (see InteractionCaptureMount.tsx) and
 * active only when the user has explicitly consented. Listens at the
 * window level to real keydown/keyup — the same DATA FIREWALL boundary
 * as the public demo: only `event.code` (which physical key) and a
 * timestamp are read, `event.key`/`event.target.value` are never
 * touched, so there is no code path here that can see what was typed.
 * Flushes an aggregated session summary (never raw events) to
 * baselineStore periodically and on page unload/hide.
 */
export function useInteractionCapture(): void {
  const bufferRef = useRef<TimedEvent[]>([])

  useEffect(() => {
    if (!isInteractionIntelligenceEnabled()) return

    const flush = () => {
      if (bufferRef.current.length === 0) return
      const samples = computeTimingSamples(bufferRef.current)
      const summary = summarizeTimingSamples(samples)
      if (summary.sampleCount > 0) {
        recordSessionSummary(summary)
      }
      bufferRef.current = []
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      bufferRef.current.push({ id: event.code, type: 'down', atMs: performance.now() })
      if (bufferRef.current.length >= FLUSH_ON_EVENT_COUNT) flush()
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      bufferRef.current.push({ id: event.code, type: 'up', atMs: performance.now() })
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', flush)

    return () => {
      flush()
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', flush)
    }
  }, [])
}

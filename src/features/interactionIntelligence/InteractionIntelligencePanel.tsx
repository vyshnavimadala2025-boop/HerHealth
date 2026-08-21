import { useEffect, useState } from 'react'
import { ArrowRight, Fingerprint, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getBaselineSummary, SESSIONS_TO_ESTABLISH_BASELINE, type BaselineSummary } from './baselineStore'
import { isInteractionIntelligenceEnabled, setInteractionIntelligenceEnabled } from './consent'

const MEASURE_ROWS = ['Interaction timing', 'Rhythm consistency', 'Session patterns']
const NOT_NEEDED_ROWS = ['Message content', 'Passwords', 'Recipients']

function formatMs(value: number | null): string {
  return value === null ? '—' : `${Math.round(value)} ms`
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  return isToday ? 'Today' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function PanelIcon() {
  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
      <Fingerprint className="size-4" aria-hidden="true" />
    </div>
  )
}

/**
 * The authenticated-side face of Interaction Intelligence. Handles all
 * real states itself (never enabled / disabled-with-history / building /
 * established) rather than a separate onboarding-wizard step — the
 * existing OnboardingPage wizard (Welcome/Profile/Preferences/Consent/
 * Completion) is a sensitive, already-tested step-index flow, and
 * inserting a new step there risked exactly the kind of "replace working
 * architecture unnecessarily" this task explicitly warns against. This
 * still delivers a calm, premium first-time moment ("Build your personal
 * rhythm") — it's just reached by visiting this panel rather than forced
 * into signup.
 */
function InteractionIntelligencePanel() {
  const [enabled, setEnabled] = useState(false)
  const [baseline, setBaseline] = useState<BaselineSummary | null>(null)

  useEffect(() => {
    setEnabled(isInteractionIntelligenceEnabled())
    setBaseline(getBaselineSummary())
  }, [])

  const handleEnable = () => {
    setInteractionIntelligenceEnabled(true)
    setEnabled(true)
  }

  const handleDisable = () => {
    setInteractionIntelligenceEnabled(false)
    setEnabled(false)
  }

  const hasHistory = (baseline?.sessionCount ?? 0) > 0

  // Never enabled before: the full first-time consent pitch.
  if (!enabled && !hasHistory) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PanelIcon />
            <CardTitle>Build your personal rhythm</CardTitle>
          </div>
          <CardDescription>
            SIRILA can optionally learn interaction patterns from how you use your device. It
            does not need your message content.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 text-caption font-medium tracking-wide text-muted-foreground uppercase">We measure</p>
              <ul className="flex flex-col gap-1.5">
                {MEASURE_ROWS.map((row) => (
                  <li key={row} className="flex items-center gap-2 text-sm text-foreground">
                    <ShieldCheck className="size-3.5 shrink-0 text-support-foreground" aria-hidden="true" />
                    {row}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 text-caption font-medium tracking-wide text-muted-foreground uppercase">We don&apos;t need</p>
              <ul className="flex flex-col gap-1.5">
                {NOT_NEEDED_ROWS.map((row) => (
                  <li key={row} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="size-3.5 shrink-0" aria-hidden="true" />
                    {row}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-caption text-muted-foreground">
            These signals are not medical diagnoses. You can disable this at any time from this
            same panel.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={handleEnable}>
              Enable Interaction Intelligence
            </Button>
            <Button type="button" variant="ghost" className="text-muted-foreground">
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Explicitly disabled, but a baseline already exists — a calmer re-entry point, not the full pitch again.
  if (!enabled && hasHistory) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PanelIcon />
            <CardTitle>Interaction Intelligence</CardTitle>
          </div>
          <CardDescription>Interaction Intelligence is currently off.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-body text-muted-foreground">
            Your existing SIRILA experience continues normally. Your previous baseline is kept,
            but no new sessions are being recorded.
          </p>
          <Button type="button" onClick={handleEnable} className="w-fit">
            Enable again
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!baseline || baseline.status === 'no-data' || baseline.status === 'building') {
    const sessionCount = baseline?.sessionCount ?? 0
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PanelIcon />
            <CardTitle>Building your baseline</CardTitle>
          </div>
          <CardDescription>
            Your baseline becomes more reliable as SIRILA learns your normal rhythm.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-caption text-muted-foreground">
              <span>{sessionCount}</span>
              <span>{SESSIONS_TO_ESTABLISH_BASELINE} sessions</span>
            </div>
            <div
              role="progressbar"
              aria-label="Baseline sessions recorded"
              aria-valuenow={sessionCount}
              aria-valuemin={0}
              aria-valuemax={SESSIONS_TO_ESTABLISH_BASELINE}
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 motion-reduce:transition-none"
                style={{ width: `${Math.min(100, (sessionCount / SESSIONS_TO_ESTABLISH_BASELINE) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-caption text-muted-foreground">
            You don&apos;t need to do anything differently. Just use the app normally — your
            baseline builds quietly in the background.
          </p>
          <Button type="button" variant="outline" size="sm" className="w-fit text-muted-foreground" onClick={handleDisable}>
            Disable Interaction Intelligence
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PanelIcon />
          <CardTitle>Your SIRILA baseline</CardTitle>
        </div>
        <CardDescription>Established from {baseline.sessionCount} recorded sessions.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-center">
            <p className="text-lg font-medium text-foreground">{formatMs(baseline.medianDwellMs)}</p>
            <p className="text-caption text-muted-foreground">Dwell time</p>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-center">
            <p className="text-lg font-medium text-foreground">{formatMs(baseline.medianFlightMs)}</p>
            <p className="text-caption text-muted-foreground">Flight time</p>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-center">
            <p className="text-lg font-medium text-foreground">
              {baseline.consistency !== null ? `${baseline.consistency}%` : '—'}
            </p>
            <p className="text-caption text-muted-foreground">Rhythm consistency</p>
          </div>
          <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-center">
            <p className="text-lg font-medium text-support-foreground">Established</p>
            <p className="text-caption text-muted-foreground">Baseline confidence</p>
          </div>
        </div>

        <p className="text-caption text-muted-foreground">Last updated {formatRelativeDate(baseline.lastUpdated)}</p>

        {baseline.recentDwellDeviatesFromBaseline && (
          <div className="rounded-lg border border-attention/40 bg-attention/10 p-3">
            <p className="text-sm text-foreground">
              Your recent interaction rhythm differs from your personal baseline.
            </p>
            <p className="mt-1 text-caption text-muted-foreground">
              Changes can happen for many everyday reasons, including fatigue, environment, device
              changes, or other factors. SIRILA is not making a medical diagnosis. If you&apos;re
              concerned about how you&apos;re feeling, consider speaking with a qualified
              healthcare professional.
            </p>
          </div>
        )}

        <Button type="button" variant="outline" size="sm" className="w-fit text-muted-foreground" onClick={handleDisable}>
          Disable Interaction Intelligence
        </Button>
      </CardContent>
    </Card>
  )
}

export default InteractionIntelligencePanel

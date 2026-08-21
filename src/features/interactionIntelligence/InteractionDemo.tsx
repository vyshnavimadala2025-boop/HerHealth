import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { computeTimingSamples, summarizeTimingSamples, type TimedEvent } from './timingMath'
import PhoneFrame from './PhoneFrame'
import VirtualKeyboard from './VirtualKeyboard'
import RhythmVisualization from './RhythmVisualization'

const MAX_BUFFERED_EVENTS = 80
const MIN_SAMPLES_FOR_RESULT = 4
/** The bigger, "this is memorable" reveal — deliberately a higher bar than the first result so it reads as earned, not automatic. */
const MAGIC_MOMENT_THRESHOLD = 10
const MAX_TYPED_DOTS = 24
/** Modifier/navigation keys aren't representative "rhythm" presses (they're often held or chorded) — excluded from both timing and the masked-dot counter. */
const IGNORED_CODES = new Set([
  'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight',
  'MetaLeft', 'MetaRight', 'CapsLock', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
])

const SEES = ['Timing', 'Rhythm', 'Patterns']
const DOES_NOT_NEED = ['Words', 'Messages', 'Passwords']

const PARTICLES = [
  { top: '8%', left: '4%', duration: '5.5s', x: '10px', y: '-14px' },
  { top: '18%', left: '92%', duration: '6.5s', x: '-8px', y: '10px' },
  { top: '60%', left: '2%', duration: '7s', x: '12px', y: '8px' },
  { top: '75%', left: '95%', duration: '5s', x: '-10px', y: '-10px' },
  { top: '40%', left: '98%', duration: '6s', x: '-6px', y: '12px' },
]

/**
 * Public, pre-login demo — presented as a realistic SIRILA phone UI so a
 * visitor feels like they're touching the real product, not watching a
 * marketing animation. All the privacy/timing guarantees from the
 * original implementation are unchanged: everything lives in this
 * component's own React state for the lifetime of the page view (no
 * localStorage, no network request, no Supabase import anywhere in this
 * file). Both the on-screen virtual keyboard and physical keyboard typing
 * feed the SAME `handleKeyDown`/`handleKeyUp` pipeline, keyed only by
 * `event.code` (which physical key, never what character it produced) —
 * there is no code path in this component that can read, display, or
 * persist what was actually typed. The masked-dot counter below is a
 * separate, purely visual tally driven by key codes, not by reading any
 * input's value.
 */
function InteractionDemo() {
  const [eventLog, setEventLog] = useState<TimedEvent[]>([])
  const [activeCode, setActiveCode] = useState<string | null>(null)
  const [typedDots, setTypedDots] = useState(0)
  const typingSurfaceRef = useRef<HTMLDivElement>(null)

  const recordEvent = useCallback((id: string, type: 'down' | 'up') => {
    setEventLog((prev) => {
      const next = [...prev, { id, type, atMs: performance.now() }]
      return next.length > MAX_BUFFERED_EVENTS ? next.slice(-MAX_BUFFERED_EVENTS) : next
    })
  }, [])

  // Shared entry point for both the virtual keyboard and physical typing —
  // one timing implementation, two input sources.
  const handleKeyDown = useCallback(
    (code: string) => {
      if (IGNORED_CODES.has(code)) return
      recordEvent(`key-${code}`, 'down')
      setActiveCode(code)
      if (code === 'Backspace') {
        setTypedDots((prev) => Math.max(0, prev - 1))
      } else if (code !== 'Enter') {
        setTypedDots((prev) => Math.min(MAX_TYPED_DOTS, prev + 1))
      }
    },
    [recordEvent],
  )

  const handleKeyUp = useCallback(
    (code: string) => {
      if (IGNORED_CODES.has(code)) return
      recordEvent(`key-${code}`, 'up')
      setActiveCode((prev) => (prev === code ? null : prev))
    },
    [recordEvent],
  )

  // The phone's typing surface — no native <input>, so there is no
  // underlying text value to ever accidentally read. It only forwards the
  // physical key's code, exactly like the virtual keyboard does.
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.repeat) return
    handleKeyDown(event.code)
  }
  const handleInputKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    handleKeyUp(event.code)
  }

  const samples = useMemo(() => computeTimingSamples(eventLog), [eventLog])
  const summary = useMemo(() => summarizeTimingSamples(samples), [samples])
  const recentDwells = useMemo(() => samples.slice(-10).map((s) => s.dwellMs), [samples])
  const recentFlights = useMemo(
    () => samples.slice(-8).map((s) => s.flightMs).filter((f): f is number => f !== null),
    [samples],
  )
  const hasResult = samples.length >= MIN_SAMPLES_FOR_RESULT
  const hasMagicMoment = samples.length >= MAGIC_MOMENT_THRESHOLD

  const ambientCaption =
    samples.length === 0 ? 'Tap or type to begin' : samples.length < MIN_SAMPLES_FOR_RESULT ? 'Rhythm detected' : 'Pattern forming'

  const reset = () => {
    setEventLog([])
    setActiveCode(null)
    setTypedDots(0)
  }

  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col items-center gap-6">
      {/* Ambient particles — purely atmospheric, not a data visualization, desktop only */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        {PARTICLES.map((p, index) => (
          <span
            key={index}
            className="animate-particle-drift absolute size-1.5 rounded-full bg-peach/50 motion-reduce:animate-none"
            style={{
              top: p.top,
              left: p.left,
              '--particle-duration': p.duration,
              '--particle-x': p.x,
              '--particle-y': p.y,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-2 text-center">
        <p className="flex items-center gap-1.5 text-caption font-medium tracking-wide text-peach uppercase">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Live demo
        </p>
        <h3 className="font-display text-heading text-hero-panel-foreground">Experience your rhythm</h3>
        <p className="max-w-md text-body text-hero-panel-foreground/70">
          Interact naturally with SIRILA and discover your unique rhythm.
        </p>
      </div>

      <PhoneFrame dimmed={hasMagicMoment}>
        <div className="flex flex-col gap-3 px-4 pt-1.5 pb-4 sm:px-5 sm:pb-5">
          <div className="flex flex-col items-center gap-0.5 pt-1 text-center">
            <p className="font-display text-sm font-semibold text-hero-panel-foreground">SIRILA</p>
            <p className="text-[10px] text-hero-panel-foreground/50">Your personal health companion</p>
          </div>

          <p className="mt-1 text-center text-sm text-hero-panel-foreground/85">How are you feeling today?</p>

          <div
            ref={typingSurfaceRef}
            role="textbox"
            aria-readonly="true"
            aria-label="Demo typing surface — timing only; what you type is never read, shown, or stored"
            tabIndex={0}
            onKeyDown={handleInputKeyDown}
            onKeyUp={handleInputKeyUp}
            onClick={() => typingSurfaceRef.current?.focus()}
            className="flex h-9 cursor-text items-center rounded-lg border border-hero-panel-foreground/15 bg-hero-panel-foreground/5 px-3 outline-none focus-visible:border-peach/50 sm:h-10"
          >
            {typedDots > 0 ? (
              <span aria-hidden="true" className="text-sm tracking-widest text-hero-panel-foreground/70">
                {'•'.repeat(typedDots)}
              </span>
            ) : (
              <span className="text-sm text-hero-panel-foreground/35">Type naturally...</span>
            )}
          </div>

          <VirtualKeyboard activeCode={activeCode} onKeyPress={handleKeyDown} onKeyRelease={handleKeyUp} />

          <div className="mt-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] text-hero-panel-foreground/50">
              <span>{ambientCaption}</span>
              <span>{samples.length} samples</span>
            </div>
            <div
              role="progressbar"
              aria-label="Consistency"
              aria-valuenow={summary.consistency ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 w-full overflow-hidden rounded-full bg-hero-panel-foreground/10"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-peach to-hero-panel-accent transition-all duration-500 motion-reduce:transition-none"
                style={{ width: `${summary.consistency ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </PhoneFrame>

      {!hasMagicMoment ? (
        <div className="flex flex-col items-center gap-3">
          <RhythmVisualization dwells={recentDwells} flights={recentFlights} />
          <p className="text-caption text-hero-panel-foreground/60">{ambientCaption}</p>

          {hasResult && (
            <div className="flex items-center gap-6 animate-fade-in-up">
              <div className="text-center">
                <p className="text-lg font-medium text-hero-panel-foreground">{formatMs(summary.medianDwellMs)}</p>
                <p className="text-caption text-hero-panel-foreground/50">Dwell</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-hero-panel-foreground">{formatMs(summary.medianFlightMs)}</p>
                <p className="text-caption text-hero-panel-foreground/50">Flight</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-hero-panel-foreground">
                  {summary.consistency !== null ? `${summary.consistency}%` : '—'}
                </p>
                <p className="text-caption text-hero-panel-foreground/50">Consistency</p>
              </div>
            </div>
          )}

          <p className="w-fit rounded-full border border-hero-panel-foreground/15 px-3 py-1 text-center text-caption text-hero-panel-foreground/50">
            Demo signal — not a health assessment
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-5 rounded-2xl border border-peach/20 bg-hero-panel-foreground/[0.04] p-6 text-center animate-fade-in-up sm:p-8">
          <RhythmVisualization dwells={recentDwells} flights={recentFlights} />

          <div>
            <p className="font-display text-title text-hero-panel-foreground sm:text-display">
              That&apos;s your <span className="text-peach italic">rhythm.</span>
            </p>
            <p className="mt-1 text-body text-hero-panel-foreground/70">Your interaction pattern is uniquely yours.</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-lg font-medium text-hero-panel-foreground">{formatMs(summary.medianDwellMs)}</p>
              <p className="text-caption text-hero-panel-foreground/50">Dwell</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-hero-panel-foreground">{formatMs(summary.medianFlightMs)}</p>
              <p className="text-caption text-hero-panel-foreground/50">Flight</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-hero-panel-foreground">
                {summary.consistency !== null ? `${summary.consistency}%` : '—'}
              </p>
              <p className="text-caption text-hero-panel-foreground/50">Consistency</p>
            </div>
          </div>

          <p className="w-fit rounded-full border border-hero-panel-foreground/15 px-3 py-1 text-caption text-hero-panel-foreground/50">
            Demo signal — not a health assessment
          </p>

          <p className="max-w-md text-body text-hero-panel-foreground/70">
            With your permission, SIRILA can learn how your rhythm changes over time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-caption">
            <span className="flex items-center gap-1.5 text-support">
              <Check className="size-3.5 shrink-0" aria-hidden="true" />
              {SEES.join(' · ')}
            </span>
            <span className="flex items-center gap-1.5 text-hero-panel-foreground/35 line-through decoration-hero-panel-foreground/25">
              <X className="size-3.5 shrink-0" aria-hidden="true" />
              {DOES_NOT_NEED.join(' · ')}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-hero-panel-foreground text-hero-panel transition-transform duration-200 hover:-translate-y-0.5 hover:bg-hero-panel-foreground/90"
            >
              <Link to="/signup">
                Start My SIRILA Journey
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-hero-panel-foreground/70 hover:text-hero-panel-foreground">
              <Link to="/how-it-works">Learn How It Works</Link>
            </Button>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-caption text-hero-panel-foreground/50 underline-offset-2 hover:text-hero-panel-foreground/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach/60 rounded"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

function formatMs(value: number | null): string {
  return value === null ? '—' : `${Math.round(value)} ms`
}

export default InteractionDemo

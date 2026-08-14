import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BedDouble,
  Footprints,
  HeartHandshake,
  Leaf,
  Moon,
  NotebookPen,
  Scale,
  Sparkles,
  Sun,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePcosWellnessData } from '@/features/pcosWellness/usePcosWellnessData'
import EmptyState from '@/components/shared/EmptyState'
import Skeleton from '@/components/shared/Skeleton'
import PcosWellnessOptIn from '@/features/pcosWellness/PcosWellnessOptIn'
import PcosWellnessForm from '@/features/pcosWellness/PcosWellnessForm'
import PcosWellnessHistory from '@/features/pcosWellness/PcosWellnessHistory'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import type { PcosWellnessEntry } from '@/features/pcosWellness/types'
import { cn } from '@/lib/utils'
import pcosWellnessImage from '@/assets/images/pcos-pcod-wellness-hero.png'

/**
 * These five map directly to the real OBSERVATION_OPTIONS tracked by
 * PcosWellnessForm (skin/hair, weight/appetite, sleep/fatigue, digestive,
 * plus the free-text note) — not an invented feature list, so the hero's
 * promise matches what the functional tracker below actually records.
 */
const TRACK_ITEMS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Sparkles,
    title: 'Skin & hair',
    description: 'Notice changes in skin or hair growth patterns.',
  },
  {
    icon: Scale,
    title: 'Weight & appetite',
    description: 'Track shifts in weight, appetite, or cravings.',
  },
  {
    icon: Moon,
    title: 'Sleep & energy',
    description: 'Record sleep pattern changes and fatigue.',
  },
  {
    icon: Leaf,
    title: 'Digestive wellness',
    description: 'Note digestive changes whenever they occur.',
  },
  {
    icon: NotebookPen,
    title: 'Personal notes',
    description: 'Add your own reflections in a private note.',
  },
]

const HABIT_ITEMS: { icon: LucideIcon; title: string; description: string; href?: string }[] = [
  {
    icon: Sun,
    title: 'Gentle daily routines',
    description: 'Small, repeatable moments of care rather than strict rules.',
  },
  {
    icon: BedDouble,
    title: 'Rest and sleep awareness',
    description: 'Notice how rest shows up in how you feel day to day.',
  },
  {
    icon: Footprints,
    title: 'Movement at your own pace',
    description: 'Whatever movement feels good to you, on your own schedule.',
  },
  {
    icon: Target,
    title: 'Personal wellness goals',
    description: 'Set your own goals and track progress in Goals & Progress.',
    href: '/goals',
  },
  {
    icon: HeartHandshake,
    title: 'Reflection and consistency',
    description: 'Showing up gently and regularly matters more than perfectly.',
  },
]

const PATTERN_DAYS = [true, true, false, true, true, true, false, false, true, true, true, false, true, true]

function CheckInRhythmPreview() {
  return (
    <div aria-hidden="true" className="flex items-end gap-1.5">
      {PATTERN_DAYS.map((filled, index) => (
        <div
          key={index}
          className={cn(
            'h-6 w-full flex-1 rounded-full sm:h-8',
            filled ? 'bg-support' : 'bg-muted',
          )}
        />
      ))}
    </div>
  )
}

/**
 * /wellness-tracker is a protected, authenticated-only route (see
 * App.tsx's ProtectedRoute + RequireOnboarding wrapping) — a signed-in
 * user can never reach it without already having an account, and
 * PublicOnlyRoute would immediately bounce them away from /signup if
 * they tried it. So unlike a public marketing page, the hero CTAs here
 * point at the real functional section on this same page (`#tracker`)
 * and the real Dashboard/Goals routes, not at signup — a literal
 * "Start Your Wellness Journey" → /signup link would be a dead-end for
 * every user who could actually see it.
 */
function WellnessTrackerPage() {
  const {
    enabled,
    enabledStatus,
    isTogglingEnabled,
    toggleEnabled,
    toggleError,
    entries,
    entriesStatus,
    create,
    update,
    removeEntry,
    retry,
    suggestedDefault,
  } = usePcosWellnessData()
  const [editingEntry, setEditingEntry] = useState<PcosWellnessEntry | null>(null)

  const handleSaved = () => setEditingEntry(null)

  const handleDeleted = (entryId: string) => {
    removeEntry(entryId)
    if (editingEntry?.id === entryId) {
      setEditingEntry(null)
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <section
        className="relative bg-hero-panel lg:flex lg:min-h-[560px] lg:items-center xl:min-h-[640px]"
        aria-labelledby="pcos-hero-heading"
      >
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-14 pb-8 sm:px-6 md:pt-16 lg:py-20">
          <div className="ml-auto flex max-w-lg animate-in fade-in slide-in-from-bottom-4 flex-col items-start gap-6 text-left duration-700">
            <p className="text-caption font-medium tracking-[0.14em] text-hero-panel-accent uppercase">
              PCOS/PCOD Wellness
            </p>
            <h1 id="pcos-hero-heading" className="text-title font-display sm:text-display">
              <span className="block text-hero-panel-foreground">Understand Your Patterns.</span>
              <span className="block text-hero-panel-accent">Support Your Wellbeing.</span>
            </h1>
            <p className="text-body-lg text-hero-panel-foreground/80">
              SIRILA helps you notice patterns, track your daily wellness, and build supportive
              routines at your own pace.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-hero-panel-foreground text-hero-panel hover:bg-hero-panel-foreground/90 sm:w-auto"
              >
                <a href="#tracker">Start Your Wellness Journey</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-hero-panel-foreground/40 bg-transparent text-hero-panel-foreground hover:bg-hero-panel-foreground/10 sm:w-auto"
              >
                <Link to="/dashboard">Explore Wellness Tools</Link>
              </Button>
            </div>
          </div>
        </div>

        <div
          role="img"
          aria-label="A woman relaxing at home, viewing a wellness app on her phone in a calm, warm setting"
          className="h-[360px] w-full animate-in fade-in bg-cover bg-[38%_28%] duration-1000 sm:h-[420px] md:h-[480px] lg:hidden"
          style={{ backgroundImage: `url(${pcosWellnessImage})` }}
        />
        <div
          role="img"
          aria-label="A woman relaxing at home, viewing a wellness app on her phone in a calm, warm setting"
          className="hidden animate-in fade-in duration-1000 lg:absolute lg:inset-0 lg:z-0 lg:block lg:bg-cover lg:bg-[58%_38%]"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(28, 8, 25, 0.02) 0%, rgba(28, 8, 25, 0.1) 52%, rgba(28, 8, 25, 0.62) 78%, rgba(28, 8, 25, 0.85) 100%), url(${pcosWellnessImage})`,
          }}
        />
      </section>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-4 py-16 sm:px-6">
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-heading text-foreground">Understand your wellness</h2>
          <p className="text-body text-muted-foreground">
            Every wellness experience is different. Tracking your everyday patterns — how you feel,
            what you notice, and what changes over time — can help you build a clearer picture of
            your own wellbeing. SIRILA does not diagnose, treat, or claim to cure PCOS or PCOD;
            it simply gives you a private space to notice what matters to you, at your own pace.
          </p>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="font-display text-heading text-foreground">Track what matters to you</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {TRACK_ITEMS.map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush text-primary">
                  <item.icon className="size-4.5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-caption text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-heading text-foreground">Notice patterns over time</h2>
            <p className="text-body text-muted-foreground">
              Regular, low-pressure check-ins can help patterns become easier to notice over time —
              no streaks to keep, no scores to hit.
            </p>
          </div>
          <div className="rounded-xl bg-muted/30 p-5">
            <CheckInRhythmPreview />
            <p className="mt-3 text-caption text-muted-foreground">
              Illustrative example, not your actual data — your own check-in rhythm appears in Your
              Wellness History below once you start recording entries.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="font-display text-heading text-foreground">Build supportive habits</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {HABIT_ITEMS.map((item) => {
              const content = (
                <>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lavender text-primary">
                    <item.icon className="size-4.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-caption text-muted-foreground">{item.description}</p>
                  </div>
                </>
              )
              return item.href ? (
                <Link
                  key={item.title}
                  to={item.href}
                  className="group -m-1 flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-muted/40"
                >
                  {content}
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              ) : (
                <div key={item.title} className="flex gap-3">
                  {content}
                </div>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2 text-center">
          <h2 className="font-display text-heading text-foreground">Your wellness, your pace</h2>
          <p className="mx-auto max-w-xl text-body text-muted-foreground">
            SIRILA is here to support self-awareness, not to add pressure or judgment. There is
            no right way to do this — recording a little or a lot, often or occasionally, is
            entirely up to you.
          </p>
        </section>

        <section className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-5">
          <div className="flex items-center gap-2">
            <PrivacyBadge />
          </div>
          <p className="text-caption text-muted-foreground">
            Your personal wellness information stays private to your account and under your
            control. Read more on our{' '}
            <Link to="/privacy" className="text-primary underline underline-offset-2">
              Privacy
            </Link>{' '}
            page.
          </p>
        </section>
      </div>

      <div id="tracker" className="scroll-mt-20 bg-blush/10">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-12 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
          <PageHeader
            title="PCOS/PCOD Wellness Tracking"
            description="PCOS/PCOD wellness tracking is optional and is intended only for recording personal observations."
            captions={[
              'Recording these observations does not diagnose PCOS/PCOD or replace advice from a qualified healthcare professional.',
            ]}
          />

          {enabledStatus === 'loading' && (
            <div role="status" className="flex flex-col gap-3">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <span className="sr-only">Loading your wellness tracking preference…</span>
            </div>
          )}

          {enabledStatus === 'error' && (
            <div role="alert" className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t load your wellness tracking preference. Please try again.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            </div>
          )}

          {enabledStatus === 'ready' && (
            <PcosWellnessOptIn
              enabled={enabled}
              isToggling={isTogglingEnabled}
              suggestedDefault={suggestedDefault}
              error={toggleError}
              onChange={toggleEnabled}
            />
          )}

          {enabledStatus === 'ready' && !enabled && (
            <EmptyState
              icon={Leaf}
              title="Wellness tracking is turned off"
              description="You can enable it above at any time to start recording entries."
            />
          )}

          {enabledStatus === 'ready' && enabled && (
            <>
              <PcosWellnessForm
                editingEntry={editingEntry}
                onCreate={create}
                onUpdate={update}
                onSaved={handleSaved}
                onCancelEdit={() => setEditingEntry(null)}
              />

              <PcosWellnessHistory
                status={entriesStatus}
                entries={entries}
                onEdit={setEditingEntry}
                onDeleted={handleDeleted}
                onRetry={retry}
              />
            </>
          )}
        </div>
      </div>

      <p className="mx-auto w-full max-w-2xl px-4 pb-12 text-center text-caption text-muted-foreground sm:px-6">
        SIRILA supports personal wellness awareness and is not a substitute for professional
        medical advice.
      </p>
    </main>
  )
}

export default WellnessTrackerPage

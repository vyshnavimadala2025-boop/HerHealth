import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Compass,
  HeartPulse,
  LineChart,
  Lock,
  NotebookPen,
  Sparkles,
  SlidersHorizontal,
  Sun,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import aboutImage from '@/assets/images/herhealth-about-hero.png'

const VALUE_POINTS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Compass,
    title: 'Understand',
    description: 'Bring your daily wellness, cycle information, and personal patterns into one clear view.',
  },
  {
    icon: NotebookPen,
    title: 'Reflect',
    description: 'Create a private space for thoughts, emotions, experiences, and meaningful moments.',
  },
  {
    icon: TrendingUp,
    title: 'Grow',
    description: 'Build sustainable wellness habits through small goals, gentle guidance, and progress insights.',
  },
]

const MODULES: { icon: LucideIcon; name: string; description: string; href: string }[] = [
  {
    icon: Sun,
    name: 'Daily Check-Ins',
    description: 'Log your mood, energy, and wellbeing in moments each day.',
    href: '/dashboard#checkin',
  },
  {
    icon: HeartPulse,
    name: 'Cycle Tracking',
    description: 'Record your cycle and review your own recorded patterns over time.',
    href: '/cycle-tracker',
  },
  {
    icon: BookOpen,
    name: 'Private Journal',
    description: 'A private space for your own reflections, always yours alone.',
    href: '/journal',
  },
  {
    icon: Target,
    name: 'Wellness Goals',
    description: 'Set personal wellness goals and track your own progress.',
    href: '/goals',
  },
  {
    icon: ClipboardList,
    name: 'Personal Reports',
    description: "A clear, private summary of what you've recorded — export or delete anytime.",
    href: '/reports',
  },
  {
    icon: LineChart,
    name: 'Wellness Insights',
    description: "See the patterns in what you've recorded, described in plain, non-diagnostic language.",
    href: '/dashboard#insights',
  },
]

const TRUST_POINTS: { icon: LucideIcon; title: string }[] = [
  { icon: Lock, title: 'Private by Design' },
  { icon: SlidersHorizontal, title: 'You Control Your Data' },
  { icon: HeartPulse, title: 'Built for Respectful Wellness Support' },
]

/**
 * The hero mirrors the approved landing-page hero's mechanics (full-bleed
 * background below `lg`'s width, stacked block above it) since that split
 * was already proven necessary — cover always shows a landscape image's
 * full height on a viewport proportioned taller than the image, so no
 * background-position value creates clearance without cropping the
 * subject. Unlike the landing hero, this photo's negative space is
 * naturally bright, so the overlay here is a light warm wash (not a dark
 * one) and body text stays the page's normal dark foreground color.
 */
const HERO_OVERLAY =
  'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 252, 250, 0.45) 55%, rgba(255, 252, 250, 0.82) 100%)'

function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative bg-background lg:flex lg:min-h-[560px] lg:items-center xl:min-h-[680px]">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-10 pb-6 sm:px-6 lg:py-16">
          <div className="flex max-w-lg animate-in fade-in slide-in-from-bottom-4 flex-col items-start gap-5 text-left duration-700 lg:ml-auto">
            <p className="text-caption font-medium tracking-[0.14em] text-light-panel-foreground/70 uppercase">
              About SIRILA
            </p>
            <h1 className="text-title font-display text-light-panel-foreground sm:text-display">
              Wellness begins with understanding yourself.
            </h1>
            <p className="text-body-lg text-light-panel-muted">
              SIRILA brings your daily wellness, cycle awareness, personal reflections, goals, and
              meaningful insights together in one private and supportive space.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/signup">Begin Your Wellness Journey</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-light-panel-foreground/25 bg-hero-panel-foreground/70 text-light-panel-foreground hover:bg-hero-panel-foreground/90 sm:w-auto"
              >
                <Link to="/how-it-works">Explore How It Works</Link>
              </Button>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="h-[360px] w-full animate-in fade-in bg-cover bg-[32%_30%] duration-1000 sm:h-[420px] md:h-[480px] lg:hidden"
          style={{ backgroundImage: `url(${aboutImage})` }}
        />
        <div
          aria-hidden="true"
          className="hidden animate-in fade-in duration-1000 lg:absolute lg:inset-0 lg:z-0 lg:block lg:bg-cover lg:bg-[12%_34%] xl:bg-[18%_center]"
          style={{ backgroundImage: `${HERO_OVERLAY}, url(${aboutImage})` }}
        />
      </section>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-4 py-16 sm:px-6">
        <section className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <div className="flex flex-col gap-4 lg:w-1/2">
            <h2 className="font-display text-heading text-foreground">
              Designed around your journey — not a one-size-fits-all routine.
            </h2>
            <p className="text-body text-muted-foreground">
              Every wellness journey is personal. SIRILA was created to help you notice patterns,
              reflect on how you feel, build supportive habits, and understand your wellbeing over
              time — without pressure or judgment.
            </p>
            <p className="border-l-2 border-primary/30 pl-4 font-display text-lg text-foreground text-balance">
              &ldquo;Personal wellness information is often scattered across notes apps, calendars, and
              memory. SIRILA brings it together in one private, organized space — without turning
              it into something clinical.&rdquo;
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:w-1/2">
            {VALUE_POINTS.map((value) => (
              <div key={value.title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <value.icon className="size-4.5" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <h3 className="font-display text-base text-foreground">{value.title}</h3>
                  <p className="text-caption text-muted-foreground">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-heading text-foreground">
              Your wellbeing is more than one number.
            </h2>
            <p className="text-body text-muted-foreground">
              SIRILA helps you view your wellness as a connected journey — including your daily
              feelings, cycle awareness, personal reflections, goals, and progress.
            </p>
          </div>

          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
            {MODULES.map((module) => (
              <Link
                key={module.name}
                to={module.href}
                className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted/40 sm:p-5"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <module.icon className="size-4.5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base text-foreground">{module.name}</p>
                  <p className="text-caption text-muted-foreground">{module.description}</p>
                </div>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-heading text-foreground">
              Thoughtful insights, shaped around your journey.
            </h2>
            <p className="text-body text-muted-foreground">
              SIRILA looks at the patterns in what you record — check-ins, mood, energy, and cycle
              history — and reflects them back to you in plain, supportive language, so you can notice
              what&apos;s working and consider what might help next.
            </p>
          </div>

          <div className="flex gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-support text-support-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
                Example insight
              </p>
              <p className="text-body text-foreground">
                You&apos;ve been feeling more energized on days when you maintain your wellness
                routine. Consider continuing the habits that are helping you feel supported.
              </p>
            </div>
          </div>

          <p className="text-caption text-muted-foreground">
            These reflections are based only on the information you choose to record. They are not
            medical advice, a diagnosis, or a prediction — for any medical concern, please consult a
            qualified healthcare professional. Read our{' '}
            <Link to="/medical-disclaimer" className="text-primary underline underline-offset-2">
              Medical Disclaimer
            </Link>{' '}
            for more.
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-heading text-foreground">Your story remains yours.</h2>
            <p className="text-body text-muted-foreground">
              Personal wellness information deserves care. SIRILA is designed with privacy, user
              control, and respectful data handling at the center of the experience.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
                  <point.icon className="size-4" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-medium text-foreground">{point.title}</h3>
              </div>
            ))}
          </div>

          <Link
            to="/privacy"
            className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Learn about Privacy
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section className="bg-hero-panel">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
          <h2 className="max-w-md text-title font-display text-hero-panel-foreground">
            A more connected way to care for yourself.
          </h2>
          <p className="max-w-md text-body text-hero-panel-foreground/80">
            Start understanding your wellness one day, one reflection, and one meaningful step at a
            time.
          </p>
          <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full bg-hero-panel-foreground text-hero-panel hover:bg-hero-panel-foreground/90 sm:w-auto"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-hero-panel-foreground/40 bg-transparent text-hero-panel-foreground hover:bg-hero-panel-foreground/10 sm:w-auto"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AboutPage

import { Link } from 'react-router-dom'
import { BookMarked, Compass, NotebookPen, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScrollReveal from '@/components/shared/ScrollReveal'
import AmbientOrb from '@/components/shared/AmbientOrb'
import SirilaGlassCard from '@/components/shared/SirilaGlassCard'
import howItWorksImage from '@/assets/images/how-it-works-hero.png'

const STEPS = [
  {
    icon: NotebookPen,
    accent: 'bg-lavender text-lavender-foreground',
    title: 'Record',
    description:
      'Track what matters to you: a daily check-in, a cycle date, a journal entry, a wellness goal. Each takes moments, and nothing is required beyond what you choose to enter.',
  },
  {
    icon: Compass,
    accent: 'bg-blush text-blush-foreground',
    title: 'Understand',
    description:
      'Review your recorded patterns — check-in consistency, mood and energy trends, cycle history, and goal progress — described in plain, non-diagnostic language, based only on your own data.',
  },
  {
    icon: BookMarked,
    accent: 'bg-support text-support-foreground',
    title: 'Reflect',
    description:
      'Use your private journal, personal timeline, and wellness reports to build a more organized view of your wellness journey over time, and export or delete your data whenever you choose.',
  },
]

function HowItWorksPage() {
  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 overflow-hidden px-4 py-14 sm:px-6">
      <AmbientOrb color="var(--primary)" size={520} top="-220px" left="50%" className="-translate-x-1/2" opacity={0.14} />
      <AmbientOrb color="var(--lavender)" size={380} top="120px" right="-140px" opacity={0.16} />

      <div className="relative flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
        <p className="text-caption font-medium tracking-wide text-primary uppercase">How It Works</p>
        <h1 className="text-title font-display text-foreground">How SIRILA Works</h1>
        <p className="text-body text-muted-foreground">
          SIRILA follows a simple, three-step rhythm — record, understand, reflect — built around
          information you choose to share.
        </p>
      </div>

      <figure className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
        <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
          <img
            src={howItWorksImage}
            alt="Three moments in a SIRILA routine: journaling by candlelight, reviewing personal insights on the SIRILA app, and a quiet mindfulness practice"
            width={1672}
            height={941}
            loading="eager"
            decoding="async"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
        <figcaption className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-caption text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-lavender" aria-hidden="true" />
            Record
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blush" aria-hidden="true" />
            Understand
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-support" aria-hidden="true" />
            Reflect
          </span>
        </figcaption>
      </figure>

      <SirilaGlassCard tone="light" className="relative flex flex-col gap-8 p-6 shadow-sm sm:p-8">
        {STEPS.map((step, index) => (
          <ScrollReveal key={step.title} delay={index * 100}>
            <div className="relative flex gap-4">
              {index < STEPS.length - 1 && (
                <div
                  className="absolute top-12 left-6 h-[calc(100%+2rem)] w-px bg-gradient-to-b from-primary/40 to-transparent"
                  aria-hidden="true"
                />
              )}
              <div
                className={`relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full ${step.accent} font-display text-lg transition-transform duration-300`}
              >
                <step.icon className="size-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1 pt-1.5">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
                  Step {index + 1}
                </p>
                <h2 className="font-display text-lg text-foreground">{step.title}</h2>
                <p className="text-body text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </SirilaGlassCard>

      <section className="flex gap-3 rounded-2xl border border-border bg-muted/30 p-5">
        <ShieldOff className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base text-foreground">
            A note on what SIRILA doesn&apos;t do
          </h2>
          <p className="text-body text-muted-foreground">
            SIRILA does not diagnose conditions, predict illness or fertility, assess medical risk,
            or recommend treatment. Everything you see is a description of information you recorded,
            not a medical conclusion.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="h-11">
          <Link to="/signup">Start Your Wellness Journey</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </main>
  )
}

export default HowItWorksPage

import {
  Bell,
  Brain,
  Fingerprint,
  Lightbulb,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react'
import ScrollReveal from '@/components/shared/ScrollReveal'
import InteractionDemo from './InteractionDemo'

interface PipelineStep {
  icon: LucideIcon
  label: string
}

const PIPELINE: PipelineStep[] = [
  { icon: Fingerprint, label: 'Touch' },
  { icon: Waves, label: 'Rhythm' },
  { icon: Sparkles, label: 'Pattern' },
  { icon: Target, label: 'Personal Baseline' },
  { icon: Lightbulb, label: 'Insight' },
]

interface HowItWorksStep {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

const HOW_IT_WORKS: HowItWorksStep[] = [
  { number: '01', icon: Smartphone, title: 'Interact', description: 'You use your device naturally.' },
  { number: '02', icon: Brain, title: 'Understand', description: 'SIRILA measures optional interaction timing signals.' },
  { number: '03', icon: TrendingUp, title: 'Learn', description: 'Your personal baseline develops over time.' },
  { number: '04', icon: Bell, title: 'Notice', description: 'SIRILA helps you notice meaningful changes.' },
]

const SIRILA_SEES = ['Timing', 'Rhythm', 'Patterns']
const SIRILA_DOES_NOT_NEED = ['Words', 'Messages', 'Passwords', 'Recipients']

interface ExplainerCard {
  question: string
  answer: string
}

const EXPLAINERS: ExplainerCard[] = [
  {
    question: 'What is it?',
    answer: 'An optional way for SIRILA to understand your personal interaction rhythm.',
  },
  {
    question: 'Why is it different?',
    answer: 'It learns patterns without needing to understand your private words.',
  },
  {
    question: 'Why should I care?',
    answer: 'It can help you notice changes in your own rhythm over time.',
  },
]

/**
 * SIRILA Interaction Intelligence — the flagship, pre-login-visible
 * behavioral-timing feature. Deliberately distinct from the existing
 * SirilaIntelligenceSection (the AI chat teaser) even though both sit on
 * the dark hero-panel surface — this one leads with the pipeline
 * visualization and a live, client-only demo rather than a chat preview.
 *
 * Every number shown in this section (and inside InteractionDemo) is
 * either clearly labeled illustrative/demo, or — for the pipeline and
 * dwell/flight diagrams below — static explanatory content, never a real
 * measurement presented as a health finding. No claim here says or
 * implies diagnosis; see the disclaimer text in the privacy grid.
 */
function InteractionIntelligenceSection() {
  return (
    <section className="relative overflow-hidden bg-hero-panel">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 55% at 85% 0%, color-mix(in oklch, var(--peach), transparent 88%) 0%, transparent 100%), ' +
            'radial-gradient(45% 50% at 5% 100%, color-mix(in oklch, var(--lavender), transparent 88%) 0%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-4 px-4 pt-20 pb-4 text-center sm:px-6 lg:pt-28">
        <ScrollReveal>
          <p className="flex items-center justify-center gap-1.5 text-caption font-medium tracking-[0.16em] text-peach uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            SIRILA Proprietary · Experimental
          </p>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <h2 className="max-w-3xl text-title font-display text-hero-panel-foreground sm:text-display">
            SIRILA learns the signals behind your everyday interactions.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={140}>
          <p className="max-w-xl text-body-lg text-hero-panel-foreground/75">
            Your health journey is personal. SIRILA can optionally learn subtle interaction
            patterns — without needing to read what you type.
          </p>
        </ScrollReveal>
      </div>

      {/* What is it / Why different / Why care — the three questions a visitor needs answered in seconds */}
      <div className="relative mx-auto grid w-full max-w-4xl grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-3 sm:px-6">
        {EXPLAINERS.map((item, index) => (
          <ScrollReveal key={item.question} delay={index * 90}>
            <div className="flex h-full flex-col gap-1.5 rounded-2xl border border-hero-panel-foreground/10 bg-hero-panel-foreground/[0.03] p-5 text-left">
              <p className="text-caption font-medium tracking-wide text-peach uppercase">{item.question}</p>
              <p className="text-sm text-hero-panel-foreground/80">{item.answer}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Pipeline visualization: Touch -> Rhythm -> Pattern -> Personal Baseline -> Insight */}
      <ScrollReveal delay={200}>
        <div className="relative mx-auto flex w-full max-w-4xl flex-wrap items-start justify-center gap-x-2 gap-y-8 px-4 py-10 sm:px-6 sm:gap-x-0">
          {PIPELINE.map((step, index) => (
            <div key={step.label} className="relative flex flex-1 basis-1/3 flex-col items-center gap-2 sm:basis-auto">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-6 right-1/2 hidden h-px w-full bg-gradient-to-r from-transparent via-hero-panel-foreground/25 to-transparent sm:block"
                  style={{ transform: 'translateX(50%)' }}
                />
              )}
              <div className="relative flex size-12 items-center justify-center rounded-full border border-peach/30 bg-peach/10 text-peach shadow-[0_0_20px_color-mix(in_oklch,var(--peach),transparent_75%)] sm:size-14">
                <step.icon className="size-5" aria-hidden="true" />
              </div>
              <p className="text-caption font-medium text-hero-panel-foreground/80 sm:text-sm">{step.label}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Interactive demo */}
      <div className="relative px-4 pt-6 pb-20 sm:px-6">
        <ScrollReveal>
          <InteractionDemo />
        </ScrollReveal>
      </div>

      {/* Dwell / flight time explainer */}
      <div className="relative mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 px-4 pb-16 sm:grid-cols-2 sm:px-6">
        <ScrollReveal>
          <div className="flex h-full flex-col gap-3 rounded-2xl border border-hero-panel-foreground/12 bg-hero-panel-foreground/[0.04] p-6">
            <p className="text-caption font-medium tracking-wide text-peach uppercase">Dwell time</p>
            <div className="flex items-center gap-2 py-3">
              <span className="text-caption text-hero-panel-foreground/60">Press</span>
              <span className="h-px flex-1 bg-hero-panel-foreground/25" />
              <span className="rounded-full bg-peach/15 px-2 py-0.5 text-caption text-peach">82ms</span>
              <span className="h-px flex-1 bg-hero-panel-foreground/25" />
              <span className="text-caption text-hero-panel-foreground/60">Release</span>
            </div>
            <p className="text-body text-hero-panel-foreground/70">How long an interaction lasts.</p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <div className="flex h-full flex-col gap-3 rounded-2xl border border-hero-panel-foreground/12 bg-hero-panel-foreground/[0.04] p-6">
            <p className="text-caption font-medium tracking-wide text-peach uppercase">Flight time</p>
            <div className="flex items-center gap-2 py-3">
              <span className="size-2 shrink-0 rounded-full bg-peach" />
              <span className="h-px flex-1 bg-hero-panel-foreground/25" />
              <span className="rounded-full bg-peach/15 px-2 py-0.5 text-caption text-peach">104ms</span>
              <span className="h-px flex-1 bg-hero-panel-foreground/25" />
              <span className="size-2 shrink-0 rounded-full bg-peach" />
            </div>
            <p className="text-body text-hero-panel-foreground/70">Time between interactions.</p>
          </div>
        </ScrollReveal>
      </div>

      {/* Personal copy pull-quote strip */}
      <ScrollReveal>
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-4 pb-16 text-center sm:px-6">
          <p className="font-display text-heading text-hero-panel-foreground italic">
            &ldquo;Your rhythm is uniquely yours.&rdquo;
          </p>
          <p className="max-w-lg text-body text-hero-panel-foreground/65">
            SIRILA doesn&apos;t need to know what you typed to understand how you interact. Over
            time, your patterns become your baseline. Your baseline. Your data. Your choice.
          </p>
        </div>
      </ScrollReveal>

      {/* How it works */}
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        <ScrollReveal>
          <h3 className="mb-10 text-center font-display text-heading text-hero-panel-foreground">How it works</h3>
        </ScrollReveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, index) => (
            <ScrollReveal key={step.number} delay={index * 100}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-hero-panel-foreground/12 bg-hero-panel-foreground/[0.04] p-5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-peach/30">
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-hero-panel-foreground/25">{step.number}</span>
                  <div className="flex size-9 items-center justify-center rounded-full bg-peach/10 text-peach">
                    <step.icon className="size-4" aria-hidden="true" />
                  </div>
                </div>
                <p className="font-display text-lg text-hero-panel-foreground">{step.title}</p>
                <p className="text-caption text-hero-panel-foreground/65">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Privacy boundary grid */}
      <div className="relative mx-auto w-full max-w-3xl px-4 pb-20 sm:px-6">
        <ScrollReveal>
          <div className="rounded-[2rem] border border-hero-panel-foreground/12 bg-hero-panel-foreground/[0.04] p-6 backdrop-blur-md sm:p-8">
            <h3 className="text-center font-display text-heading text-hero-panel-foreground">
              Your words stay yours.
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-xl bg-support/[0.06] p-4">
                <p className="text-caption font-medium tracking-wide text-support uppercase">What SIRILA sees</p>
                <ul className="flex flex-col gap-2">
                  {SIRILA_SEES.map((item, index) => (
                    <ScrollReveal key={item} delay={index * 80}>
                      <li className="flex items-center gap-2 text-sm text-hero-panel-foreground">
                        <Sparkles className="size-3.5 shrink-0 text-support" aria-hidden="true" />
                        {item}
                      </li>
                    </ScrollReveal>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3 rounded-xl bg-hero-panel-foreground/[0.03] p-4">
                <p className="text-caption font-medium tracking-wide text-hero-panel-foreground/50 uppercase">
                  What SIRILA doesn&apos;t need
                </p>
                <ul className="flex flex-col gap-2">
                  {SIRILA_DOES_NOT_NEED.map((item, index) => (
                    <ScrollReveal key={item} delay={150 + index * 80}>
                      <li className="flex items-center gap-2 text-sm text-hero-panel-foreground/35 line-through decoration-hero-panel-foreground/25">
                        <X className="size-3.5 shrink-0" aria-hidden="true" />
                        {item}
                      </li>
                    </ScrollReveal>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 text-center text-caption text-hero-panel-foreground/60">
              SIRILA does not need to read your private messages to analyze optional interaction
              patterns. Interaction insights are wellness-oriented and are not medical diagnoses.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default InteractionIntelligenceSection

import { Link } from 'react-router-dom'
import { MessageCircle, Sparkles } from 'lucide-react'
import { AI_CAPABILITIES } from '@/features/aiIntelligence/constants'

/**
 * A dedicated landing-page moment for SIRILA Intelligence (/ai) — the
 * flagship enabled AI capability had no representation anywhere on the
 * marketing page before this section. Deliberately reuses the hero-panel
 * dark tokens (not FeatureHighlights' light alternating layout, not
 * ProductOverview's list) so this reads as its own distinct beat in the
 * page's narrative, and mirrors the real chat UI's bubble-free, editorial
 * text treatment (see MessageBubble.tsx) rather than inventing a generic
 * "chat bubble" mockup that doesn't match the product.
 */
function SirilaIntelligenceSection() {
  return (
    <section className="relative overflow-hidden bg-hero-panel">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(45% 55% at 85% 15%, color-mix(in oklch, var(--hero-panel-accent), transparent 82%) 0%, transparent 100%)',
        }}
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-28">
        <div className="flex flex-col gap-5">
          <p className="flex items-center gap-2 text-caption font-medium tracking-wide text-hero-panel-accent uppercase">
            <Sparkles className="size-3.5" aria-hidden="true" />
            SIRILA Intelligence
          </p>
          <h2 className="max-w-md text-title font-display text-hero-panel-foreground">
            A thinking partner for what you&apos;re noticing
          </h2>
          <p className="max-w-md text-body text-hero-panel-foreground/75">
            Describe what you&apos;re experiencing in your own words. SIRILA helps you organize
            it into something clearer — grounded in general wellness information, never a
            diagnosis.
          </p>

          <ul className="mt-2 flex flex-col gap-4">
            {AI_CAPABILITIES.map((capability) => (
              <li key={capability.value} className="flex gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-hero-panel-foreground/10 text-hero-panel-accent">
                  <MessageCircle className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-base text-hero-panel-foreground">{capability.label}</p>
                  <p className="text-caption text-hero-panel-foreground/65">{capability.tagline}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/ai"
            className="mt-3 w-fit text-sm font-medium text-hero-panel-foreground underline decoration-hero-panel-foreground/40 underline-offset-4 transition-colors hover:decoration-hero-panel-foreground"
          >
            Try SIRILA Intelligence →
          </Link>
        </div>

        <div aria-hidden="true" className="flex flex-col gap-5 rounded-2xl border border-hero-panel-foreground/12 bg-hero-panel-foreground/[0.04] p-6 sm:p-8">
          <div className="flex justify-end">
            <p className="max-w-[85%] text-body text-hero-panel-foreground/70">
              I&apos;ve been feeling more tired than usual this week, and I&apos;m not sure why.
            </p>
          </div>
          <div className="flex flex-col gap-2 border-t border-hero-panel-foreground/10 pt-5">
            <p className="text-caption font-medium tracking-wide text-hero-panel-accent uppercase">SIRILA</p>
            <p className="max-w-md text-body text-hero-panel-foreground/85">
              That&apos;s worth paying attention to. A few things can affect energy — sleep,
              cycle phase, stress, or recent changes in routine. Would you like to look at what
              you&apos;ve recorded this week together?
            </p>
          </div>
          <p className="text-caption text-hero-panel-foreground/45">
            General wellness information only — not a diagnosis or medical advice.
          </p>
        </div>
      </div>
    </section>
  )
}

export default SirilaIntelligenceSection

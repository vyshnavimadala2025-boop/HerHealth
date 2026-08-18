import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Full-bleed contrast panel using the same hero-panel tokens as
 * HeroSection/WellnessTrackerPage/GoalsPage — bookends the page with the
 * one deliberate high-contrast moment, rather than another bordered card
 * on a light background.
 */
function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-hero-panel">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 60% at 15% 20%, color-mix(in oklch, var(--hero-panel-accent), transparent 78%) 0%, transparent 100%)',
        }}
      />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 lg:py-24">
        <div className="flex size-12 items-center justify-center rounded-full bg-hero-panel-foreground/10 text-hero-panel-accent">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <h2 className="max-w-xl text-title font-display text-hero-panel-foreground">
          Start building your personal wellness journey
        </h2>
        <p className="max-w-md text-body text-hero-panel-foreground/75">
          Free to create, private by design, entirely yours.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full bg-hero-panel-foreground text-hero-panel transition-transform duration-200 hover:-translate-y-0.5 hover:bg-hero-panel-foreground/90 sm:w-auto"
          >
            <Link to="/signup">Create Your Free Account</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full border-hero-panel-foreground/40 bg-transparent text-hero-panel-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:bg-hero-panel-foreground/10 sm:w-auto"
          >
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FinalCta

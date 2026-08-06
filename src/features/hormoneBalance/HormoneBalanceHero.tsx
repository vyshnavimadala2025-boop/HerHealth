import { Waves } from 'lucide-react'

/**
 * No source photo was supplied for this feature, so the hero illustration
 * is a self-contained SVG built entirely from HerHealth's existing design
 * tokens — soft, overlapping rings suggesting balance and rhythm — rather
 * than a stock image or an invented photo credit.
 */
function HormoneBalanceHero() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
      <div className="flex animate-in flex-col items-start gap-4 fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
        <p className="text-caption font-medium tracking-wide text-primary uppercase">Women&apos;s Wellness</p>
        <h1 className="text-title font-display text-foreground">Hormone Balance</h1>
        <p className="max-w-md text-body text-muted-foreground">
          Understand your body&apos;s natural hormonal patterns through daily wellness tracking,
          educational insights, and AI-powered observations.
        </p>
        <p className="text-caption text-muted-foreground">
          Educational and wellness-focused only. HerHealth never diagnoses conditions, predicts
          health outcomes, or replaces professional medical care.
        </p>
      </div>

      <div className="flex animate-in items-center justify-center fade-in duration-700 motion-reduce:animate-none">
        <svg
          viewBox="0 0 400 320"
          className="aspect-[5/4] w-full max-w-md"
          role="img"
          aria-label="An abstract illustration of soft, overlapping rings suggesting balance and rhythm"
        >
          <defs>
            <radialGradient id="hb-ring-1" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="var(--lavender)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--lavender)" stopOpacity="0.15" />
            </radialGradient>
            <radialGradient id="hb-ring-2" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="var(--blush)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--blush)" stopOpacity="0.15" />
            </radialGradient>
            <radialGradient id="hb-ring-3" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="var(--support)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--support)" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          <circle cx="160" cy="150" r="130" fill="url(#hb-ring-1)" />
          <circle cx="250" cy="120" r="100" fill="url(#hb-ring-2)" />
          <circle cx="220" cy="210" r="90" fill="url(#hb-ring-3)" />
          <circle cx="200" cy="160" r="46" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />
          <foreignObject x="174" y="134" width="52" height="52">
            <div className="flex size-full items-center justify-center text-primary">
              <Waves className="size-6" aria-hidden="true" />
            </div>
          </foreignObject>
        </svg>
      </div>
    </section>
  )
}

export default HormoneBalanceHero

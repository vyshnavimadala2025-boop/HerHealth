import { Compass } from 'lucide-react'

/**
 * No source photo was supplied for this feature, so the hero illustration
 * is a self-contained SVG built entirely from SIRILA's existing design
 * tokens — soft radiating arcs suggesting awareness of one's surroundings
 * — rather than a stock image or an invented photo credit.
 */
function LifestyleIntelligenceHero() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
      <div className="flex animate-in flex-col items-start gap-4 fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
        <p className="text-caption font-medium tracking-wide text-primary uppercase">Women&apos;s Wellness</p>
        <h1 className="text-title font-display text-foreground">Lifestyle Intelligence</h1>
        <p className="max-w-md text-body text-muted-foreground">
          Discover how your everyday lifestyle and surroundings may influence your overall
          wellness through thoughtful tracking and AI-powered observations.
        </p>
        <p className="text-caption text-muted-foreground">
          Educational only. SIRILA never diagnoses illness, offers medical advice, or predicts
          disease.
        </p>
      </div>

      <div className="flex animate-in items-center justify-center fade-in duration-700 motion-reduce:animate-none">
        <svg
          viewBox="0 0 400 320"
          className="aspect-[5/4] w-full max-w-md"
          role="img"
          aria-label="An abstract illustration of soft radiating arcs suggesting awareness of one's surroundings"
        >
          <defs>
            <radialGradient id="li-arc-1" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="var(--support)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--support)" stopOpacity="0.08" />
            </radialGradient>
            <radialGradient id="li-arc-2" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="var(--lavender)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--lavender)" stopOpacity="0.1" />
            </radialGradient>
            <radialGradient id="li-arc-3" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="var(--blush)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--blush)" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="160" r="140" fill="url(#li-arc-1)" />
          <circle cx="200" cy="160" r="100" fill="url(#li-arc-2)" />
          <circle cx="200" cy="160" r="60" fill="url(#li-arc-3)" />
          <circle cx="200" cy="160" r="38" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />
          <foreignObject x="174" y="134" width="52" height="52">
            <div className="flex size-full items-center justify-center text-primary">
              <Compass className="size-6" aria-hidden="true" />
            </div>
          </foreignObject>
        </svg>
      </div>
    </section>
  )
}

export default LifestyleIntelligenceHero

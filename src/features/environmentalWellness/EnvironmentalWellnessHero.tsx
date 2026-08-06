import { Wind } from 'lucide-react'

/**
 * No source photo was supplied for this feature, so the hero illustration
 * is a self-contained SVG built entirely from HerHealth's existing design
 * tokens — soft drifting layers suggesting air and surroundings — rather
 * than a stock image or an invented photo credit.
 */
function EnvironmentalWellnessHero() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
      <div className="flex animate-in flex-col items-start gap-4 fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
        <p className="text-caption font-medium tracking-wide text-primary uppercase">Women&apos;s Wellness</p>
        <h1 className="text-title font-display text-foreground">Environmental Wellness</h1>
        <p className="max-w-md text-body text-muted-foreground">
          Understand how your daily surroundings and lifestyle may influence your overall
          wellness — calm, educational, and always supportive.
        </p>
        <p className="text-caption text-muted-foreground">
          Educational only. HerHealth never diagnoses, predicts disease, or replaces professional
          medical care.
        </p>
      </div>

      <div className="flex animate-in items-center justify-center fade-in duration-700 motion-reduce:animate-none">
        <svg
          viewBox="0 0 400 320"
          className="aspect-[5/4] w-full max-w-md"
          role="img"
          aria-label="An abstract illustration of soft, drifting layers suggesting air and surroundings"
        >
          <defs>
            <linearGradient id="ew-layer-1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--support)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="var(--support)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--support)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="ew-layer-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--lavender)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="var(--lavender)" stopOpacity="0.65" />
              <stop offset="100%" stopColor="var(--lavender)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="ew-layer-3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--blush)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="var(--blush)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--blush)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d="M20,110 C120,70 280,150 380,100 L380,150 C280,200 120,120 20,160 Z" fill="url(#ew-layer-1)" />
          <path d="M20,170 C130,140 270,210 380,165 L380,205 C270,250 130,180 20,215 Z" fill="url(#ew-layer-2)" />
          <path d="M20,225 C140,205 260,255 380,220 L380,250 C260,285 140,235 20,260 Z" fill="url(#ew-layer-3)" />
          <circle cx="200" cy="90" r="34" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />
          <foreignObject x="176" y="66" width="48" height="48">
            <div className="flex size-full items-center justify-center text-primary">
              <Wind className="size-5" aria-hidden="true" />
            </div>
          </foreignObject>
        </svg>
      </div>
    </section>
  )
}

export default EnvironmentalWellnessHero

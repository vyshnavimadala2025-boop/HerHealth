import { Lock, ShieldCheck, User, HeartPulse } from 'lucide-react'
import AmbientOrb from '@/components/shared/AmbientOrb'

const TRUST_POINTS = [
  { icon: Lock, label: 'Private by design' },
  { icon: User, label: 'Your information stays connected to your account' },
  { icon: ShieldCheck, label: 'Built for personal wellness tracking' },
  { icon: HeartPulse, label: 'No medical diagnosis or treatment advice' },
]

/**
 * Deliberately understated — no unsupported claims (no HIPAA, no clinical
 * accuracy, no "encrypted" wording) beyond what's actually true of the
 * product today.
 */
function TrustStrip() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-muted/40">
      <AmbientOrb color="var(--primary)" size={340} top="-160px" left="20%" opacity={0.07} />
      <div className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4 py-6 sm:px-6">
        {TRUST_POINTS.map((point) => (
          <div key={point.label} className="flex items-center gap-2 text-caption text-muted-foreground">
            <point.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{point.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TrustStrip

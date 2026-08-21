import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AmbientOrb from '@/components/shared/AmbientOrb'

function PrivacySection() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-muted/40">
      <AmbientOrb color="var(--lavender)" size={420} top="-180px" right="10%" opacity={0.09} />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-support text-support-foreground">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>
        <h2 className="text-title font-display text-foreground">Your Wellness Journey Is Personal</h2>
        <p className="max-w-xl text-body text-muted-foreground">
          SIRILA is designed to help you organize and review information you choose to record.
          Your wellness information is private to your account and is not presented as a medical
          diagnosis.
        </p>
        <Button asChild variant="outline">
          <Link to="/privacy">Read our Privacy page</Link>
        </Button>
      </div>
    </section>
  )
}

export default PrivacySection

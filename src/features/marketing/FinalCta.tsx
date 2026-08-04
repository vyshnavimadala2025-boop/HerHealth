import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-sm">
        <h2 className="max-w-xl text-title font-display text-foreground">
          Start Building Your Personal Wellness Journey
        </h2>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/signup">Create Your Free Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FinalCta

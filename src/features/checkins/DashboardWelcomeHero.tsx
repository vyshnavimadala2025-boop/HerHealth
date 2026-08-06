import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import dashboardHeroImage from '@/assets/images/herhealth-dashboard-hero.png'

interface DashboardWelcomeHeroProps {
  firstName: string
}

/**
 * The premium image moment for the dashboard — deliberately separate from
 * TodayHero below, which keeps its own real check-in-status logic
 * untouched. This component carries no data-fetching of its own; it's
 * pure presentation plus the two real links (#checkin-form is the
 * existing in-page anchor, /goals#progress is the real, already-built
 * progress section).
 */
function DashboardWelcomeHero({ firstName }: DashboardWelcomeHeroProps) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center lg:gap-10">
      <div className="flex animate-in flex-col items-start gap-4 fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
        <p className="text-caption font-medium tracking-wide text-primary uppercase">
          {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
        </p>
        <h1 className="text-title font-display text-foreground">Your wellness, one day at a time.</h1>
        <p className="max-w-md text-body text-muted-foreground">
          Take a moment to notice how you feel, reflect on what you need, and build small habits
          that support you.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 w-full rounded-xl sm:w-auto">
            <a href="#checkin-form">Start Today&apos;s Check-In</a>
          </Button>
          <Link
            to="/goals#progress"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View My Progress
          </Link>
        </div>
      </div>

      <div className="animate-in fade-in duration-700 motion-reduce:animate-none">
        <img
          src={dashboardHeroImage}
          alt="An illustrated overlay of mood, energy, cycle, and sleep panels beside a woman checking in on her phone in a warm, calm setting"
          width={1672}
          height={941}
          loading="eager"
          decoding="async"
          className="aspect-[16/10] w-full rounded-3xl object-cover shadow-lg sm:aspect-[16/9] lg:aspect-[4/3]"
        />
      </div>
    </section>
  )
}

export default DashboardWelcomeHero

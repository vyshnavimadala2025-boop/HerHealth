import { Link } from 'react-router-dom'
import { HeartPulse, LineChart, NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'

const WEEK_BAR_HEIGHTS = ['h-3', 'h-5', 'h-4', 'h-7', 'h-5', 'h-6', 'h-8']

/**
 * A single cohesive "app window" preview of the real HerHealth dashboard —
 * deliberately not a stock photo or an actual screenshot (no browser
 * automation is available to capture one), but a detailed, faithful
 * recreation of the dashboard's real layout and real design tokens, so it
 * reads as a genuine product preview rather than decorative shapes. The
 * numbers shown are illustrative sample data, not live values.
 */
function ProductPreviewVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-accent/50 via-support/30 to-transparent blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-destructive/40" />
          <span className="size-2.5 rounded-full bg-primary/30" />
          <span className="size-2.5 rounded-full bg-support" />
          <span className="ml-3 text-[0.65rem] text-muted-foreground">herhealth.app/dashboard</span>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 w-28 rounded-full bg-foreground/70" />
              <div className="h-2 w-20 rounded-full bg-muted" />
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <HeartPulse className="size-4" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-support/60 px-3 py-1 text-[0.65rem] font-medium text-support-foreground">
              Mood: Good
            </span>
            <span className="rounded-full bg-accent px-3 py-1 text-[0.65rem] font-medium text-accent-foreground">
              Energy: High
            </span>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <LineChart className="size-3.5 text-primary" aria-hidden="true" />
              <span className="text-[0.65rem] font-medium text-foreground">Weekly consistency</span>
            </div>
            <div className="flex items-end gap-1.5">
              {WEEK_BAR_HEIGHTS.map((height, index) => (
                <div key={index} className={`w-full flex-1 rounded-t-sm bg-primary/70 ${height}`} />
              ))}
            </div>
            <p className="text-[0.65rem] text-muted-foreground">5 of 7 days checked in this week</p>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-border pt-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <NotebookPen className="size-3" aria-hidden="true" />
              </div>
              <div className="h-2 w-32 rounded-full bg-muted" />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-6 items-center justify-center rounded-full bg-support/60 text-support-foreground">
                <HeartPulse className="size-3" aria-hidden="true" />
              </div>
              <div className="h-2 w-24 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-4 pt-14 pb-10 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:pt-20 lg:pb-16">
      <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
        <h1 className="max-w-xl text-title font-display text-foreground sm:text-display">
          Understand Your Wellness. On Your Terms.
        </h1>
        <p className="max-w-lg text-body-lg text-muted-foreground">
          HerHealth brings your daily wellness, cycle information, personal reflections, goals, and
          progress together in one private and supportive space.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/signup">Start Your Wellness Journey</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href="#products">Explore HerHealth</a>
          </Button>
        </div>
      </div>

      <div className="w-full flex-1">
        <ProductPreviewVisual />
      </div>
    </section>
  )
}

export default HeroSection

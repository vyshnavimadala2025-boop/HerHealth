import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import heroImage from '@/assets/images/banner landscape.png'

/**
 * The hero artwork (banner landscape.png) already carries the SIRILA
 * wordmark, tagline, and its own supporting copy baked into the image —
 * this component deliberately does NOT overlay a second, competing set of
 * DOM text on top of it (see the sr-only h1 below for the real heading).
 *
 * Full-bleed cinematic treatment: the artwork absolutely fills the section
 * via `object-cover`, not boxed into an `aspect-[16/9]` card. The artwork's
 * own composition is wide-format (the woman + phone sit in the left third,
 * the wordmark spans the center-right, at native 16:9) — on a narrow/tall
 * viewport, covering the full screen necessarily crops most of that width
 * down to a vertical slice, so full fidelity to every baked-in element
 * isn't achievable everywhere at once. `object-position` is tuned per
 * breakpoint to prioritize the woman + phone (the primary subject) on
 * mobile, where the crop is tightest, and widens toward center on larger
 * viewports as more of the frame — including the wordmark — fits without
 * cropping.
 *
 * Section height is `100svh` minus PublicNavbar's rendered height (57px,
 * measured — it's `sticky`, not overlaid, so it occupies real space above
 * this section rather than floating over it), not plain `min-h-svh`. Using
 * `min-h-svh` here made navbar + hero together exceed one screen by the
 * navbar's own height, pushing the second CTA button below the fold on
 * first load instead of the hero actually reading as "fills the screen."
 *
 * The bottom scrim is deliberately strong (near-opaque at the very bottom)
 * rather than a subtle fade: the artwork's own baked-in feature strip
 * ("Privacy First" / "AI-Powered Insights" / ...) sits exactly where the
 * CTA buttons need to go, and a light scrim left both legible but
 * cluttered, fighting each other. Full coverage there reads as a clean
 * dark footer bar the buttons sit on, not a redesign of the artwork itself.
 */
function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100svh-57px)] flex-col overflow-hidden bg-hero-panel">
      <img
        src={heroImage}
        alt="A woman smiling gently while checking in on her wellness using her phone, beside a calm sunset lake with a glowing lotus, with the SIRILA wordmark"
        className="absolute inset-0 size-full object-cover object-[26%_center] animate-hero-image-in motion-reduce:animate-none sm:object-[34%_center] lg:object-[46%_center]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-hero-panel via-hero-panel/85 to-transparent sm:h-56"
      />

      {/* Screen-reader-only real heading — the visible SIRILA wordmark is part of the artwork above */}
      <h1 className="sr-only">SIRILA — Smart Intelligent Responsive Insights Life Assistant</h1>

      <div className="relative mt-auto flex flex-col items-center gap-2.5 px-4 pb-6 sm:flex-row sm:justify-center sm:gap-3 sm:pb-10">
        <Button
          asChild
          size="lg"
          className="w-full bg-hero-panel-foreground text-hero-panel transition-transform duration-200 hover:-translate-y-0.5 hover:bg-hero-panel-foreground/90 sm:w-auto"
        >
          <Link to="/signup">Begin Your Journey</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="w-full border-hero-panel-foreground/40 bg-transparent text-hero-panel-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:bg-hero-panel-foreground/10 sm:w-auto"
        >
          <a href="#products">Explore SIRILA</a>
        </Button>
      </div>
    </section>
  )
}

export default HeroSection

import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import heroImage from '@/assets/images/herhealth-landing-hero.png'

const HERO_OVERLAY =
  'linear-gradient(90deg, rgba(28, 8, 25, 0.88) 0%, rgba(28, 8, 25, 0.72) 38%, rgba(28, 8, 25, 0.25) 68%, rgba(28, 8, 25, 0.05) 100%)'

/**
 * A full-bleed photographic banner, not a bordered preview beside the copy.
 * Below `lg` there isn't enough width for a fixed-width text column and
 * the full face+phone to both fit in frame — `background-size: cover`
 * always shows the image's full height on a viewport this proportioned,
 * so no `background-position` value can create clearance without cropping
 * the face out of frame (verified this fails as late as 900px). So the
 * same image renders as a separate stacked block under the text instead
 * of a full-bleed background until `lg`, where it becomes the absolutely
 * positioned full-bleed background behind the centered copy.
 */
function HeroSection() {
  return (
    <section className="relative bg-hero-panel lg:flex lg:min-h-[720px] lg:items-center xl:min-h-[780px]">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-14 pb-8 sm:px-6 md:pt-16 lg:py-20">
        <div className="flex max-w-lg animate-in fade-in slide-in-from-bottom-4 flex-col items-start gap-6 text-left duration-700">
          <p className="text-caption font-medium tracking-[0.14em] text-hero-panel-accent uppercase">
            Personal Wellness, Your Way
          </p>
          <h1 className="text-title font-display sm:text-display">
            <span className="block text-hero-panel-foreground">Understand Your Wellness.</span>
            <span className="block text-hero-panel-accent">On Your Terms.</span>
          </h1>
          <p className="text-body-lg text-hero-panel-foreground/80">
            SIRILA brings your daily wellness, cycle information, personal reflections, goals, and
            progress together in one private and supportive space.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full bg-hero-panel-foreground text-hero-panel transition-transform duration-200 hover:-translate-y-0.5 hover:bg-hero-panel-foreground/90 sm:w-auto"
            >
              <Link to="/signup">Start Your Wellness Journey</Link>
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
        </div>
      </div>

      <div
        aria-hidden="true"
        className="h-[380px] w-full animate-in fade-in bg-cover bg-[72%_32%] duration-1000 sm:h-[440px] md:h-[520px] lg:hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div
        aria-hidden="true"
        className="hidden animate-in fade-in duration-1000 lg:absolute lg:inset-0 lg:z-0 lg:block lg:bg-cover lg:bg-[74%_center] xl:bg-center"
        style={{ backgroundImage: `${HERO_OVERLAY}, url(${heroImage})` }}
      />
    </section>
  )
}

export default HeroSection

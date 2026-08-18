import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brain, Flower2, Heart, Leaf, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import heroImage from '@/assets/images/herhealth-landing-hero-v2.png'

const WORDMARK_LETTERS = ['S', 'I', 'R', 'I', 'L', 'A']

const TAGLINE = 'Smart • Intelligent • Responsive • Insights • Life Assistant'

interface HeroFeature {
  icon: LucideIcon
  title: string
  description: string
}

const HERO_FEATURES: HeroFeature[] = [
  { icon: ShieldCheck, title: 'Privacy First', description: 'Your data is yours and yours alone.' },
  { icon: Brain, title: 'AI-Powered Insights', description: 'Intelligent guidance tailored to you.' },
  { icon: Heart, title: 'Holistic Wellness', description: 'Mind, body, and emotional balance.' },
  { icon: Leaf, title: 'Preventive Care', description: 'Proactive today for a healthier tomorrow.' },
]

/**
 * NOTE ON THE IMAGE: herhealth-landing-hero-v2.png has no SIRILA
 * wordmark/tagline/feature text baked into it — everything below (the
 * wordmark, tagline, description, and the four-item feature panel) is
 * real DOM text/icons laid over the photo, not part of the image file.
 * An earlier pass in this same session tried the opposite — treating a
 * *different* upload (with all of this baked into the pixels) as the hero
 * background and using a dark scrim to hide the baked copy — and a
 * screenshot check showed the bright glow text ghosting through even at
 * ~95% scrim opacity. Real DOM text sidesteps that entirely: it animates
 * (the letter-by-letter reveal), stays legible at any viewport width, and
 * is readable by screen readers and reflows for translation instead of
 * being locked into a raster image.
 */
function HeroSection() {
  const [lettersSettled, setLettersSettled] = useState(false)

  useEffect(() => {
    // Matches the letter-in animation's own total duration (last letter's
    // delay + its own duration) — used only to gate the *reveal* of the
    // tagline/description/CTA stack until the wordmark has finished
    // animating in, not to control the wordmark itself (pure CSS).
    const timer = window.setTimeout(() => setLettersSettled(true), 1450)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-hero-panel">
      <img
        src={heroImage}
        alt="A woman smiling gently while checking in on her wellness using her phone, beside a calm sunset lake with a glowing lotus"
        className="absolute inset-0 size-full object-cover object-[22%_center] sm:object-[18%_center]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(24, 6, 21, 0.5) 0%, rgba(24, 6, 21, 0.15) 22%, rgba(24, 6, 21, 0.15) 55%, rgba(24, 6, 21, 0.55) 78%, rgba(24, 6, 21, 0.85) 100%)',
        }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-10 text-center sm:px-6 lg:pl-24">
        <div className="flex w-full flex-col items-center rounded-[2rem] bg-hero-panel/55 px-6 py-8 backdrop-blur-md sm:max-w-md lg:mr-[8%] lg:ml-auto lg:w-auto lg:max-w-none lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <div aria-hidden="true" className="flex justify-center">
          <span className="sirila-wordmark-breathe motion-reduce:animate-none">
            {WORDMARK_LETTERS.map((letter, index) => (
              <span
                key={index}
                className="sirila-letter motion-reduce:opacity-100"
                style={{
                  animationDelay: `${index * 120}ms`,
                  textShadow:
                    '0 0 46px color-mix(in oklch, var(--peach), transparent 15%), 0 2px 24px rgba(0,0,0,0.45)',
                }}
              >
                <span
                  className="text-[3.25rem] font-display leading-none tracking-[0.06em] sm:text-[4.5rem] lg:text-[5.5rem]"
                  style={{ color: 'color-mix(in oklch, var(--hero-panel-foreground) 78%, var(--peach) 22%)' }}
                >
                  {letter}
                </span>
              </span>
            ))}
          </span>
        </div>
        {/* Screen-reader-only real heading — the animated glyphs above are aria-hidden */}
        <h1 className="sr-only">SIRILA — Smart Intelligent Responsive Insights Life Assistant</h1>

        <p
          className={cn(
            'mt-4 text-caption font-normal tracking-[0.2em] text-peach transition-all duration-700 motion-reduce:opacity-100 motion-reduce:translate-y-0 sm:text-sm',
            lettersSettled ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
          {TAGLINE}
        </p>

        <p
          className={cn(
            'mt-6 max-w-md text-body-lg text-hero-panel-foreground/95 transition-all delay-200 duration-700 motion-reduce:opacity-100 motion-reduce:translate-y-0',
            lettersSettled ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
          Your AI-powered wellness companion for a healthier body, calmer mind, and brighter you.
        </p>

        <div
          aria-hidden="true"
          className={cn(
            'mt-5 flex items-center gap-3 text-peach/70 transition-opacity delay-300 duration-700 motion-reduce:opacity-100',
            lettersSettled ? 'opacity-100' : 'opacity-0',
          )}
        >
          <span className="h-px w-10 bg-current opacity-50" />
          <Flower2 className="size-4" strokeWidth={1.25} />
          <span className="h-px w-10 bg-current opacity-50" />
        </div>

        <div
          className={cn(
            'mt-6 flex w-full flex-col items-center gap-3 transition-all delay-300 duration-700 motion-reduce:opacity-100 motion-reduce:translate-y-0 sm:w-auto sm:flex-row',
            lettersSettled ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
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
        </div>
      </div>

      {/* Glassmorphism feature panel, matching the reference composition's bottom bar */}
      <div className="relative px-4 pb-8 sm:px-6 lg:pb-10">
        <div
          className={cn(
            'mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-4 gap-y-6 rounded-2xl border border-hero-panel-foreground/15 bg-hero-panel-foreground/[0.07] px-5 py-6 backdrop-blur-md transition-all delay-500 duration-700 motion-reduce:opacity-100 motion-reduce:translate-y-0 sm:gap-6 sm:px-8 sm:py-7 lg:grid-cols-4',
            lettersSettled ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
          {HERO_FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3 text-left">
              <feature.icon className="mt-0.5 size-5 shrink-0 text-peach" aria-hidden="true" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-hero-panel-foreground">{feature.title}</p>
                <p className="mt-0.5 text-caption text-hero-panel-foreground/65">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection

import { Link } from 'react-router-dom'
import {
  Ban,
  Download,
  HeartPulse,
  Lock,
  MessageCircle,
  Sparkles,
  SlidersHorizontal,
  Trash2,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ScrollReveal from '@/components/shared/ScrollReveal'
import privacyImage from '@/assets/images/herhealth-privacy-personal-space.png'

const PRINCIPLES: { icon: LucideIcon; accent: string; title: string; description: string }[] = [
  {
    icon: Lock,
    accent: 'bg-lavender text-lavender-foreground',
    title: 'Your information stays personal',
    description:
      'Everything you record — check-ins, cycle dates, journal entries, goals — is scoped to your own account and never visible to anyone else. Access is enforced at the database level, not only in the app itself.',
  },
  {
    icon: SlidersHorizontal,
    accent: 'bg-blush text-blush-foreground',
    title: 'You remain in control',
    description:
      'Export a copy of your recorded data at any time, and permanently delete it — by category or all at once — whenever you choose. Deletion is permanent and cannot be undone.',
  },
  {
    icon: Sparkles,
    accent: 'bg-support text-support-foreground',
    title: 'Designed for thoughtful wellness',
    description:
      'SIRILA supports recording and reflection, not diagnosis. Your journal entries and wellness notes are never analyzed, summarized, or included in your insights, reports, or timeline.',
  },
  {
    icon: MessageCircle,
    accent: 'bg-accent text-accent-foreground',
    title: 'Clear and respectful',
    description:
      "We describe our privacy practices plainly and avoid claims we can't support. What you read on this page reflects what SIRILA actually does, not marketing language.",
  },
]

const DOES_NOT = [
  'SIRILA does not sell your personal information.',
  'SIRILA does not diagnose PCOS, PCOD, or any other medical condition.',
  'SIRILA does not use your journal content for analytics or advertising.',
  'SIRILA does not share your data with other users.',
]

/**
 * The hero breaks out to the wider marketing container (matching the
 * homepage's hero width) so the image can read as a large editorial
 * visual rather than a thumbnail; everything below settles back into the
 * narrower reading column already used by this page's sibling content
 * pages (About, How It Works), since this page still leads with several
 * paragraphs of privacy content and shouldn't become a wall of text at
 * full container width.
 */
function PrivacyPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-6xl px-4 pt-14 pb-4 sm:px-6 lg:pt-20 lg:pb-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="flex flex-col items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700 motion-reduce:animate-none">
            <p className="text-caption font-medium tracking-wide text-primary uppercase">
              Your Space, Your Control
            </p>
            <h1 className="text-title font-display text-foreground sm:text-display">
              Your wellness journey is personal.
            </h1>
            <p className="max-w-lg text-body-lg text-muted-foreground">
              SIRILA is designed to give you a private space to record, reflect on, and understand
              your personal wellness information — with clear control over your data.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150 motion-reduce:animate-none">
            <div className="overflow-hidden rounded-2xl shadow-md">
              <img
                src={privacyImage}
                alt="Woman relaxing comfortably on a sofa in a warm, private living room, looking at her phone — representing a calm personal space where her wellness information stays her own"
                width={1672}
                height={941}
                loading="eager"
                decoding="async"
                className="aspect-[4/3] w-full object-cover object-[28%_40%] sm:aspect-[16/10] sm:object-[26%_35%] lg:aspect-[4/5] lg:object-[22%_32%]"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-14 px-4 py-14 sm:px-6">
        <section className="flex flex-col gap-8">
          <h2 className="font-display text-heading text-foreground">How we think about your privacy</h2>
          <div className="flex flex-col gap-8">
            {PRINCIPLES.map((principle, index) => (
              <ScrollReveal key={principle.title} delay={index * 80}>
                <div className="flex gap-4">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full ${principle.accent}`}
                  >
                    <principle.icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-1 pt-1">
                    <h3 className="font-display text-lg text-foreground">{principle.title}</h3>
                    <p className="text-body text-muted-foreground">{principle.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-5">
            <div className="flex items-center gap-2">
              <Ban className="size-4 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">What SIRILA does not do</p>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DOES_NOT.map((item) => (
                <li key={item} className="flex items-start gap-2 text-caption text-muted-foreground">
                  <Users className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="font-display text-heading text-foreground">Your data controls</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Download className="size-4" aria-hidden="true" />
              </div>
              <h3 className="font-display text-base text-foreground">Export your data</h3>
              <p className="text-caption text-muted-foreground">
                Download your complete SIRILA history as JSON or CSV, generated in your browser.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-1 w-fit">
                <Link to="/reports">Go to Wellness Reports</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <div className="flex size-9 items-center justify-center rounded-full bg-attention text-attention-foreground">
                <Trash2 className="size-4" aria-hidden="true" />
              </div>
              <h3 className="font-display text-base text-foreground">Delete your data</h3>
              <p className="text-caption text-muted-foreground">
                Permanently delete your recorded data — by category or all at once. This cannot be
                undone.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-1 w-fit">
                <Link to="/profile#privacy">Go to Profile &amp; Account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-5">
          <div className="flex items-center gap-2">
            <HeartPulse className="size-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="font-display text-base text-foreground">A note on wellness and medical care</h2>
          </div>
          <p className="text-caption text-muted-foreground">
            SIRILA helps you record, reflect, and understand your personal wellness information. It
            is not a substitute for professional medical advice, diagnosis, or treatment. See our{' '}
            <Link to="/medical-disclaimer" className="text-primary underline underline-offset-2">
              Medical Disclaimer
            </Link>{' '}
            for more.
          </p>
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm sm:px-10">
          <h2 className="max-w-md text-title font-display text-foreground">
            A more personal way to understand your wellness.
          </h2>
          <p className="max-w-md text-body text-muted-foreground">
            Build awareness at your own pace in a space designed around your personal journey.
          </p>
          <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/how-it-works">Learn How It Works</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default PrivacyPage

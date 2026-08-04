import { Link } from 'react-router-dom'
import {
  Ban,
  Database,
  Download,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'

const STORES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Database,
    title: 'What HerHealth stores',
    description:
      'Only the information you choose to enter: daily check-ins, cycle and period dates, journal entries, optional PCOS/PCOD wellness observations, goals and progress notes, and your reminder and account preferences. Nothing is inferred or added beyond what you record.',
  },
  {
    icon: ShieldCheck,
    title: 'Private to your account',
    description:
      'Every piece of information you record is scoped to your own account and is not visible to any other user. Access is enforced at the database level, not only in the app itself, so your data stays isolated to your account by design.',
  },
  {
    icon: Sparkles,
    title: 'Your journal stays private',
    description:
      'Journal entries and PCOS/PCOD wellness notes are never analyzed, summarized, or included in your insights, reports, or timeline. They exist only where you wrote them.',
  },
  {
    icon: Download,
    title: 'You control your data',
    description:
      'You can export a copy of your recorded data (JSON or CSV) at any time from Wellness Reports, and permanently delete your data — by category or all at once — from Profile & Account. Deletion is permanent and cannot be undone.',
  },
]

const DOES_NOT = [
  'HerHealth does not sell your personal information.',
  'HerHealth does not diagnose PCOS, PCOD, or any other medical condition.',
  'HerHealth does not use your journal content for analytics or advertising.',
  'HerHealth does not share your data with other users.',
]

function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-14 sm:px-6">
      <div className="flex flex-col items-start gap-4 animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-caption font-medium tracking-wide text-primary uppercase">Privacy</p>
          <h1 className="text-title font-display text-foreground">Privacy at HerHealth</h1>
          <p className="text-body text-muted-foreground">
            This page describes how HerHealth handles the information you choose to record.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {STORES.map((item) => (
          <section
            key={item.title}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-sm"
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <item.icon className="size-4" aria-hidden="true" />
            </div>
            <h2 className="font-display text-base text-foreground">{item.title}</h2>
            <p className="text-caption text-muted-foreground">{item.description}</p>
          </section>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Ban className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-display text-lg text-foreground">What HerHealth does not do</h2>
        </div>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DOES_NOT.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-lg border border-border p-3 text-body text-muted-foreground"
            >
              <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-5">
        <h2 className="font-display text-base text-foreground">A note on claims we don&apos;t make</h2>
        <p className="text-caption text-muted-foreground">
          HerHealth is not HIPAA-certified, does not claim clinical accuracy, and is not reviewed or
          approved by a medical body. See our{' '}
          <Link to="/medical-disclaimer" className="text-primary underline underline-offset-2">
            Medical Disclaimer
          </Link>{' '}
          for more.
        </p>
      </section>
    </main>
  )
}

export default PrivacyPage

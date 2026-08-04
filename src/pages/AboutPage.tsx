import { Link } from 'react-router-dom'
import { HeartPulse, Lock, NotebookPen } from 'lucide-react'

const VALUES = [
  {
    icon: Lock,
    accent: 'bg-lavender text-lavender-foreground',
    title: 'Private by design',
    description: 'Your recorded information stays private to your account, and only you can see it.',
  },
  {
    icon: NotebookPen,
    accent: 'bg-blush text-blush-foreground',
    title: 'Observational, not diagnostic',
    description: 'HerHealth describes patterns in what you record. It never diagnoses or predicts.',
  },
  {
    icon: HeartPulse,
    accent: 'bg-support text-support-foreground',
    title: 'Built around your own pace',
    description: 'Check in, journal, and set goals in whatever rhythm works for you — nothing forced.',
  },
]

function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-14 sm:px-6">
      <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
        <p className="text-caption font-medium tracking-wide text-primary uppercase">About</p>
        <h1 className="text-title font-display text-foreground">About HerHealth</h1>
        <p className="text-body text-muted-foreground">
          HerHealth is a private wellness tracking platform, built to help people organize and
          understand information about their own wellness journey — on their own terms.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="font-display text-heading text-foreground text-balance">
          &ldquo;Personal wellness information is often scattered across notes apps, calendars, and
          memory. HerHealth brings it together in one private, organized space — without turning it
          into something clinical.&rdquo;
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-foreground">What we value</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-shadow hover:shadow-sm"
            >
              <div
                className={`flex size-9 items-center justify-center rounded-full ${value.accent}`}
              >
                <value.icon className="size-4" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-foreground">{value.title}</p>
              <p className="text-caption text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg text-foreground">What HerHealth is not</h2>
        <p className="text-body text-muted-foreground">
          HerHealth is not a medical provider and does not offer medical advice, diagnosis, or
          treatment. Read our{' '}
          <Link to="/medical-disclaimer" className="text-primary underline underline-offset-2">
            Medical Disclaimer
          </Link>{' '}
          for details.
        </p>
      </section>
    </main>
  )
}

export default AboutPage

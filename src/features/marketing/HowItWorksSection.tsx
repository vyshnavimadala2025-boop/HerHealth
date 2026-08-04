import { BookMarked, Compass, NotebookPen } from 'lucide-react'

const STEPS = [
  {
    number: '1',
    icon: NotebookPen,
    title: 'Record',
    description: 'Track what matters to you — check-ins, cycle dates, journal entries, and goals.',
  },
  {
    number: '2',
    icon: Compass,
    title: 'Understand',
    description: 'Review your recorded patterns and progress, in plain, non-diagnostic language.',
  },
  {
    number: '3',
    icon: BookMarked,
    title: 'Reflect',
    description: 'Build a more organized view of your personal wellness journey over time.',
  },
]

function HowItWorksSection() {
  return (
    <section className="bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center">
          <p className="text-caption font-medium tracking-wide text-primary uppercase">How it works</p>
          <h2 className="text-title font-display text-foreground">Three simple steps</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="flex flex-col items-center gap-3 text-center">
              <div className="relative flex size-14 items-center justify-center rounded-full bg-card shadow-sm">
                <step.icon className="size-6 text-primary" aria-hidden="true" />
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[0.65rem] font-medium text-primary-foreground">
                  {step.number}
                </span>
              </div>
              <h3 className="font-display text-lg text-foreground">{step.title}</h3>
              <p className="max-w-xs text-body text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection

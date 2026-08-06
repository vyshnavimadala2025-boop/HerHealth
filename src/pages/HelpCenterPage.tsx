import { HelpCircle, Mail } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'

interface HelpTopic {
  key: string
  question: string
  answer: string
}

const HELP_TOPICS: HelpTopic[] = [
  {
    key: 'what-is-herhealth',
    question: 'What is HerHealth?',
    answer:
      'HerHealth is a personal wellness companion for tracking cycles, daily check-ins, and lifestyle patterns. It is educational and supportive only — it never diagnoses conditions, predicts health outcomes, or replaces professional medical care.',
  },
  {
    key: 'who-sees-my-data',
    question: 'Who can see my information?',
    answer:
      'Only you. Every page in HerHealth that shows your recorded information is scoped to your own account, enforced by Supabase row-level security — nothing you record is ever visible to other users or made public.',
  },
  {
    key: 'export-data',
    question: 'How do I export my data?',
    answer:
      'Open Profile → Export Data, or go to Reports and use the Export card. You can download a copy of everything you have recorded as a JSON or CSV file at any time — nothing is sent to a server, the file is generated in your browser.',
  },
  {
    key: 'delete-data',
    question: 'How do I delete my data?',
    answer:
      'Open Profile → Privacy or Security, or go to Profile and scroll to the Data & Privacy section. You can delete individual categories of recorded data, or everything at once, at any time.',
  },
  {
    key: 'ai-insights',
    question: 'Are the "AI Insights" powered by real AI?',
    answer:
      'The insights across HerHealth are deterministic, rule-based observations about the information you have personally recorded — not output from a machine-learning model. They are labeled honestly as pattern-based observations for exactly this reason.',
  },
  {
    key: 'local-only-tools',
    question: 'Some tools say "saved on this device only" — what does that mean?',
    answer:
      'A few newer tools (like Sleep Intelligence and Nutrition Companion) store what you log in your browser’s local storage rather than in your HerHealth account. That means the data stays private to this device and browser, and won’t sync to your account or other devices — it’s clearly labeled wherever this applies.',
  },
  {
    key: 'missing-feature',
    question: 'A feature says "Coming soon" — when will it be available?',
    answer:
      'HerHealth is under active development. Features marked "Coming soon" are on the roadmap but not built yet — we’d rather be upfront about that than show something that doesn’t work.',
  },
  {
    key: 'contact',
    question: 'How do I get in touch?',
    answer: 'Use Support → Contact, or Support → Report an Issue, and we will get back to you.',
  },
]

/** Real, complete Help Center — product/app usage FAQs (distinct from Learn's health-education FAQs). */
function HelpCenterPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <HelpCircle className="size-6" aria-hidden="true" />
        </div>
        <PageHeader title="Help Center" description="Answers to common questions about using HerHealth." />
      </div>

      <div className="flex flex-col gap-3">
        {HELP_TOPICS.map((topic) => (
          <details key={topic.key} className="group rounded-xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground marker:content-none focus-visible:ring-3 focus-visible:ring-ring/50">
              {topic.question}
              <span className="shrink-0 text-caption text-muted-foreground transition-transform duration-200 group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="border-t border-border p-4 pt-3 text-caption text-muted-foreground">{topic.answer}</p>
          </details>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blush text-blush-foreground">
          <Mail className="size-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Still need help?</p>
          <a href="mailto:support@herhealth.app" className="text-caption text-primary underline-offset-4 hover:underline">
            support@herhealth.app
          </a>
        </div>
      </div>
    </main>
  )
}

export default HelpCenterPage

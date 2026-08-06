import { BookOpen } from 'lucide-react'
import type { LearningTopic } from '@/features/lifestyleIntelligence/types'

const LEARNING_TOPICS: LearningTopic[] = [
  {
    key: 'sleep-and-wellness',
    title: 'How Sleep Affects Wellness',
    summary: 'Why rest is one of the most foundational daily habits.',
    body: [
      'Sleep plays a role in regulating many of the body’s natural rhythms and restorative processes.',
      'Keeping a fairly consistent sleep and wake schedule can support steadier energy and mood over time.',
    ],
  },
  {
    key: 'healthy-work-routines',
    title: 'Healthy Work Routines',
    summary: 'Small structural habits that can support a workday.',
    body: [
      'Short, regular breaks throughout a workday can help sustain focus and comfort.',
      'Building in natural stopping points — even brief ones — can make long stretches of work feel more manageable.',
    ],
  },
  {
    key: 'managing-screen-time',
    title: 'Managing Screen Time',
    summary: 'A gentle approach to mindful screen use.',
    body: [
      'Regular breaks from screens can support eye comfort and mental rest.',
      'Setting a wind-down period before sleep, with less screen exposure, is a habit many people find supportive.',
    ],
  },
  {
    key: 'importance-of-hydration',
    title: 'Importance of Hydration',
    summary: 'Why steady water intake supports the body.',
    body: [
      'Staying hydrated throughout the day supports energy, focus, and general comfort.',
      'Keeping water nearby, or pairing a glass with an existing routine, is a simple way to build the habit.',
    ],
  },
  {
    key: 'benefits-of-movement',
    title: 'Benefits of Movement',
    summary: 'Why gentle, regular movement matters.',
    body: [
      'Movement doesn’t need to be intense to be worthwhile — a short walk or light stretching most days can be supportive.',
      'Breaking up long periods of sitting with brief movement is a habit that can add up over time.',
    ],
  },
  {
    key: 'healthy-indoor-environments',
    title: 'Healthy Indoor Environments',
    summary: 'Everyday habits that support a comfortable space.',
    body: [
      'Fresh air, natural light, and a comfortable temperature can all support how a space feels to be in.',
      'Small adjustments to a workspace or home environment can make a meaningful difference over time.',
    ],
  },
  {
    key: 'stress-recovery',
    title: 'Stress Recovery',
    summary: 'Gentle ways to support the body after stress.',
    body: [
      'Everyday stress can influence how the body and mind feel — recovery habits can help support balance.',
      'Slow breathing, short breaks, and time outdoors are simple, repeatable ways to support recovery.',
    ],
  },
]

/** Static educational content — same accessible <details>/<summary> pattern used across HerHealth. */
function LifestyleLearningCenter() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-full bg-support text-support-foreground">
          <BookOpen className="size-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-lg text-foreground">Learning Center</h2>
          <p className="text-caption text-muted-foreground">General wellness education, not medical advice.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {LEARNING_TOPICS.map((topic) => (
          <details key={topic.key} className="group rounded-xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground marker:content-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <span>
                {topic.title}
                <span className="ml-2 hidden font-normal text-caption text-muted-foreground sm:inline">
                  {topic.summary}
                </span>
              </span>
              <span className="shrink-0 text-caption text-muted-foreground transition-transform duration-200 group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="flex flex-col gap-2 border-t border-border p-4 pt-3">
              {topic.body.map((paragraph) => (
                <p key={paragraph} className="text-caption text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

export default LifestyleLearningCenter

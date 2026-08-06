import { BookOpen } from 'lucide-react'
import type { LearningTopic } from '@/features/hormoneBalance/types'

const LEARNING_TOPICS: LearningTopic[] = [
  {
    key: 'understanding-hormones',
    title: 'Understanding Hormones',
    summary: 'A gentle introduction to what hormones do in the body.',
    body: [
      'Hormones are chemical messengers that travel through the bloodstream, influencing everything from energy and mood to sleep and metabolism.',
      'Levels naturally rise and fall — this is a normal part of how the body regulates itself, not something to be “fixed.”',
    ],
  },
  {
    key: 'cycle-phases',
    title: 'Cycle Phases',
    summary: 'The four broad phases of a typical menstrual cycle.',
    body: [
      'A cycle is often described in four phases: menstrual, follicular, ovulatory, and luteal, each associated with different hormone patterns.',
      'Cycle length and how each phase feels can vary widely between people, and from cycle to cycle for the same person.',
    ],
  },
  {
    key: 'lifestyle-and-hormones',
    title: 'Lifestyle & Hormones',
    summary: 'How everyday habits may relate to hormonal wellbeing.',
    body: [
      'Sleep, nutrition, movement, and stress are all everyday factors that can relate to how balanced you feel.',
      'Small, consistent habits — rather than dramatic changes — tend to be the most sustainable way to support overall wellbeing.',
    ],
  },
  {
    key: 'stress-and-hormonal-wellness',
    title: 'Stress & Hormonal Wellness',
    summary: 'Why stress management is part of the wellbeing picture.',
    body: [
      'The body’s stress response is deeply connected to its broader hormonal system.',
      'Simple, repeatable practices — slow breathing, short breaks, time outdoors — can support how the body manages everyday stress over time.',
    ],
  },
  {
    key: 'sleep-and-hormonal-health',
    title: 'Sleep & Hormonal Health',
    summary: 'How rest supports the body’s natural rhythms.',
    body: [
      'Sleep plays a role in regulating many of the body’s natural rhythms and restorative processes.',
      'Keeping a fairly consistent sleep schedule can support steadier energy and mood over time.',
    ],
  },
  {
    key: 'nutrition-basics',
    title: 'Nutrition Basics',
    summary: 'General, educational nutrition information.',
    body: [
      'Regular, balanced meals with protein, fiber, and healthy fats can support steady energy throughout the day.',
      'This is general educational information, not personalized dietary advice — a healthcare provider can offer guidance specific to you.',
    ],
  },
]

/**
 * Static educational content — same accessible <details>/<summary>
 * expand-collapse pattern already used on the Dashboard and in the mobile
 * navigation, reused here rather than hand-rolled again.
 */
function LearningCenter() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-full bg-support text-support-foreground">
          <BookOpen className="size-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-lg text-foreground">Educational Learning Center</h2>
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

export default LearningCenter

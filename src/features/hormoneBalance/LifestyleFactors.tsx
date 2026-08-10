import { Apple, ChevronDown, Dumbbell, Droplet, Moon, Waves } from 'lucide-react'
import type { LifestyleFactor } from '@/features/hormoneBalance/types'

const LIFESTYLE_FACTORS: LifestyleFactor[] = [
  {
    key: 'sleep',
    icon: Moon,
    title: 'Sleep',
    summary: 'Consistent, quality sleep supports the body’s natural rhythms.',
    detail:
      'Sleep is when the body does much of its restorative work. Keeping a fairly regular sleep and wake schedule, even on weekends, can support steadier energy and mood day to day.',
  },
  {
    key: 'nutrition',
    icon: Apple,
    title: 'Nutrition',
    summary: 'Regular, balanced meals help support steady energy.',
    detail:
      'Eating regularly, with a mix of protein, fiber, and healthy fats, can help avoid the energy dips that come with skipped meals. Small, consistent habits tend to matter more than any single perfect meal.',
  },
  {
    key: 'exercise',
    icon: Dumbbell,
    title: 'Exercise',
    summary: 'Gentle, regular movement supports overall wellbeing.',
    detail:
      'Movement doesn’t need to be intense to be worthwhile — a short walk, stretching, or light activity most days can support mood, energy, and general wellbeing over time.',
  },
  {
    key: 'stress',
    icon: Waves,
    title: 'Stress',
    summary: 'How the body responds to stress can shift day to day.',
    detail:
      'Everyday stress can influence how you feel physically and emotionally. Building small, repeatable moments of calm — slow breathing, a short break, time outdoors — can support how you navigate stress over time.',
  },
  {
    key: 'hydration',
    icon: Droplet,
    title: 'Hydration',
    summary: 'Staying hydrated supports overall bodily function.',
    detail:
      'Drinking water consistently throughout the day supports energy, focus, and general comfort. Keeping a water bottle nearby is a simple way to build the habit.',
  },
]

/**
 * Purely educational content — general wellness information, not
 * personalized data or medical guidance. No user data is read or written
 * here.
 */
function LifestyleFactors() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg text-foreground">Lifestyle Factors</h2>
        <p className="text-caption text-muted-foreground">
          General, educational information — not personalized medical guidance.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LIFESTYLE_FACTORS.map((factor) => (
          <details
            key={factor.key}
            className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <summary className="flex cursor-pointer list-none items-start gap-3 marker:content-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
                <factor.icon className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{factor.title}</p>
                <p className="text-caption text-muted-foreground">{factor.summary}</p>
              </div>
              <ChevronDown
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 border-t border-border pt-3 text-caption text-muted-foreground">{factor.detail}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default LifestyleFactors

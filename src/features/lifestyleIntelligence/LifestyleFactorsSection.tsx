import { Apple, Dumbbell, Droplet, Heart, Moon, Scale, Sparkles, Waves } from 'lucide-react'
import type { LifestyleFactorCard } from '@/features/lifestyleIntelligence/types'

const NOT_TRACKED = 'Not yet tracked'

/**
 * None of these eight factors have a dedicated tracked field in HerHealth
 * today (only mood, energy, and general wellbeing are recorded), so
 * "Current consistency" and "Weekly progress" are shown honestly as not
 * yet tracked. The "AI observation" for each is general educational
 * context — never a claim about the user's own data for a factor
 * HerHealth doesn't actually measure.
 */
const LIFESTYLE_FACTORS: LifestyleFactorCard[] = [
  {
    key: 'sleep',
    icon: Moon,
    title: 'Sleep',
    description: 'Consistent, quality sleep supports the body’s natural rhythms.',
    consistency: NOT_TRACKED,
    observation: 'A steady sleep and wake schedule is one of the most supportive everyday habits.',
    tracked: false,
  },
  {
    key: 'nutrition',
    icon: Apple,
    title: 'Nutrition',
    description: 'Regular, balanced meals help support steady energy.',
    consistency: NOT_TRACKED,
    observation: 'Regular meals with protein, fiber, and healthy fats can help avoid energy dips.',
    tracked: false,
  },
  {
    key: 'hydration',
    icon: Droplet,
    title: 'Hydration',
    description: 'Staying hydrated supports overall bodily function.',
    consistency: NOT_TRACKED,
    observation: 'Keeping water nearby throughout the day is a simple way to build the habit.',
    tracked: false,
  },
  {
    key: 'exercise',
    icon: Dumbbell,
    title: 'Exercise',
    description: 'Gentle, regular movement supports overall wellbeing.',
    consistency: NOT_TRACKED,
    observation: 'Short, frequent movement breaks can be as supportive as longer sessions.',
    tracked: false,
  },
  {
    key: 'stress',
    icon: Waves,
    title: 'Stress',
    description: 'How the body responds to stress can shift day to day.',
    consistency: NOT_TRACKED,
    observation: 'Small, repeatable moments of calm can support how you navigate stress over time.',
    tracked: false,
  },
  {
    key: 'mindfulness',
    icon: Sparkles,
    title: 'Mindfulness',
    description: 'A few quiet, present moments can support overall balance.',
    consistency: NOT_TRACKED,
    observation: 'Even a minute of slow, intentional breathing can shift how a moment feels.',
    tracked: false,
  },
  {
    key: 'social-connection',
    icon: Heart,
    title: 'Social Connection',
    description: 'Meaningful connection with others supports emotional wellbeing.',
    consistency: NOT_TRACKED,
    observation: 'Even brief, genuine check-ins with people you care about can be grounding.',
    tracked: false,
  },
  {
    key: 'work-life-balance',
    icon: Scale,
    title: 'Work-Life Balance',
    description: 'Clear boundaries between work and rest support overall wellbeing.',
    consistency: NOT_TRACKED,
    observation: 'Small, protected pockets of downtime can help sustain balance over time.',
    tracked: false,
  },
]

/**
 * Reuses the same accessible <details>/<summary> expand pattern already
 * used on the Dashboard and Hormone Balance for "interactive" cards.
 */
function LifestyleFactorsSection() {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg text-foreground">Lifestyle Factors</h2>
        <p className="text-caption text-muted-foreground">
          General, educational information — not personalized medical guidance.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="text-caption text-muted-foreground">{factor.description}</p>
              </div>
              <span className="mt-1 shrink-0 text-caption text-muted-foreground transition-transform duration-200 group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <div className="flex items-center justify-between text-caption">
                <span className="text-muted-foreground">Current consistency</span>
                <span className="font-medium text-foreground">{factor.consistency}</span>
              </div>
              <div className="flex items-center justify-between text-caption">
                <span className="text-muted-foreground">Weekly progress</span>
                <span className="font-medium text-foreground">{NOT_TRACKED}</span>
              </div>
              <p className="text-caption text-muted-foreground">{factor.observation}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

export default LifestyleFactorsSection

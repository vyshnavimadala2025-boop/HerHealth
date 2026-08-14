import { Apple, ChevronDown, Dumbbell, Droplet, Heart, Moon, Scale, Sparkles, Waves } from 'lucide-react'
import type { LifestyleFactorCard } from '@/features/lifestyleIntelligence/types'
import type { SourceStatus } from '@/components/shared/dataStateText'
import { describeTrackedFactor } from '@/components/shared/dataStateText'
import type { SleepSummary } from '@/features/sleepIntelligence/sleepCalculations'
import type { NutritionSummary } from '@/features/nutritionCompanion/nutritionCalculations'
import type { StressRecoverySummary } from '@/features/stressRecovery/stressRecoveryCalculations'

const NOT_TRACKED = 'Not yet tracked'

/**
 * Exercise, Mindfulness, Social Connection, and Work-Life Balance have no
 * dedicated tracked field anywhere in SIRILA today, so they stay
 * honestly "not yet tracked". Sleep, Nutrition, Hydration, and Stress are
 * built from LifestyleIntelligencePage's real Stage 3 data below.
 */
const UNTRACKED_FACTORS: LifestyleFactorCard[] = [
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

interface LifestyleFactorsSectionProps {
  sleepStatus: SourceStatus
  sleepSummary: SleepSummary
  nutritionStatus: SourceStatus
  nutritionSummary: NutritionSummary
  stressRecoveryStatus: SourceStatus
  stressRecoverySummary: StressRecoverySummary
}

/**
 * Reuses the same accessible <details>/<summary> expand pattern already
 * used on the Dashboard and Hormone Balance for "interactive" cards.
 */
function LifestyleFactorsSection({
  sleepStatus,
  sleepSummary,
  nutritionStatus,
  nutritionSummary,
  stressRecoveryStatus,
  stressRecoverySummary,
}: LifestyleFactorsSectionProps) {
  const sleep = describeTrackedFactor(
    sleepStatus,
    sleepSummary.hasSufficientData,
    `${sleepSummary.consistencyPercent}% of nights logged`,
    `Quality trend: ${sleepSummary.qualityTrend}`,
  )
  const nutrition = describeTrackedFactor(
    nutritionStatus,
    nutritionSummary.hasSufficientData,
    `${nutritionSummary.consistencyPercent}% of days logged`,
    `${nutritionSummary.totalMealsLogged} meals logged this month`,
  )
  const hydration = describeTrackedFactor(
    nutritionStatus,
    nutritionSummary.hasSufficientData && nutritionSummary.avgHydrationGlasses !== null,
    `Avg ${nutritionSummary.avgHydrationGlasses} glasses/day`,
    `Trend: ${nutritionSummary.hydrationTrend}`,
  )
  const stress = describeTrackedFactor(
    stressRecoveryStatus,
    stressRecoverySummary.hasSufficientData,
    `${stressRecoverySummary.consistencyPercent}% of days logged`,
    `Trend: ${stressRecoverySummary.stressTrend}`,
  )

  const lifestyleFactors: LifestyleFactorCard[] = [
    {
      key: 'sleep',
      icon: Moon,
      title: 'Sleep',
      description: 'Consistent, quality sleep supports the body’s natural rhythms.',
      consistency: sleep.statusText,
      observation: 'A steady sleep and wake schedule is one of the most supportive everyday habits.',
      tracked: true,
    },
    {
      key: 'nutrition',
      icon: Apple,
      title: 'Nutrition',
      description: 'Regular, balanced meals help support steady energy.',
      consistency: nutrition.statusText,
      observation: 'Regular meals with protein, fiber, and healthy fats can help avoid energy dips.',
      tracked: true,
    },
    {
      key: 'hydration',
      icon: Droplet,
      title: 'Hydration',
      description: 'Staying hydrated supports overall bodily function.',
      consistency: hydration.statusText,
      observation: 'Keeping water nearby throughout the day is a simple way to build the habit.',
      tracked: true,
    },
    UNTRACKED_FACTORS[0],
    {
      key: 'stress',
      icon: Waves,
      title: 'Stress',
      description: 'How the body responds to stress can shift day to day.',
      consistency: stress.statusText,
      observation: 'Small, repeatable moments of calm can support how you navigate stress over time.',
      tracked: true,
    },
    UNTRACKED_FACTORS[1],
    UNTRACKED_FACTORS[2],
    UNTRACKED_FACTORS[3],
  ]

  const weeklyProgress: Record<string, string> = {
    sleep: sleep.trendText,
    nutrition: nutrition.trendText,
    hydration: hydration.trendText,
    stress: stress.trendText,
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg text-foreground">Lifestyle Factors</h2>
        <p className="text-caption text-muted-foreground">
          General, educational information — not personalized medical guidance.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {lifestyleFactors.map((factor) => (
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
              <ChevronDown
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <div className="flex items-center justify-between text-caption">
                <span className="text-muted-foreground">Current consistency</span>
                <span className="font-medium text-foreground">{factor.consistency}</span>
              </div>
              <div className="flex items-center justify-between text-caption">
                <span className="text-muted-foreground">Weekly progress</span>
                <span className="font-medium text-foreground">{weeklyProgress[factor.key] ?? NOT_TRACKED}</span>
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

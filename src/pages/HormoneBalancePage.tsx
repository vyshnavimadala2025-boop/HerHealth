import { useHormoneBalanceData } from '@/features/hormoneBalance/useHormoneBalanceData'
import { generateHormoneInsights, generateHormoneSuggestions } from '@/features/hormoneBalance/hormoneInsightEngine'
import HormoneBalanceHero from '@/features/hormoneBalance/HormoneBalanceHero'
import TodayHormoneWellness, { buildTodayHormoneWellnessCards } from '@/features/hormoneBalance/TodayHormoneWellness'
import HormoneInsights from '@/features/hormoneBalance/HormoneInsights'
import LifestyleFactors from '@/features/hormoneBalance/LifestyleFactors'
import LearningCenter from '@/features/hormoneBalance/LearningCenter'
import WellnessSuggestions from '@/features/hormoneBalance/WellnessSuggestions'
import ProgressTimeline from '@/features/hormoneBalance/ProgressTimeline'
import PrivacyBadge from '@/components/shared/PrivacyBadge'

/**
 * Hormone Balance — a presentation-layer feature per its spec: no new
 * tables, services, or backend logic. "Today's Hormone Wellness" and
 * "Progress Timeline" reuse real, already-tracked HerHealth data (daily
 * check-ins for mood/energy, period records for an estimated cycle phase);
 * everything else the schema doesn't yet capture (sleep, stress,
 * hydration, movement) is labeled honestly as not yet tracked rather than
 * filled with invented numbers. "AI" sections use the same deterministic,
 * rule-based pattern as the rest of HerHealth (Wellness Insights,
 * Fertility Journey, Baby Growth) — never a real model call.
 */
function HormoneBalancePage() {
  const { status, todayCheckIn, weeklySummary, moodTrend, energyTrend, cyclePhaseEstimate, weeklyProgress } =
    useHormoneBalanceData()

  const wellnessCards = buildTodayHormoneWellnessCards(todayCheckIn, cyclePhaseEstimate)
  const insights = generateHormoneInsights({ weeklySummary, moodTrend, energyTrend, cyclePhaseEstimate })
  const suggestions = generateHormoneSuggestions({ moodTrend, energyTrend })

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <HormoneBalanceHero />

      <PrivacyBadge label="Your wellness information is private to your account" />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-lg text-foreground">Today&apos;s Hormone Wellness</h2>
          <p className="text-caption text-muted-foreground">
            A snapshot built from the information you&apos;ve recorded today.
          </p>
        </div>
        <TodayHormoneWellness status={status} cards={wellnessCards} />
      </section>

      <HormoneInsights status={status} insights={insights} />

      <LifestyleFactors />

      <LearningCenter />

      <WellnessSuggestions status={status} suggestions={suggestions} />

      <ProgressTimeline status={status} weeklyProgress={weeklyProgress} />

      <p className="text-center text-caption text-muted-foreground">
        Hormone Balance is an educational wellness companion. It never diagnoses conditions,
        predicts health outcomes, or replaces professional medical advice.
      </p>
    </main>
  )
}

export default HormoneBalancePage

import EnvironmentalWellnessHero from '@/features/environmentalWellness/EnvironmentalWellnessHero'
import TodaysEnvironment from '@/features/environmentalWellness/TodaysEnvironment'
import UpcomingTrackingPanel from '@/features/environmentalWellness/UpcomingTrackingPanel'
import LifestyleSuggestionsSection from '@/features/environmentalWellness/LifestyleSuggestionsSection'
import PrivacyBadge from '@/components/shared/PrivacyBadge'

/**
 * Environmental Wellness — presentation layer only, per this feature's
 * explicit instructions: no backend logic, no service, and no schema
 * changes without separate approval. "Today's Environment" and "Lifestyle
 * Suggestions" don't depend on any tracked data, so they're fully built
 * here. Daily Exposure Check-in, Environment Timeline, Pattern Discovery,
 * Weekly Environmental Summary, and AI Wellness Reflection all need a new
 * table HerHealth doesn't have yet (see UpcomingTrackingPanel) — per
 * instruction, that requires a stop-and-report rather than new SQL.
 */
function EnvironmentalWellnessPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <EnvironmentalWellnessHero />

      <PrivacyBadge label="Your wellness information is private to your account" />

      <TodaysEnvironment status="ready" />

      <UpcomingTrackingPanel />

      <LifestyleSuggestionsSection />

      <p className="text-center text-caption text-muted-foreground">
        Environmental Wellness is an educational wellness companion. It never diagnoses, predicts
        disease, or replaces professional medical advice.
      </p>
    </main>
  )
}

export default EnvironmentalWellnessPage

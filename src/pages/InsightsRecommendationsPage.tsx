import { Link } from 'react-router-dom'
import { Baby, Compass, Feather, HeartPulse, Sparkles, Target, TrendingUp, Waves, Wind } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import InsightsSubNav from '@/features/insights/InsightsSubNav'
import { useInsightsData } from '@/features/insights/useInsightsData'
import { generateHabitRecommendations } from '@/features/lifestyleIntelligence/lifestyleInsightEngine'

const HABIT_TIPS = [
  'Keep a consistent sleep and wake time, even on weekends.',
  'Pair a new habit with one you already do daily, like check-ins.',
  'Small, repeatable actions tend to stick better than big, occasional ones.',
]

const EXPLORE_MORE = [
  { key: 'hormone-balance', name: 'Hormone Balance', href: '/hormone-balance', icon: Waves },
  { key: 'lifestyle-intelligence', name: 'Lifestyle Intelligence', href: '/lifestyle-intelligence', icon: Compass },
  { key: 'environmental-wellness', name: 'Environmental Wellness', href: '/environmental-wellness', icon: Wind },
  { key: 'wellness-goals', name: 'Wellness Goals', href: '/goals', icon: Target },
  { key: 'fertility-journey', name: 'Fertility Journey', href: '/fertility-journey', icon: HeartPulse },
  { key: 'baby-growth', name: 'Baby Growth', href: '/baby-growth', icon: Baby },
]

/**
 * Insights → Recommendations. "Personalized Suggestions" reuses the real,
 * rule-based habit-recommendation engine already built for Lifestyle
 * Intelligence (cross-feature reuse, not a new copy). "Habit Improvements"
 * is general, honest educational guidance. "Wellness Opportunities" is a
 * real, static list of SIRILA features — not a claim of personalized
 * detection of what you haven't tried, which this stage doesn't compute.
 */
function InsightsRecommendationsPage() {
  const { moodTrend, energyTrend } = useInsightsData()
  const suggestions = generateHabitRecommendations({ moodTrend, energyTrend })

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-support text-support-foreground">
          <Feather className="size-6" aria-hidden="true" />
        </div>
        <PageHeader title="Recommendations" description="Gentle, educational suggestions — never medical." />
      </div>

      <InsightsSubNav />

      <div id="suggestions" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
                <Sparkles className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>Personalized Suggestions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <ul className="flex flex-col gap-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id} className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <p className="text-foreground">{suggestion.message}</p>
                </li>
              ))}
            </ul>
            <p className="text-caption text-muted-foreground">
              Gentle, general suggestions only — never a diagnosis or treatment plan.
            </p>
          </CardContent>
        </Card>
      </div>

      <div id="habits" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-blush text-blush-foreground">
                <Feather className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>Habit Improvements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {HABIT_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  <p className="text-foreground">{tip}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div id="opportunities" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <TrendingUp className="size-4" aria-hidden="true" />
              </div>
              <CardTitle>Wellness Opportunities</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">A few other parts of SIRILA you might not have explored yet.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {EXPLORE_MORE.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <item.icon className="size-4 text-primary" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default InsightsRecommendationsPage

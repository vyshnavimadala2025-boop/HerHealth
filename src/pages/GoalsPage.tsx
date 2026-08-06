import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Compass,
  HeartHandshake,
  Leaf,
  Lock,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGoalsData } from '@/features/goals/useGoalsData'
import { useProgressSummary } from '@/features/goals/useProgressSummary'
import { useReminderPreferences } from '@/features/reminders/useReminderPreferences'
import ProgressSummaryCard from '@/features/goals/ProgressSummaryCard'
import GoalForm from '@/features/goals/GoalForm'
import GoalList from '@/features/goals/GoalList'
import ReminderPreferencesForm from '@/features/reminders/ReminderPreferencesForm'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import type { WellnessGoal } from '@/features/goals/types'
import goalsHeroImage from '@/assets/images/wellness-goals-personal-progress-hero.png'

const HERO_OVERLAY =
  'linear-gradient(90deg, rgba(28, 8, 25, 0.88) 0%, rgba(28, 8, 25, 0.7) 40%, rgba(28, 8, 25, 0.22) 68%, rgba(28, 8, 25, 0.04) 100%)'

/**
 * "Ideas to get started" — illustrative goal ideas, not a fixed list of
 * app features. Goals in this app are free-text (see GoalForm), so any
 * of these can genuinely be created as-is; they're loosely grouped under
 * the real GOAL_CATEGORIES (checkins/journaling/cycle_tracking/custom)
 * rather than implying distinct backend features that don't exist.
 */
const GOAL_IDEAS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: CalendarClock,
    title: 'Improve daily consistency',
    description: 'A simple check-in goal, a few times a week or daily.',
  },
  {
    icon: Leaf,
    title: 'Support better sleep',
    description: 'A personal goal to notice and support your rest.',
  },
  {
    icon: BookOpen,
    title: 'Build a reflection habit',
    description: 'A journaling goal for quiet, private reflection.',
  },
  {
    icon: HeartHandshake,
    title: 'Stay connected to my cycle',
    description: 'A cycle-tracking consistency goal, on your own schedule.',
  },
  {
    icon: Compass,
    title: 'Make time for gentle movement',
    description: 'A custom goal shaped entirely around what feels good to you.',
  },
  {
    icon: Sparkles,
    title: 'Focus on personal wellbeing',
    description: 'Any custom goal — the title and pace are entirely yours.',
  },
]

const PROGRESS_STEPS = [
  { title: 'Choose what matters to you', description: 'Pick an area you actually want to focus on.' },
  { title: 'Set a realistic wellness goal', description: 'Give it a title, and a target if that helps you.' },
  { title: 'Complete small daily check-ins', description: 'A little, often, is enough — there is no minimum.' },
  { title: 'Notice your progress over time', description: 'Your own recorded activity, reflected back to you.' },
]

function GoalsPage() {
  const {
    goals,
    status: goalsStatus,
    create,
    update,
    complete,
    reopen,
    archive,
    removeGoal,
    retry: retryGoals,
  } = useGoalsData()
  const { counts, status: progressStatus } = useProgressSummary()
  const { preferences, status: reminderStatus, save: saveReminder } = useReminderPreferences()
  const [editingGoal, setEditingGoal] = useState<WellnessGoal | null>(null)

  const { activeGoalsCount, completedGoalsCount } = useMemo(
    () => ({
      activeGoalsCount: goals.filter((goal) => goal.status === 'active').length,
      completedGoalsCount: goals.filter((goal) => goal.status === 'completed').length,
    }),
    [goals],
  )

  const handleSaved = () => setEditingGoal(null)

  const handleDeleted = (goalId: string) => {
    removeGoal(goalId)
    if (editingGoal?.id === goalId) {
      setEditingGoal(null)
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      {/*
        Same proven full-bleed hero mechanics as the landing/About/PCOS
        heroes: fixed hero-panel tokens (text stays readable regardless of
        site theme, since the photo behind it never changes), a stacked
        compact block below `lg`, full-bleed background above it.
      */}
      <section className="relative bg-hero-panel lg:flex lg:min-h-[560px] lg:items-center xl:min-h-[640px]">
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-14 pb-8 sm:px-6 md:pt-16 lg:py-20">
          <div className="flex max-w-lg animate-in fade-in slide-in-from-bottom-4 flex-col items-start gap-6 text-left duration-700">
            <p className="text-caption font-medium tracking-[0.14em] text-hero-panel-accent uppercase">
              Wellness Goals &amp; Personal Progress
            </p>
            <h1 className="text-title font-display sm:text-display">
              <span className="block text-hero-panel-foreground">Small Steps.</span>
              <span className="block text-hero-panel-accent">Meaningful Progress.</span>
            </h1>
            <p className="text-body-lg text-hero-panel-foreground/80">
              Set wellness goals, build supportive routines, and see how your everyday choices come
              together over time.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-hero-panel-foreground text-hero-panel hover:bg-hero-panel-foreground/90 sm:w-auto"
              >
                <a href="#new-goal">Set a Wellness Goal</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-hero-panel-foreground/40 bg-transparent text-hero-panel-foreground hover:bg-hero-panel-foreground/10 sm:w-auto"
              >
                <a href="#progress">View My Progress</a>
              </Button>
            </div>
          </div>
        </div>

        <div
          role="img"
          aria-label="A woman reviewing her personal wellness progress on a tablet, in a calm, warm setting"
          className="h-[360px] w-full animate-in fade-in bg-cover bg-[62%_40%] duration-1000 sm:h-[420px] md:h-[480px] lg:hidden"
          style={{ backgroundImage: `url(${goalsHeroImage})` }}
        />
        <div
          role="img"
          aria-label="A woman reviewing her personal wellness progress on a tablet, in a calm, warm setting"
          className="hidden animate-in fade-in duration-1000 lg:absolute lg:inset-0 lg:z-0 lg:block lg:bg-cover lg:bg-[58%_38%]"
          style={{ backgroundImage: `${HERO_OVERLAY}, url(${goalsHeroImage})` }}
        />
      </section>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-4 py-16 sm:px-6">
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-heading text-foreground">Progress looks different for everyone</h2>
          <p className="text-body text-muted-foreground">
            Wellness progress is personal, and it doesn&apos;t need to be perfect. HerHealth is here
            to help you notice small improvements, build routines that actually fit your life, and
            move forward at whatever pace feels comfortable to you.
          </p>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-heading text-foreground">Create meaningful wellness goals</h2>
            <p className="text-body text-muted-foreground">
              A few ideas to get started — every goal is written in your own words below.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {GOAL_IDEAS.map((idea) => (
              <div key={idea.title} className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush text-primary">
                  <idea.icon className="size-4.5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{idea.title}</p>
                  <p className="text-caption text-muted-foreground">{idea.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="font-display text-heading text-foreground">Build progress through small actions</h2>
          <div className="relative flex flex-col gap-8">
            {PROGRESS_STEPS.map((step, index) => (
              <div key={step.title} className="relative flex gap-4">
                {index < PROGRESS_STEPS.length - 1 && (
                  <div
                    className="absolute top-12 left-6 h-[calc(100%+2rem)] w-px bg-border"
                    aria-hidden="true"
                  />
                )}
                <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-lavender font-display text-lg text-primary">
                  {index + 1}
                </div>
                <div className="flex flex-col gap-1 pt-1.5">
                  <h3 className="font-display text-lg text-foreground">{step.title}</h3>
                  <p className="text-body text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="progress" className="flex scroll-mt-20 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-heading text-foreground">See your personal progress</h2>
            <p className="text-body text-muted-foreground">
              A calm summary of your own recorded activity — not a score, and never compared to
              anyone else.
            </p>
          </div>
          <ProgressSummaryCard
            status={progressStatus}
            counts={counts}
            activeGoalsCount={activeGoalsCount}
            completedGoalsCount={completedGoalsCount}
          />
        </section>

        <section className="flex flex-col gap-3 text-center">
          <div className="mx-auto flex items-center gap-2">
            <CheckCircle2 className="size-5 text-support-foreground" aria-hidden="true" />
            <h2 className="font-display text-heading text-foreground">Every check-in counts</h2>
          </div>
          <p className="mx-auto max-w-xl text-body text-muted-foreground">
            Progress can be gradual and non-linear. If you miss a few days, there&apos;s no penalty
            and nothing to catch up on — just come back to your routine whenever feels right.
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <ClipboardList className="size-4" aria-hidden="true" />
            </div>
            <h2 className="font-display text-base text-foreground">Personal insights</h2>
          </div>
          <p className="text-body text-muted-foreground">
            Your progress is more than a number. HerHealth brings your check-ins, goals, and
            personal reflections together so you can better understand what supports your
            wellbeing.
          </p>
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link to="/dashboard#insights">Explore My Insights</Link>
          </Button>
        </section>

        <section className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-5">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Privacy and personal control</p>
          </div>
          <p className="text-caption text-muted-foreground">
            Your goals and progress stay private to your account and under your control. Progress
            is personal — it&apos;s never made public or compared between users. Read more on our{' '}
            <Link to="/privacy" className="text-primary underline underline-offset-2">
              Privacy
            </Link>{' '}
            page.
          </p>
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm sm:px-10">
          <div className="flex size-11 items-center justify-center rounded-full bg-lavender text-primary">
            <Target className="size-5" aria-hidden="true" />
          </div>
          <h2 className="max-w-md text-title font-display text-foreground">Start with one small goal</h2>
          <p className="max-w-md text-body text-muted-foreground">
            Choose one supportive action and give yourself space to grow at your own pace.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href="#new-goal">Create My Goal</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/">Explore HerHealth</Link>
            </Button>
          </div>
        </section>
      </div>

      <div className="bg-blush/10">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-12 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
          <PageHeader
            title="Wellness Goals & Progress"
            description="Private, self-directed wellness routines and self-tracking tools."
            captions={[
              'This is a personal tracking tool and is not medical advice. You can adjust any goal at any time.',
              'Your goals, progress, and reminder preferences are private and visible only to you.',
            ]}
          />
          <PrivacyBadge label="Goals and progress are private to your account" />

          <div id="reminders" className="scroll-mt-24">
            <ReminderPreferencesForm status={reminderStatus} preferences={preferences} onSave={saveReminder} />
          </div>

          <div id="new-goal" className="scroll-mt-24">
            <GoalForm
              editingGoal={editingGoal}
              onCreate={create}
              onUpdate={update}
              onSaved={handleSaved}
              onCancelEdit={() => setEditingGoal(null)}
            />
          </div>

          <GoalList
            status={goalsStatus}
            goals={goals}
            onEdit={setEditingGoal}
            onComplete={complete}
            onReopen={reopen}
            onArchive={archive}
            onDeleted={handleDeleted}
            onRetry={retryGoals}
          />
        </div>
      </div>

      <p className="mx-auto w-full max-w-2xl px-4 pb-12 text-center text-caption text-muted-foreground sm:px-6">
        HerHealth supports personal wellness awareness and reflection. It is not a substitute for
        professional medical advice.
      </p>
    </main>
  )
}

export default GoalsPage

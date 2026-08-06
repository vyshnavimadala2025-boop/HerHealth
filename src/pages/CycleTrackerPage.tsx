import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarHeart, NotebookPen, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/useAuth'
import { useCycleTrackerData } from '@/features/periods/useCycleTrackerData'
import PeriodForm from '@/features/periods/PeriodForm'
import PeriodHistory from '@/features/periods/PeriodHistory'
import CycleOverview from '@/features/periods/CycleOverview'
import PageHeader from '@/components/shared/PageHeader'
import type { PeriodRecord } from '@/features/periods/types'
import cycleTrackerImage from '@/assets/images/herhealth-cycle-tracker-hero.png'

const FEATURE_HIGHLIGHTS: { icon: LucideIcon; accent: string; title: string; description: string }[] = [
  {
    icon: CalendarHeart,
    accent: 'bg-blush text-primary',
    title: 'Record your dates',
    description: 'Log period start and end dates in a simple, private form.',
  },
  {
    icon: SlidersHorizontal,
    accent: 'bg-lavender text-primary',
    title: 'Notice your patterns',
    description: 'See an estimated cycle length and next period, based on your own recorded dates.',
  },
  {
    icon: NotebookPen,
    accent: 'bg-blush text-primary',
    title: 'Stay in control',
    description: 'Edit or delete any record whenever you choose.',
  },
]

/**
 * No visual month-grid calendar exists anywhere in this codebase — the
 * real Cycle Tracker is a summary panel (CycleOverview), a native
 * date-input form (PeriodForm), and a history list (PeriodHistory). This
 * redesign applies the requested premium treatment to that real surface
 * rather than inventing a calendar-grid component, which would be new
 * functionality, not a UI enhancement of what exists.
 */
function CycleTrackerPage() {
  const { user } = useAuth()
  const { records, status, refresh } = useCycleTrackerData()
  const [editingRecord, setEditingRecord] = useState<PeriodRecord | null>(null)

  const handleSaved = () => {
    setEditingRecord(null)
    refresh()
  }

  const handleDeleted = () => {
    setEditingRecord(null)
    refresh()
  }

  return (
    <main className="flex flex-1 flex-col">
      <section className="bg-blush/10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[56fr_44fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
            <div className="overflow-hidden rounded-2xl shadow-md">
              <img
                src={cycleTrackerImage}
                alt="HerHealth cycle tracking calendar displayed on a phone in a calm personal wellness setting"
                width={1536}
                height={1024}
                loading="eager"
                decoding="async"
                className="aspect-[4/3] w-full object-cover object-[34%_42%] sm:aspect-[16/10] sm:object-[32%_38%] lg:aspect-[4/5] lg:object-[30%_36%]"
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 motion-reduce:animate-none">
            <p className="text-caption font-medium tracking-[0.14em] text-primary uppercase">
              Your Cycle, Your Pattern
            </p>
            <h1 className="text-title font-display text-foreground sm:text-display">
              Understand your cycle, your way.
            </h1>
            <p className="text-body-lg text-muted-foreground">
              Track important cycle information, notice patterns over time, and build a more
              personal understanding of your wellness — at your own pace.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg">
                <a href="#tracker">Open Cycle Tracker</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/how-it-works">Learn How Tracking Works</Link>
              </Button>
            </div>

            <div className="mt-3 flex w-full flex-col gap-4 border-t border-border pt-5">
              {FEATURE_HIGHLIGHTS.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${feature.accent}`}
                  >
                    <feature.icon className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{feature.title}</p>
                    <p className="text-caption text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="tracker" className="scroll-mt-20">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-12 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
          <PageHeader
            title="Cycle Tracker"
            description="Track your cycle and understand your personal patterns."
            captions={[
              'Your cycle information is private and visible only to you. You can review and manage it anytime.',
              'Cycle estimates are based on your recorded dates and are not medical predictions.',
            ]}
          />

          <CycleOverview status={status} records={records} />

          {user && (
            <div id="add-period" className="scroll-mt-24">
              <PeriodForm
                userId={user.id}
                editingRecord={editingRecord}
                onSaved={handleSaved}
                onCancelEdit={() => setEditingRecord(null)}
              />
            </div>
          )}

          <PeriodHistory
            status={status}
            records={records}
            onEdit={setEditingRecord}
            onDeleted={handleDeleted}
          />
        </div>
      </div>
    </main>
  )
}

export default CycleTrackerPage

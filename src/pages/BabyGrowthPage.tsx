import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Baby, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/useAuth'
import { usePregnancyData } from '@/features/pregnancy/usePregnancyData'
import { generatePregnancyInsights } from '@/features/pregnancy/pregnancyInsightEngine'
import { getPregnancyAppointments } from '@/features/pregnancy/pregnancyAppointmentService'
import { getPregnancyMilestones } from '@/features/pregnancy/pregnancyMilestoneService'
import { getChecklistItems } from '@/features/pregnancy/pregnancyChecklistService'
import { getKickSessions } from '@/features/pregnancy/pregnancyKickSessionService'
import PregnancySetup from '@/features/pregnancy/PregnancySetup'
import PregnancyDashboardSummary from '@/features/pregnancy/PregnancyDashboardSummary'
import BabyDevelopmentTimeline from '@/features/pregnancy/BabyDevelopmentTimeline'
import PregnancyEntryForm from '@/features/pregnancy/PregnancyEntryForm'
import PregnancyHistory from '@/features/pregnancy/PregnancyHistory'
import PregnancyInsights from '@/features/pregnancy/PregnancyInsights'
import AppointmentPlanner from '@/features/pregnancy/AppointmentPlanner'
import MilestoneGallery from '@/features/pregnancy/MilestoneGallery'
import ShoppingChecklist from '@/features/pregnancy/ShoppingChecklist'
import BirthPlanOrganizer from '@/features/pregnancy/BirthPlanOrganizer'
import KickCounter from '@/features/pregnancy/KickCounter'
import KickSessionHistory from '@/features/pregnancy/KickSessionHistory'
import WeeklyReport from '@/features/pregnancy/WeeklyReport'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import type {
  PregnancyAppointment,
  PregnancyChecklistItem,
  PregnancyEntry,
  PregnancyKickSession,
  PregnancyMilestone,
} from '@/features/pregnancy/types'

type SubStatus = 'loading' | 'ready' | 'error'

/**
 * Baby Growth — a pregnancy wellness companion, not a medical device.
 * Current week/trimester/due-date figures come from
 * pregnancyCalculations.ts applied to the due date the user entered
 * themselves; insights are the same rule-based approach used everywhere
 * else in this app (Fertility Journey, Wellness Insights), described
 * honestly rather than as literal "AI".
 */
function BabyGrowthPage() {
  const { user } = useAuth()
  const { status, profile, entries, entriesThisWeek, progress, wellnessScore, refresh } = usePregnancyData()

  const [editingEntry, setEditingEntry] = useState<PregnancyEntry | null>(null)

  const [appointments, setAppointments] = useState<PregnancyAppointment[]>([])
  const [appointmentsStatus, setAppointmentsStatus] = useState<SubStatus>('loading')
  const [milestones, setMilestones] = useState<PregnancyMilestone[]>([])
  const [milestonesStatus, setMilestonesStatus] = useState<SubStatus>('loading')
  const [checklistItems, setChecklistItems] = useState<PregnancyChecklistItem[]>([])
  const [checklistStatus, setChecklistStatus] = useState<SubStatus>('loading')
  const [kickSessions, setKickSessions] = useState<PregnancyKickSession[]>([])
  const [kickSessionsStatus, setKickSessionsStatus] = useState<SubStatus>('loading')

  const loadAppointments = useCallback(() => {
    if (!user) return
    setAppointmentsStatus('loading')
    getPregnancyAppointments(user.id)
      .then((result) => {
        setAppointments(result)
        setAppointmentsStatus('ready')
      })
      .catch(() => setAppointmentsStatus('error'))
  }, [user])

  const loadMilestones = useCallback(() => {
    if (!user) return
    setMilestonesStatus('loading')
    getPregnancyMilestones(user.id)
      .then((result) => {
        setMilestones(result)
        setMilestonesStatus('ready')
      })
      .catch(() => setMilestonesStatus('error'))
  }, [user])

  const loadChecklist = useCallback(() => {
    if (!user) return
    setChecklistStatus('loading')
    getChecklistItems(user.id)
      .then((result) => {
        setChecklistItems(result)
        setChecklistStatus('ready')
      })
      .catch(() => setChecklistStatus('error'))
  }, [user])

  const loadKickSessions = useCallback(() => {
    if (!user) return
    setKickSessionsStatus('loading')
    getKickSessions(user.id)
      .then((result) => {
        setKickSessions(result)
        setKickSessionsStatus('ready')
      })
      .catch(() => setKickSessionsStatus('error'))
  }, [user])

  useEffect(() => {
    if (!profile) return
    loadAppointments()
    loadMilestones()
    loadChecklist()
    loadKickSessions()
  }, [profile, loadAppointments, loadMilestones, loadChecklist, loadKickSessions])

  if (status !== 'loading' && !profile) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6 p-4 py-16 sm:p-6">
        {status === 'error' && (
          <p role="alert" className="text-center text-caption text-muted-foreground">
            We couldn&apos;t check whether you&apos;ve already set up Baby Growth, but you can
            still begin below.
          </p>
        )}
        {user && <PregnancySetup userId={user.id} onSaved={refresh} />}
      </main>
    )
  }

  const insights = profile ? generatePregnancyInsights(entriesThisWeek, wellnessScore, progress?.currentWeek ?? 1) : []

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <Baby className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Baby Growth"
          description="A calm, supportive pregnancy wellness companion — week by week, at your own pace."
          captions={[
            'This is a wellness companion, not a medical device, diagnosis tool, or replacement for professional medical advice.',
            'HerHealth never diagnoses and never predicts health outcomes.',
          ]}
        />
        <PrivacyBadge label="Your pregnancy information is private to your account" />
      </div>

      {status === 'loading' && <p className="text-sm text-muted-foreground">Loading your pregnancy overview…</p>}

      {profile && progress && (
        <>
          <PregnancyDashboardSummary status={status} progress={progress} wellnessScore={wellnessScore} />

          <BabyDevelopmentTimeline currentWeek={progress.currentWeek} />

          <div id="pregnancy-entry-form" className="scroll-mt-24">
            {user && (
              <PregnancyEntryForm
                userId={user.id}
                editingEntry={editingEntry}
                onSaved={() => {
                  setEditingEntry(null)
                  refresh()
                }}
                onCancelEdit={() => setEditingEntry(null)}
              />
            )}
          </div>

          <PregnancyInsights status={status} insights={insights} />

          {user && (
            <AppointmentPlanner userId={user.id} status={appointmentsStatus} appointments={appointments} onChanged={loadAppointments} />
          )}

          {user && (
            <MilestoneGallery userId={user.id} status={milestonesStatus} milestones={milestones} onChanged={loadMilestones} />
          )}

          {user && <KickCounter userId={user.id} onSaved={loadKickSessions} />}

          <KickSessionHistory status={kickSessionsStatus} sessions={kickSessions} onDeleted={loadKickSessions} />

          {user && (
            <ShoppingChecklist userId={user.id} status={checklistStatus} items={checklistItems} onChanged={loadChecklist} />
          )}

          {user && <BirthPlanOrganizer userId={user.id} profile={profile} onSaved={refresh} />}

          <PregnancyHistory
            status={status}
            entries={entries}
            onEdit={(entry) => {
              setEditingEntry(entry)
              document.getElementById('pregnancy-entry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            onDeleted={refresh}
          />

          <WeeklyReport status={status} entries={entries} milestones={milestones} wellnessScore={wellnessScore} />

          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-5">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">Pregnancy journal</p>
            </div>
            <p className="text-caption text-muted-foreground">
              Record your feelings, memories, milestones, and reflections in your private journal —
              the same journal you already use elsewhere in HerHealth.
            </p>
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link to="/journal">Open Your Journal</Link>
            </Button>
          </section>
        </>
      )}

      <p className="text-center text-caption text-muted-foreground">
        HerHealth supports personal wellness awareness and reflection. It is not a substitute for
        professional medical advice.
      </p>
    </main>
  )
}

export default BabyGrowthPage

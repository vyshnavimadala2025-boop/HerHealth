import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useFertilityData } from '@/features/fertility/useFertilityData'
import { generateFertilityInsights } from '@/features/fertility/fertilityInsightEngine'
import FertilityDashboardSummary from '@/features/fertility/FertilityDashboardSummary'
import FertilityCalendar from '@/features/fertility/FertilityCalendar'
import FertilityEntryForm from '@/features/fertility/FertilityEntryForm'
import FertilityHistory from '@/features/fertility/FertilityHistory'
import FertilityInsights from '@/features/fertility/FertilityInsights'
import FertilityTimeline from '@/features/fertility/FertilityTimeline'
import FertilityReportSummary from '@/features/fertility/FertilityReportSummary'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import { getPeriodRecords } from '@/features/periods/periodService'
import type { PeriodRecord } from '@/features/periods/types'
import type { FertilityEntry } from '@/features/fertility/types'

/**
 * Fertility Journey — a wellness companion, not a medical device or
 * conception guarantee. Fertile-window/ovulation figures come from
 * fertilityCalculations.ts applied to the user's own recorded period
 * dates (same source data as Cycle Tracker); insights are the same
 * rule-based approach used everywhere else in this app, described
 * honestly rather than as "AI-powered".
 */
function FertilityJourneyPage() {
  const { user } = useAuth()
  const {
    status,
    entries,
    hasCycleData,
    cycleLength,
    fertilityWindow,
    entriesThisWeek,
    habitConsistencyPercent,
    refresh,
  } = useFertilityData()

  const [periodRecords, setPeriodRecords] = useState<PeriodRecord[]>([])
  const [editingEntry, setEditingEntry] = useState<FertilityEntry | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    let active = true
    getPeriodRecords(user.id)
      .then((records) => {
        if (active) setPeriodRecords(records)
      })
      .catch(() => {
        /* the calendar simply shows no period shading; FertilityDashboardSummary's own
           error state already communicates a load failure for this page */
      })
    return () => {
      active = false
    }
  }, [user, status])

  const insights = generateFertilityInsights(entriesThisWeek, habitConsistencyPercent, fertilityWindow, hasCycleData)

  const handleSaved = () => {
    setEditingEntry(null)
    setSelectedDate(undefined)
    refresh()
  }

  const handleSelectDate = (date: string) => {
    const existing = entries.find((entry) => entry.entryDate === date)
    setEditingEntry(existing ?? null)
    setSelectedDate(date)
    document.getElementById('fertility-entry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
          <Sparkles className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Fertility Journey"
          description="A supportive space to understand your body, build healthy habits, and notice fertility-related wellness patterns — at your own pace."
          captions={[
            'This is a wellness tool, not a medical device, diagnosis tool, or replacement for professional medical advice.',
            'SIRILA never diagnoses and never predicts pregnancy.',
          ]}
        />
        <PrivacyBadge label="Your fertility information is private to your account" />
      </div>

      <FertilityDashboardSummary
        status={status}
        hasCycleData={hasCycleData}
        fertilityWindow={fertilityWindow}
        habitConsistencyPercent={habitConsistencyPercent}
      />

      <FertilityCalendar
        periodRecords={periodRecords}
        fertileWindowStart={fertilityWindow.fertileWindowStart}
        fertileWindowEnd={fertilityWindow.fertileWindowEnd}
        estimatedOvulationDate={fertilityWindow.estimatedOvulationDate}
        entries={entries}
        onSelectDate={handleSelectDate}
      />

      <div id="fertility-entry-form" className="scroll-mt-24">
        {user && (
          <FertilityEntryForm
            userId={user.id}
            editingEntry={editingEntry}
            initialDate={selectedDate}
            onSaved={handleSaved}
            onCancelEdit={() => {
              setEditingEntry(null)
              setSelectedDate(undefined)
            }}
          />
        )}
      </div>

      <FertilityInsights status={status} insights={insights} />

      <FertilityTimeline status={status} periodRecords={periodRecords} entries={entries} />

      <FertilityHistory
        status={status}
        entries={entries}
        onEdit={(entry) => {
          setEditingEntry(entry)
          setSelectedDate(undefined)
          document.getElementById('fertility-entry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        onDeleted={refresh}
      />

      <FertilityReportSummary
        status={status}
        entries={entries}
        cycleLength={cycleLength}
        habitConsistencyPercent={habitConsistencyPercent}
      />

      <p className="text-center text-caption text-muted-foreground">
        SIRILA supports personal wellness awareness and reflection. It is not a substitute for
        professional medical advice.
      </p>
    </main>
  )
}

export default FertilityJourneyPage

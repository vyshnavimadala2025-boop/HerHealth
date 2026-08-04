import { useEffect, useRef, useState } from 'react'
import { BookOpen } from 'lucide-react'
import NextStepTile from '@/components/shared/NextStepTile'
import { useAuth } from '@/features/auth/useAuth'
import { getLatestJournalEntryDate } from '@/features/journal/journalService'
import { formatFriendlyDate } from '@/features/journal/types'

type LoadStatus = 'loading' | 'ready' | 'error'

interface DashboardJournalCardProps {
  /**
   * Optional — lets a sibling (SuggestedNextStep) reuse this card's own
   * fetch result instead of issuing a second, duplicate query for the
   * same value. This is the only change to this component's data
   * behavior: the query itself, and when it runs, are unchanged.
   */
  onLoaded?: (status: LoadStatus, latestDate: string | null) => void
}

/**
 * Deliberately independent of useInsightsData — its own tiny query for only
 * the latest entry_date (no title/content selected, see journalService's
 * getLatestJournalEntryDate), so journal data never enters the insights
 * pipeline and this card never displays journal text.
 */
function DashboardJournalCard({ onLoaded }: DashboardJournalCardProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [latestDate, setLatestDate] = useState<string | null>(null)

  // Keeps the fetch effect below tied only to `user` (not re-running on
  // every parent re-render just because it passes a new inline callback).
  const onLoadedRef = useRef(onLoaded)
  useEffect(() => {
    onLoadedRef.current = onLoaded
  })

  useEffect(() => {
    if (!user) return
    let active = true
    setStatus('loading')
    getLatestJournalEntryDate(user.id)
      .then((date) => {
        if (!active) return
        setLatestDate(date)
        setStatus('ready')
        onLoadedRef.current?.('ready', date)
      })
      .catch(() => {
        if (!active) return
        setStatus('error')
        onLoadedRef.current?.('error', null)
      })
    return () => {
      active = false
    }
  }, [user])

  const description =
    status === 'error'
      ? "We couldn't load your journal summary."
      : status === 'ready' && latestDate
        ? `Last entry on ${formatFriendlyDate(latestDate)}`
        : status === 'ready'
          ? 'Ready when you are'
          : 'Loading…'

  return (
    <NextStepTile
      icon={BookOpen}
      label="Journal"
      description={description}
      href="/journal"
      isLoading={status === 'loading'}
      accentClassName="bg-blush text-blush-foreground"
    />
  )
}

export default DashboardJournalCard

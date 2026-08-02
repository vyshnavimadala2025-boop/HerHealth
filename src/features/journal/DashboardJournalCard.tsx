import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useAuth } from '@/features/auth/useAuth'
import { getLatestJournalEntryDate } from '@/features/journal/journalService'
import { formatFriendlyDate } from '@/features/journal/types'

type LoadStatus = 'loading' | 'ready' | 'error'

/**
 * Deliberately independent of useInsightsData — its own tiny query for only
 * the latest entry_date (no title/content selected, see journalService's
 * getLatestJournalEntryDate), so journal data never enters the insights
 * pipeline and this card never displays journal text.
 */
function DashboardJournalCard() {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [latestDate, setLatestDate] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    setStatus('loading')
    getLatestJournalEntryDate(user.id)
      .then((date) => {
        if (!active) return
        setLatestDate(date)
        setStatus('ready')
      })
      .catch(() => {
        if (!active) return
        setStatus('error')
      })
    return () => {
      active = false
    }
  }, [user])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading…
          </div>
        )}

        {status === 'error' && (
          <p className="text-muted-foreground">We couldn&apos;t load your journal summary.</p>
        )}

        {status === 'ready' && latestDate && (
          <p className="text-muted-foreground">Last entry on {formatFriendlyDate(latestDate)}.</p>
        )}

        {status === 'ready' && !latestDate && (
          <p className="text-muted-foreground">
            Your journal is ready when you are &mdash; write your first entry any time.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to="/journal">Open Journal</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default DashboardJournalCard

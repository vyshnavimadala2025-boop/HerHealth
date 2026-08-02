import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useAuth } from '@/features/auth/useAuth'
import {
  getLatestPcosWellnessEntryDate,
  getPcosTrackingEnabled,
} from '@/features/pcosWellness/pcosWellnessService'
import { formatFriendlyDate } from '@/features/pcosWellness/types'

type LoadStatus = 'loading' | 'ready' | 'error'

/**
 * Deliberately independent of useInsightsData — this card decides for
 * itself, via its own tiny query, whether tracking is enabled at all
 * before rendering anything. It only ever selects entry_date (never
 * observations/note), so no private wellness detail can appear here, and
 * it renders nothing when the user has not opted in.
 */
function DashboardPcosWellnessCard() {
  const { user } = useAuth()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [enabled, setEnabled] = useState(false)
  const [latestDate, setLatestDate] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    setStatus('loading')

    getPcosTrackingEnabled(user.id)
      .then(async (isEnabled) => {
        if (!active) return
        setEnabled(isEnabled)
        if (!isEnabled) {
          setStatus('ready')
          return
        }
        const date = await getLatestPcosWellnessEntryDate(user.id)
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

  if (status === 'ready' && !enabled) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PCOS/PCOD Wellness</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading…
          </div>
        )}

        {status === 'error' && (
          <p className="text-muted-foreground">We couldn&apos;t load your wellness summary.</p>
        )}

        {status === 'ready' && enabled && latestDate && (
          <p className="text-muted-foreground">Last entry on {formatFriendlyDate(latestDate)}.</p>
        )}

        {status === 'ready' && enabled && !latestDate && (
          <p className="text-muted-foreground">
            Your wellness tracker is ready when you are &mdash; add your first entry any time.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to="/wellness-tracker">Open Wellness Tracker</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default DashboardPcosWellnessCard

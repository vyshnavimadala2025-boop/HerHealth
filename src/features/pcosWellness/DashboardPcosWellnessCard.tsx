import { useEffect, useState } from 'react'
import { Leaf } from 'lucide-react'
import NextStepTile from '@/components/shared/NextStepTile'
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

  const description =
    status === 'error'
      ? "We couldn't load your wellness summary."
      : status === 'ready' && latestDate
        ? `Last entry on ${formatFriendlyDate(latestDate)}`
        : status === 'ready'
          ? 'Ready when you are'
          : 'Loading…'

  return (
    <NextStepTile
      icon={Leaf}
      label="PCOS/PCOD Wellness"
      description={description}
      href="/wellness-tracker"
      isLoading={status === 'loading'}
      accentClassName="bg-support text-support-foreground"
    />
  )
}

export default DashboardPcosWellnessCard

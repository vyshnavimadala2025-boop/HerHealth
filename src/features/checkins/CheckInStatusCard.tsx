import { CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatFriendlyTime } from '@/features/checkins/types'
import type { CheckIn } from '@/features/checkins/types'

interface CheckInStatusCardProps {
  status: 'loading' | 'ready' | 'error'
  checkIn: CheckIn | null
}

function CheckInStatusCard({ status, checkIn }: CheckInStatusCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        {status === 'loading' && (
          <>
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Checking today&apos;s status…</p>
          </>
        )}

        {status === 'error' && (
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t check today&apos;s status. You can still save a check-in below.
          </p>
        )}

        {status === 'ready' && checkIn && (
          <>
            <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Today&apos;s check-in is complete.</p>
              <p className="text-caption text-muted-foreground">
                Last saved {formatFriendlyTime(checkIn.updatedAt)}
              </p>
            </div>
          </>
        )}

        {status === 'ready' && !checkIn && (
          <>
            <Clock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">Today&apos;s check-in is waiting for you.</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default CheckInStatusCard

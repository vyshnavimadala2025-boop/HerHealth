import { Footprints } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDeleteDialog from '@/features/pregnancy/ConfirmDeleteDialog'
import { deleteKickSession } from '@/features/pregnancy/pregnancyKickSessionService'
import { formatSessionDate, formatSessionDuration, formatTimeOfDay } from '@/features/pregnancy/kickSessionUtils'
import type { PregnancyKickSession } from '@/features/pregnancy/types'

interface KickSessionHistoryProps {
  status: 'loading' | 'ready' | 'error'
  sessions: PregnancyKickSession[]
  onDeleted: () => void
}

function KickSessionHistory({ status, sessions, onDeleted }: KickSessionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kick Session History</CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2 py-1">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {status === 'error' && (
          <p role="alert" className="py-4 text-sm text-muted-foreground">
            We couldn&apos;t load your kick sessions. Please try again later.
          </p>
        )}

        {status === 'ready' && sessions.length === 0 && (
          <EmptyState
            icon={Footprints}
            title="No kick sessions yet"
            description="Your first movement session will appear here."
          />
        )}

        {status === 'ready' && sessions.length > 0 && (
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => {
              const durationSeconds = (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
              return (
                <li
                  key={session.id}
                  className="flex flex-col gap-2 rounded-xl border border-border p-3.5 text-sm transition-[box-shadow,border-color] duration-200 hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {formatSessionDate(session.startedAt)} · {formatTimeOfDay(session.startedAt)}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {session.movementCount} movement{session.movementCount === 1 ? '' : 's'} ·{' '}
                        {formatSessionDuration(durationSeconds)}
                      </p>
                    </div>
                    <ConfirmDeleteDialog
                      title="Delete this kick session?"
                      ariaLabel="Delete this kick session"
                      onConfirm={async () => {
                        await deleteKickSession(session.id)
                        onDeleted()
                      }}
                    />
                  </div>
                  {session.note && <p className="text-caption text-muted-foreground break-words">{session.note}</p>}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default KickSessionHistory

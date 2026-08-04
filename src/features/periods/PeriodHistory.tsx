import { Pencil, ScrollText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import DeletePeriodDialog from '@/features/periods/DeletePeriodDialog'
import { calculatePeriodDuration } from '@/features/periods/cycleCalculations'
import { formatFriendlyDate } from '@/features/periods/dateUtils'
import type { PeriodRecord } from '@/features/periods/types'

interface PeriodHistoryProps {
  status: 'loading' | 'ready' | 'error'
  records: PeriodRecord[]
  onEdit: (record: PeriodRecord) => void
  onDeleted: () => void
}

function notePreview(note: string | null) {
  if (!note) return null
  return note.length > 80 ? `${note.slice(0, 80)}…` : note
}

function PeriodHistory({ status, records, onEdit, onDeleted }: PeriodHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Period History</CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2 py-1">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {status === 'error' && (
          <p role="alert" className="py-4 text-sm text-muted-foreground">
            We couldn&apos;t load your period history. Please try again later.
          </p>
        )}

        {status === 'ready' && records.length === 0 && (
          <EmptyState
            icon={ScrollText}
            title="No period records yet"
            description="Add your first period to begin tracking your cycle."
          />
        )}

        {status === 'ready' && records.length > 0 && (
          <ul className="flex flex-col gap-2">
            {records.map((record) => {
              const duration = calculatePeriodDuration(record.startDate, record.endDate)
              const preview = notePreview(record.note)
              return (
                <li
                  key={record.id}
                  className="flex flex-col gap-1 rounded-lg border border-border p-3 text-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {formatFriendlyDate(record.startDate)}
                        {record.endDate ? ` – ${formatFriendlyDate(record.endDate)}` : ''}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {duration
                          ? `${duration} day${duration === 1 ? '' : 's'}`
                          : 'End date not recorded'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit this period record"
                        onClick={() => onEdit(record)}
                      >
                        <Pencil />
                      </Button>
                      <DeletePeriodDialog record={record} onDeleted={onDeleted} />
                    </div>
                  </div>
                  {preview && <p className="text-caption text-muted-foreground">{preview}</p>}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default PeriodHistory

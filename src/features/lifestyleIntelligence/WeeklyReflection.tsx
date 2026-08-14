import { NotebookPen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'

interface WeeklyReflectionProps {
  status: 'loading' | 'ready' | 'error'
  reflection: string
}

/**
 * "AI-generated reflection" per the spec — composed by
 * generateWeeklyReflection() from the user's own real weekly summary and
 * trend data only. No sentence references anything SIRILA doesn't
 * actually track.
 */
function WeeklyReflection({ status, reflection }: WeeklyReflectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-blush text-blush-foreground">
            <NotebookPen className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Weekly Reflection</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        )}

        {status === 'error' && <p className="text-muted-foreground">We couldn&apos;t load your weekly reflection.</p>}

        {status !== 'loading' && status !== 'error' && (
          <>
            <p className="rounded-xl bg-gradient-to-br from-blush/25 to-transparent p-4 text-foreground">
              {reflection}
            </p>
            <p className="text-caption text-muted-foreground">
              Generated from your recorded wellness data. Educational only.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default WeeklyReflection

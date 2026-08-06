import { useState } from 'react'
import { Footprints, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

/**
 * "Future ready" per the spec's own text — no backend table exists for
 * this yet (a real kick-tracking feature needs session-level timing and
 * trend analysis that deserves its own dedicated design pass, not a
 * bolt-on to this already-large migration). This keeps count in local
 * component state only, clearly labeled as not saved, so it never
 * pretends to persist data it doesn't.
 */
function KickCounterPlaceholder() {
  const [todayCount, setTodayCount] = useState(0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-blush text-primary">
            <Footprints className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Baby Kick Counter</CardTitle>
        </div>
        <CardDescription>
          Coming soon — full kick-count history and weekly trends. For now, you can try a quick
          count below (not saved between visits).
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-4">
        <p className="font-display text-display text-foreground tabular-nums">{todayCount}</p>
        <p className="text-caption text-muted-foreground">movements counted this session</p>
        <Button type="button" size="lg" className="h-11 rounded-xl" onClick={() => setTodayCount((count) => count + 1)}>
          <Plus aria-hidden="true" />
          Log a movement
        </Button>
      </CardContent>
    </Card>
  )
}

export default KickCounterPlaceholder

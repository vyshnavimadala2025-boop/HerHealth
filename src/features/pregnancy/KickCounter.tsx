import { useEffect, useState } from 'react'
import { Footprints, Loader2, Plus, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createKickSession } from '@/features/pregnancy/pregnancyKickSessionService'
import { formatElapsed, formatSessionDuration } from '@/features/pregnancy/kickSessionUtils'
import { NOTE_MAX_LENGTH } from '@/features/pregnancy/types'

const MAX_MOVEMENT_COUNT = 500

interface ActiveSession {
  startedAt: string
  movementCount: number
}

interface KickCounterProps {
  userId: string
  onSaved: () => void
}

function storageKey(userId: string) {
  return `herhealth.kickSession.${userId}`
}

function loadStoredSession(userId: string): ActiveSession | null {
  try {
    const raw = sessionStorage.getItem(storageKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ActiveSession
    if (typeof parsed.startedAt !== 'string' || typeof parsed.movementCount !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Kick-counting session — replaces KickCounterPlaceholder. A session is
 * only written to Supabase once finished and saved (via
 * createKickSession); the in-progress count/timer is kept in component
 * state, mirrored into sessionStorage so an accidental refresh or tab
 * reload mid-session (a real risk — this is meant to be used one-handed
 * on a phone) doesn't lose an active count, without needing a draft row
 * in the database.
 */
function KickCounter({ userId, onSaved }: KickCounterProps) {
  const [session, setSession] = useState<ActiveSession | null>(() => loadStoredSession(userId))
  const [reviewing, setReviewing] = useState(false)
  const [reviewEndedAt, setReviewEndedAt] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [session])

  useEffect(() => {
    if (session) {
      sessionStorage.setItem(storageKey(userId), JSON.stringify(session))
    } else {
      sessionStorage.removeItem(storageKey(userId))
    }
  }, [session, userId])

  const elapsedSeconds = session ? Math.max(0, (now - new Date(session.startedAt).getTime()) / 1000) : 0

  const handleStart = () => {
    setError(null)
    setSession({ startedAt: new Date().toISOString(), movementCount: 0 })
  }

  const handleRecord = () => {
    setSession((current) => {
      if (!current) return current
      if (current.movementCount >= MAX_MOVEMENT_COUNT) return current
      return { ...current, movementCount: current.movementCount + 1 }
    })
  }

  const handleUndo = () => {
    setSession((current) => {
      if (!current || current.movementCount === 0) return current
      return { ...current, movementCount: current.movementCount - 1 }
    })
  }

  const handleFinish = () => {
    if (!session) return
    setReviewEndedAt(new Date().toISOString())
    setReviewing(true)
  }

  const handleContinueSession = () => {
    setReviewing(false)
    setReviewEndedAt(null)
  }

  const handleDiscard = () => {
    setSession(null)
    setReviewing(false)
    setReviewEndedAt(null)
    setNote('')
    setError(null)
  }

  const handleSave = async () => {
    if (!session || !reviewEndedAt) return
    setIsSaving(true)
    setError(null)
    try {
      await createKickSession(userId, {
        startedAt: session.startedAt,
        endedAt: reviewEndedAt,
        movementCount: session.movementCount,
        note: note.trim() ? note.trim() : null,
      })
      setSession(null)
      setReviewing(false)
      setReviewEndedAt(null)
      setNote('')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={session && !reviewing ? 'border-primary/40' : undefined}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-blush text-primary">
            <Footprints className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Baby Kick Counter</CardTitle>
        </div>
        <CardDescription>
          Track how many movements you feel during a session. This is for your own personal
          record-keeping — it does not replace guidance from your maternity-care professional.
        </CardDescription>
      </CardHeader>

      {!session && !reviewing && (
        <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="max-w-sm text-caption text-muted-foreground">
            Start a session whenever you'd like to count your baby's movements. You can finish and
            save whenever you're ready.
          </p>
          <Button type="button" size="lg" className="h-12 rounded-xl px-6" onClick={handleStart}>
            <Plus aria-hidden="true" />
            Start a session
          </Button>
          {error && (
            <p role="alert" className="text-caption text-destructive">
              {error}
            </p>
          )}
        </CardContent>
      )}

      {session && !reviewing && (
        <CardContent className="flex flex-col items-center gap-5 py-4">
          <div
            role="status"
            className="flex items-center gap-1.5 rounded-full bg-support/60 px-3 py-1 text-caption font-medium text-support-foreground"
          >
            <span className="size-2 animate-pulse rounded-full bg-support-foreground motion-reduce:animate-none" aria-hidden="true" />
            Session active — {formatElapsed(elapsedSeconds)}
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="font-display text-display text-foreground tabular-nums" aria-hidden="true">
              {session.movementCount}
            </p>
            <p className="text-caption text-muted-foreground">movements recorded</p>
            <p role="status" aria-live="polite" className="sr-only">
              {session.movementCount} movement{session.movementCount === 1 ? '' : 's'} recorded
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="h-16 w-full max-w-xs rounded-2xl text-base transition-transform duration-150 active:scale-95 motion-reduce:active:scale-100"
            onClick={handleRecord}
            disabled={session.movementCount >= MAX_MOVEMENT_COUNT}
          >
            <Plus className="size-5" aria-hidden="true" />
            Record movement
          </Button>

          <div className="flex w-full max-w-xs flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleUndo}
              disabled={session.movementCount === 0}
            >
              <Undo2 aria-hidden="true" />
              Undo last
            </Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={handleFinish}>
              Finish session
            </Button>
          </div>
        </CardContent>
      )}

      {session && reviewing && reviewEndedAt && (
        <>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3.5">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Movements</p>
                <p className="text-lg font-medium text-foreground tabular-nums">{session.movementCount}</p>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3.5">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Duration</p>
                <p className="text-lg font-medium text-foreground">
                  {formatSessionDuration((new Date(reviewEndedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kick-session-note">Note (optional)</Label>
              <Textarea
                id="kick-session-note"
                value={note}
                onChange={(event) => setNote(event.target.value.slice(0, NOTE_MAX_LENGTH))}
                placeholder="Anything you'd like to remember about this session"
                rows={2}
              />
            </div>

            {error && (
              <p role="alert" className="text-caption text-destructive">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" className="flex-1" onClick={handleContinueSession} disabled={isSaving}>
              Continue session
            </Button>
            <Button type="button" variant="ghost" className="flex-1" onClick={handleDiscard} disabled={isSaving}>
              Discard
            </Button>
            <Button type="button" className="flex-1" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="animate-spin" aria-hidden="true" />}
              {isSaving ? 'Saving…' : 'Save session'}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}

export default KickCounter

import { useState, type FormEvent } from 'react'
import { CalendarClock, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/shared/Skeleton'
import EmptyState from '@/components/shared/EmptyState'
import ConfirmDeleteDialog from '@/features/pregnancy/ConfirmDeleteDialog'
import { createPregnancyAppointment, deletePregnancyAppointment } from '@/features/pregnancy/pregnancyAppointmentService'
import { formatFriendlyDate, getLocalDateString } from '@/features/periods/dateUtils'
import { APPOINTMENT_TYPE_OPTIONS, type AppointmentType, type PregnancyAppointment } from '@/features/pregnancy/types'

interface AppointmentPlannerProps {
  userId: string
  status: 'loading' | 'ready' | 'error'
  appointments: PregnancyAppointment[]
  onChanged: () => void
}

function typeLabel(type: AppointmentType) {
  return APPOINTMENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
}

function AppointmentPlanner({ userId, status, appointments, onChanged }: AppointmentPlannerProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<AppointmentType>('doctor_visit')
  const [date, setDate] = useState(getLocalDateString())
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) {
      setError('Please enter a title for this appointment')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      await createPregnancyAppointment(userId, {
        appointmentType: type,
        title: title.trim(),
        appointmentDate: date,
        appointmentTime: time || null,
        note: note.trim() ? note.trim() : null,
      })
      setTitle('')
      setTime('')
      setNote('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSaving(false)
    }
  }

  const today = getLocalDateString()
  const upcoming = appointments.filter((appointment) => appointment.appointmentDate >= today)
  const past = appointments.filter((appointment) => appointment.appointmentDate < today)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <CalendarClock className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Appointment Planner</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-muted/30 p-4" noValidate>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment-title">Title</Label>
              <Input id="appointment-title" className="h-11 rounded-xl" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. 20-week ultrasound" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment-type">Type</Label>
              <select
                id="appointment-type"
                value={type}
                onChange={(event) => setType(event.target.value as AppointmentType)}
                className="h-11 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment-date">Date</Label>
              <Input id="appointment-date" type="date" className="h-11 rounded-xl" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="appointment-time">
                Time <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input id="appointment-time" type="time" className="h-11 rounded-xl" value={time} onChange={(event) => setTime(event.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="appointment-note">
              Notes <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea id="appointment-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" />
          </div>
          {error && (
            <p role="alert" className="text-caption text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="h-11 w-fit self-end rounded-xl" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
            Add Appointment
          </Button>
        </form>

        {status === 'loading' && (
          <div role="status" className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {status === 'error' && <p className="text-sm text-muted-foreground">We couldn&apos;t load your appointments.</p>}

        {status === 'ready' && appointments.length === 0 && (
          <EmptyState icon={CalendarClock} title="No appointments yet" description="Add your first appointment above." />
        )}

        {status === 'ready' && appointments.length > 0 && (
          <div className="flex flex-col gap-4">
            {upcoming.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Upcoming</p>
                <ul className="flex flex-col gap-2">
                  {upcoming.map((appointment) => (
                    <li key={appointment.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium">{appointment.title}</p>
                        <p className="text-caption text-muted-foreground">
                          {typeLabel(appointment.appointmentType)} · {formatFriendlyDate(appointment.appointmentDate)}
                          {appointment.appointmentTime ? ` · ${appointment.appointmentTime}` : ''}
                        </p>
                        {appointment.note && <p className="text-caption text-muted-foreground">{appointment.note}</p>}
                      </div>
                      <ConfirmDeleteDialog
                        title="Delete this appointment?"
                        ariaLabel="Delete this appointment"
                        onConfirm={async () => {
                          await deletePregnancyAppointment(appointment.id)
                          onChanged()
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {past.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">Past</p>
                <ul className="flex flex-col gap-2">
                  {past.map((appointment) => (
                    <li key={appointment.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3 text-sm text-muted-foreground">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{appointment.title}</p>
                        <p className="text-caption">
                          {typeLabel(appointment.appointmentType)} · {formatFriendlyDate(appointment.appointmentDate)}
                        </p>
                      </div>
                      <ConfirmDeleteDialog
                        title="Delete this appointment?"
                        ariaLabel="Delete this appointment"
                        onConfirm={async () => {
                          await deletePregnancyAppointment(appointment.id)
                          onChanged()
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AppointmentPlanner

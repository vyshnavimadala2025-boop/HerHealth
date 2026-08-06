import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getLocalDateString } from '@/features/periods/dateUtils'
import type { FertilityEntry } from '@/features/fertility/types'
import type { PeriodRecord } from '@/features/periods/types'
import { cn } from '@/lib/utils'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface FertilityCalendarProps {
  periodRecords: PeriodRecord[]
  fertileWindowStart: string | null
  fertileWindowEnd: string | null
  estimatedOvulationDate: string | null
  entries: FertilityEntry[]
  onSelectDate: (date: string) => void
}

function isWithinPeriod(dateString: string, records: PeriodRecord[]): boolean {
  return records.some((record) => {
    const end = record.endDate ?? record.startDate
    return dateString >= record.startDate && dateString <= end
  })
}

/** Builds a 6-row (42-cell) month grid, padded with the previous/next month's leading/trailing days. */
function buildMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    return date
  })
}

function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * A real, keyboard-accessible month grid — not a decorative visual. Every
 * day is a focusable <button> with a full accessible name (date + period /
 * fertile-window / ovulation / logged-entry status), so cycle-related
 * state is never conveyed by color alone.
 */
function FertilityCalendar({
  periodRecords,
  fertileWindowStart,
  fertileWindowEnd,
  estimatedOvulationDate,
  entries,
  onSelectDate,
}: FertilityCalendarProps) {
  const today = getLocalDateString()
  const [viewDate, setViewDate] = useState(() => {
    const [year, month] = today.split('-').map(Number)
    return new Date(year, month - 1, 1)
  })

  const entryDates = useMemo(() => new Set(entries.map((entry) => entry.entryDate)), [entries])

  const grid = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  )

  const monthLabel = viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const goToPreviousMonth = () =>
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  const goToNextMonth = () =>
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between pb-4">
        <Button type="button" variant="ghost" size="icon-sm" className="size-11" aria-label="Previous month" onClick={goToPreviousMonth}>
          <ChevronLeft />
        </Button>
        <p className="font-display text-base text-foreground" aria-live="polite">
          {monthLabel}
        </p>
        <Button type="button" variant="ghost" size="icon-sm" className="size-11" aria-label="Next month" onClick={goToNextMonth}>
          <ChevronRight />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-caption text-muted-foreground" aria-hidden="true">
        {WEEKDAY_LABELS.map((label, index) => (
          <div key={index} className="py-1 font-medium">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((date) => {
          const dateString = toDateString(date)
          const isCurrentMonth = date.getMonth() === viewDate.getMonth()
          const isToday = dateString === today
          const isPeriodDay = isWithinPeriod(dateString, periodRecords)
          const isOvulationDay = dateString === estimatedOvulationDate
          const isFertileDay =
            !isOvulationDay &&
            fertileWindowStart !== null &&
            fertileWindowEnd !== null &&
            dateString >= fertileWindowStart &&
            dateString <= fertileWindowEnd
          const hasEntry = entryDates.has(dateString)

          const statusParts = [
            isPeriodDay && 'period day',
            isOvulationDay && 'estimated ovulation day',
            isFertileDay && 'estimated fertile window',
            hasEntry && 'entry logged',
          ].filter(Boolean)

          return (
            <button
              key={dateString}
              type="button"
              onClick={() => onSelectDate(dateString)}
              aria-label={`${date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}${
                statusParts.length ? `, ${statusParts.join(', ')}` : ''
              }`}
              className={cn(
                'relative flex aspect-square min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg border text-sm transition-colors',
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50',
                isPeriodDay ? 'border-transparent bg-blush' : isOvulationDay ? 'border-primary bg-lavender' : isFertileDay ? 'border-transparent bg-lavender/50' : 'border-border hover:bg-muted/50',
                isToday && 'ring-2 ring-primary ring-offset-1',
              )}
            >
              <span className="font-medium">{date.getDate()}</span>
              {hasEntry && <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-caption text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-blush" aria-hidden="true" /> Period
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-lavender/50" aria-hidden="true" /> Fertile window
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border border-primary bg-lavender" aria-hidden="true" /> Ovulation (est.)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" /> Entry logged
        </span>
      </div>
    </div>
  )
}

export default FertilityCalendar

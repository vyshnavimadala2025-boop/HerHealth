import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  getLocalDateString,
  validateCustomRange,
  isCustomRangeValid,
} from '@/features/reports/dateRangePresets'
import { REPORT_RANGE_PRESETS } from '@/features/reports/types'
import type { ReportDateRange } from '@/features/reports/types'

const FIXED_PRESETS = REPORT_RANGE_PRESETS.filter((preset) => preset.value !== 'custom') as {
  value: '7d' | '30d' | '90d'
  label: string
}[]

interface DateRangeSelectorProps {
  range: ReportDateRange
  onSelectPreset: (preset: '7d' | '30d' | '90d') => void
  onApplyCustomRange: (startDate: string, endDate: string) => void
}

function DateRangeSelector({ range, onSelectPreset, onApplyCustomRange }: DateRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(range.preset === 'custom')
  const [customStart, setCustomStart] = useState(range.preset === 'custom' ? range.startDate : '')
  const [customEnd, setCustomEnd] = useState(range.preset === 'custom' ? range.endDate : '')
  const [hasAttemptedApply, setHasAttemptedApply] = useState(false)

  const today = getLocalDateString()
  const validation = validateCustomRange(customStart, customEnd, today)

  const handleApply = () => {
    setHasAttemptedApply(true)
    if (isCustomRangeValid(validation)) {
      onApplyCustomRange(customStart, customEnd)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Report date range">
        {FIXED_PRESETS.map((preset) => {
          const isActive = range.preset === preset.value
          return (
            <button
              key={preset.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                setShowCustom(false)
                onSelectPreset(preset.value)
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
                isActive
                  ? 'border-primary bg-accent/40 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {preset.label}
            </button>
          )
        })}
        <button
          type="button"
          aria-pressed={range.preset === 'custom'}
          onClick={() => setShowCustom(true)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none',
            range.preset === 'custom'
              ? 'border-primary bg-accent/40 text-foreground'
              : 'border-border text-muted-foreground hover:text-foreground',
          )}
        >
          Custom range
        </button>
      </div>

      {showCustom && (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-range-start">Start date</Label>
              <Input
                id="report-range-start"
                type="date"
                value={customStart}
                max={today}
                aria-invalid={hasAttemptedApply && !!validation.startDateError}
                aria-describedby={
                  hasAttemptedApply && validation.startDateError ? 'report-range-start-error' : undefined
                }
                onChange={(event) => setCustomStart(event.target.value)}
                className="max-w-48"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-range-end">End date</Label>
              <Input
                id="report-range-end"
                type="date"
                value={customEnd}
                max={today}
                aria-invalid={hasAttemptedApply && !!validation.endDateError}
                aria-describedby={
                  hasAttemptedApply && validation.endDateError ? 'report-range-end-error' : undefined
                }
                onChange={(event) => setCustomEnd(event.target.value)}
                className="max-w-48"
              />
            </div>
          </div>

          {hasAttemptedApply && (validation.startDateError || validation.endDateError || validation.rangeError) && (
            <div role="alert" className="flex flex-col gap-0.5 text-caption text-destructive">
              {validation.startDateError && <p id="report-range-start-error">{validation.startDateError}</p>}
              {validation.endDateError && <p id="report-range-end-error">{validation.endDateError}</p>}
              {validation.rangeError && <p>{validation.rangeError}</p>}
            </div>
          )}

          <Button type="button" size="sm" onClick={handleApply} className="self-start">
            Apply custom range
          </Button>
        </div>
      )}
    </div>
  )
}

export default DateRangeSelector

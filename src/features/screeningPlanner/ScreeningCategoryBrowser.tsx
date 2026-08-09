import { ShieldCheck } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { SCREENING_CATEGORY_OPTIONS } from '@/features/screeningPlanner/types'
import { SCREENING_CATEGORY_EDUCATION, INSUFFICIENT_INFORMATION_NOTICE } from '@/features/screeningPlanner/screeningEducation'

/**
 * "Browse" + "Understand" (Stage 3F requirements #8) — purely educational,
 * general-category descriptions (screeningEducation.ts), never a specific
 * test, age, or interval. Includes the mandatory "insufficient
 * information" notice (requirement #22) as a permanent, always-visible
 * disclaimer rather than a conditional state, since HerHealth can never
 * determine individualized screening needs regardless of what's tracked.
 */
function ScreeningCategoryBrowser() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          <CardTitle>Preventive Health Categories</CardTitle>
        </div>
        <CardDescription>General, educational information only — never a diagnosis or a personalized screening schedule.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SCREENING_CATEGORY_OPTIONS.map((option) => (
            <div key={option.value} className="flex flex-col gap-1 rounded-xl border border-border p-3">
              <p className="text-sm font-medium text-foreground">{option.label}</p>
              <p className="text-caption text-muted-foreground">{SCREENING_CATEGORY_EDUCATION[option.value]}</p>
            </div>
          ))}
        </div>
        <p className="rounded-lg bg-muted/40 p-3 text-caption text-muted-foreground">{INSUFFICIENT_INFORMATION_NOTICE}</p>
      </CardContent>
    </Card>
  )
}

export default ScreeningCategoryBrowser

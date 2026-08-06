import { Leaf } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const SUGGESTIONS = [
  'Take a short walk.',
  'Open windows for fresh air.',
  'Drink water.',
  'Reduce screen time before sleep.',
  'Stretch every hour.',
  'Take sunlight in the morning.',
  'Use calming breathing exercises.',
]

/**
 * Section 5 — simple, supportive suggestions. Static educational content
 * only; no user data is read or written here.
 */
function LifestyleSuggestionsSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-support text-support-foreground">
            <Leaf className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Lifestyle Suggestions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion} className="flex items-start gap-2.5 rounded-lg bg-muted/40 p-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <p className="text-foreground">{suggestion}</p>
            </li>
          ))}
        </ul>
        <p className="text-caption text-muted-foreground">
          Gentle, general suggestions only — always supportive, never medical.
        </p>
      </CardContent>
    </Card>
  )
}

export default LifestyleSuggestionsSection

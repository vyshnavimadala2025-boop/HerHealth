import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { careSummaryToText, generateCareSummaryDraft, type CareSummaryDraft } from '@/features/aiIntelligence/careSummary'
import type { AiConversation, AiMessage, AiSymptomJournalEntry } from '@/features/aiIntelligence/types'

interface CareSummarySheetProps {
  conversation: AiConversation
  messages: AiMessage[]
  journalEntries: AiSymptomJournalEntry[]
}

function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * GENERATE → REVIEW → EDIT → APPROVE → SHARE/EXPORT (Phase 0 Section 19 /
 * Phase 2 Section 8). Nothing is ever sent anywhere automatically — export
 * downloads a local text file, same pattern as
 * src/features/reports/exportService.ts, and only becomes available after
 * the user explicitly approves the reviewed draft. No external
 * clinician-sharing integration exists — that's explicitly out of scope
 * for this phase.
 */
function CareSummarySheet({ conversation, messages, journalEntries }: CareSummarySheetProps) {
  const [draft, setDraft] = useState<CareSummaryDraft | null>(null)
  const [approved, setApproved] = useState(false)

  const handleGenerate = () => {
    setDraft(generateCareSummaryDraft(conversation, messages, journalEntries))
    setApproved(false)
  }

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          setDraft(null)
          setApproved(false)
        }
      }}
    >
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" onClick={handleGenerate}>
          <FileText className="size-3.5" aria-hidden="true" />
          Create Care Summary
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Care Summary</SheetTitle>
          <SheetDescription>Review and edit before approving. Nothing is shared automatically.</SheetDescription>
        </SheetHeader>

        {draft && (
          <div className="flex flex-col gap-4 px-5 pb-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="care-summary-concern">What I shared</Label>
              <Textarea
                id="care-summary-concern"
                value={draft.concern}
                onChange={(event) => setDraft({ ...draft, concern: event.target.value })}
                rows={3}
                disabled={approved}
              />
            </div>

            {draft.journalEntries.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label>Related symptom journal entries</Label>
                <ul className="flex flex-col gap-1 text-caption text-muted-foreground">
                  {draft.journalEntries.map((entry, index) => (
                    <li key={index}>
                      {entry.symptom}
                      {entry.severity ? ` (${entry.severity})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="rounded-lg border border-dashed border-border p-3 text-caption text-muted-foreground">
              {draft.disclaimer}
            </p>

            {!approved ? (
              <Button type="button" onClick={() => setApproved(true)} className="self-start">
                Approve
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadTextFile(careSummaryToText(draft), `sirila-care-summary-${Date.now()}.txt`)}
                className="self-start"
              >
                Export as text file
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default CareSummarySheet

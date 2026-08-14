import { Link } from 'react-router-dom'
import { ArrowLeft, NotebookText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
import PrivacyBadge from '@/components/shared/PrivacyBadge'
import EmptyState from '@/components/shared/EmptyState'
import Skeleton from '@/components/shared/Skeleton'
import PreviewGateNotice from '@/features/aiIntelligence/PreviewGateNotice'
import { useAiSymptomJournal } from '@/features/aiIntelligence/useAiSymptomJournal'

function AiSymptomJournalPage() {
  const { entries, status, remove } = useAiSymptomJournal()

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <PreviewGateNotice />

      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/ai">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to SIRILA Intelligence
        </Link>
      </Button>

      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-support text-support-foreground">
          <NotebookText className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Symptom Journal"
          description="Entries you've explicitly chosen to save from SIRILA Intelligence conversations."
        />
      </div>

      <PrivacyBadge label="Private to your account" />

      {status === 'loading' && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {status === 'ready' && entries.length === 0 && (
        <EmptyState
          icon={NotebookText}
          title="Nothing saved yet"
          description="When SIRILA offers to save something to your journal, it'll appear here."
        />
      )}

      {status === 'ready' && entries.length > 0 && (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-3 rounded-xl border border-border p-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {entry.symptom}
                  {entry.severity && <span className="ml-2 text-caption text-muted-foreground capitalize">{entry.severity}</span>}
                </p>
                {entry.notes && <p className="text-caption text-muted-foreground">{entry.notes}</p>}
                <p className="text-caption text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete journal entry: ${entry.symptom}`}
                onClick={async () => {
                  try {
                    await remove(entry.id)
                    toast.success('Journal entry deleted.')
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'Something went wrong.')
                  }
                }}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default AiSymptomJournalPage

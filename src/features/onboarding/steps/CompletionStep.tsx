import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CompletionStepProps {
  onGoToDashboard: () => void
}

function CompletionStep({ onGoToDashboard }: CompletionStepProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-support text-support-foreground">
        <CheckCircle2 className="size-6" aria-hidden="true" />
      </div>
      <h1 className="text-heading font-display text-foreground">Your SIRILA space is ready.</h1>
      <p className="text-body text-muted-foreground">
        You can now begin tracking your wellness journey — on your own terms, at your own pace.
      </p>
      <Button
        type="button"
        size="lg"
        className="mt-3 h-14 w-full rounded-xl text-base transition-transform duration-200 hover:-translate-y-0.5"
        onClick={onGoToDashboard}
      >
        Go to Dashboard
      </Button>
    </div>
  )
}

export default CompletionStep

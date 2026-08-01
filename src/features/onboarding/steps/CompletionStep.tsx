import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

interface CompletionStepProps {
  onGoToDashboard: () => void
}

function CompletionStep({ onGoToDashboard }: CompletionStepProps) {
  return (
    <>
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <CheckCircle2 className="size-8 text-primary" aria-hidden="true" />
        <CardTitle>Your HerHealth space is ready.</CardTitle>
        <CardDescription>You can now begin tracking your health journey.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button type="button" className="w-full" onClick={onGoToDashboard}>
          Go to Dashboard
        </Button>
      </CardFooter>
    </>
  )
}

export default CompletionStep

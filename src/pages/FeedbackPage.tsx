import { MessageSquareHeart } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import FeedbackForm from '@/features/feedback/FeedbackForm'

function FeedbackPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 py-8 animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex flex-col items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MessageSquareHeart className="size-6" aria-hidden="true" />
        </div>
        <PageHeader
          title="Feedback"
          description="Report a problem, request a feature, or share how HerHealth is working for you."
        />
      </div>

      <Card>
        <CardContent className="py-6">
          <FeedbackForm />
        </CardContent>
      </Card>
    </main>
  )
}

export default FeedbackPage

import { Link } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'

function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <HeartPulse className="size-10 text-primary" />
      <h1 className="text-2xl font-semibold">HerHealth</h1>
      <p className="text-muted-foreground">Home page placeholder.</p>
      <div className="flex w-full max-w-xs flex-col gap-2 sm:w-auto sm:flex-row">
        <Button asChild className="w-full sm:w-auto">
          <Link to="/signup">Get started</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    </main>
  )
}

export default HomePage

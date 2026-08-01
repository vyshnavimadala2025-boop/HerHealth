import { HeartPulse } from 'lucide-react'

function HomePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-2 p-6 text-center">
      <HeartPulse className="size-10 text-primary" />
      <h1 className="text-2xl font-semibold">HerHealth</h1>
      <p className="text-muted-foreground">Home page placeholder.</p>
    </main>
  )
}

export default HomePage

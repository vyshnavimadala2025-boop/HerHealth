import { Loader2 } from 'lucide-react'

function FullScreenLoader() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-6">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </main>
  )
}

export default FullScreenLoader

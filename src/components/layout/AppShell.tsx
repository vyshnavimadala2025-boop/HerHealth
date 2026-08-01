import { Link, Outlet } from "react-router-dom"
import { HeartPulse } from "lucide-react"
import { Toaster } from "sonner"

function AppShell() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-medium">
            <HeartPulse className="size-5 text-primary" />
            HerHealth
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Toaster richColors position="top-center" />
    </div>
  )
}

export default AppShell

import { Link, NavLink, Outlet } from "react-router-dom"
import { HeartPulse } from "lucide-react"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import HeaderNav from "@/components/layout/HeaderNav"

function AppShell() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-medium">
              <HeartPulse className="size-5 text-primary" />
              <span className="hidden sm:inline">HerHealth</span>
            </Link>
            <nav aria-label="Primary">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )
                }
              >
                Home
              </NavLink>
            </nav>
          </div>
          <HeaderNav />
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

import { Outlet } from "react-router-dom"
import PublicNavbar from "@/components/layout/PublicNavbar"
import AuthenticatedNav from "@/components/layout/AuthenticatedNav"
import PageTransition from "@/components/layout/PageTransition"
import PublicFooter from "@/features/marketing/PublicFooter"

interface AppShellProps {
  variant: "public" | "authenticated"
}

/**
 * Thin layout shell shared by both the public and authenticated route
 * trees — only the navbar differs (see App.tsx). The footer renders for
 * both variants (previously public-only, which left every authenticated
 * page without one — a footer-consistency fix, not a design change: the
 * same footer, same content, same component). `main` keeps `flex-1` so
 * the existing sticky-footer flex layout (footer pinned to the bottom of
 * short pages, pushed below content on long pages) applies identically to
 * both variants with no extra CSS. Toaster lives once at the App.tsx
 * level, not here, so it's never mounted twice across the two shells.
 */
function AppShell({ variant }: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to main content
      </a>
      {variant === "public" ? <PublicNavbar /> : <AuthenticatedNav />}
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <PublicFooter />
    </div>
  )
}

export default AppShell

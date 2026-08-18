import { Link, Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminTopHeader from '@/components/layout/AdminTopHeader'
import PageTransition from '@/components/layout/PageTransition'

/**
 * Layout shell for the /admin route subtree — parallel to AppShell, but a
 * deliberately separate component (left sidebar, not top nav) since no
 * sidebar layout exists elsewhere in SIRILA and the admin console is a
 * distinct operational surface. Reuses the same design tokens as AppShell
 * (bg-background, bg-card, border-border, etc.) — no second design system.
 */
function AdminShell() {
  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <a
        href="#admin-main-content"
        className="sr-only rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to admin content
      </a>

      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-6 border-r border-border bg-card px-4 py-6 lg:flex">
        <Link
          to="/admin"
          className="flex items-center gap-2 px-1 font-display text-lg font-medium text-foreground"
        >
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          SIRILA Admin
        </Link>
        <AdminSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopHeader />
        <main
          id="admin-main-content"
          tabIndex={-1}
          className="flex-1 overflow-x-hidden px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8"
        >
          <div className="mx-auto w-full max-w-6xl">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminShell

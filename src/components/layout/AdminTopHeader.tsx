import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import AdminSidebar from '@/components/layout/AdminSidebar'

/**
 * Mobile-only bar — AdminShell's desktop <aside> is hidden below lg, so
 * this is the only way to reach admin nav/identity/sign-out on small
 * screens. Reuses AdminSidebar's content inside a Sheet rather than a
 * second, separately maintained mobile nav implementation.
 */
function AdminTopHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button type="button" variant="ghost" size="icon" aria-label="Open admin navigation">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                HerHealth Admin
              </Link>
            </SheetTitle>
            <SheetDescription className="sr-only">Admin navigation</SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-5">
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Link to="/admin" className="flex items-center gap-2 font-display text-base font-medium text-foreground">
        <ShieldCheck className="size-4" aria-hidden="true" />
        HerHealth Admin
      </Link>
    </header>
  )
}

export default AdminTopHeader

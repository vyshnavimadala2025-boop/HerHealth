import { Link } from 'react-router-dom'
import { LifeBuoy } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { SUPPORT_ITEMS } from '@/components/layout/supportCatalog'

/** Support ▾ — premium dropdown reused wherever the authenticated nav needs it. */
function SupportMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-hero-panel-foreground/75 outline-none transition-colors duration-200 hover:text-hero-panel-foreground focus-visible:ring-3 focus-visible:ring-peach/40 data-[state=open]:text-hero-panel-foreground">
        <LifeBuoy className="size-4" aria-hidden="true" />
        Support
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-56 rounded-2xl border border-hero-panel-foreground/15 bg-hero-panel/70 text-hero-panel-foreground shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_28px_rgba(168,120,255,0.12)] backdrop-blur-xl"
      >
        {SUPPORT_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item.key}
            asChild
            className="text-hero-panel-foreground hover:bg-hero-panel-foreground/8 focus:bg-hero-panel-foreground/8 focus:text-hero-panel-foreground"
          >
            {item.external ? (
              <a href={item.href} className="flex items-center gap-2">
                <item.icon className="size-4 text-peach" aria-hidden="true" />
                {item.name}
              </a>
            ) : (
              <Link to={item.href} className="flex items-center gap-2">
                <item.icon className="size-4 text-peach" aria-hidden="true" />
                {item.name}
              </Link>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SupportMenu

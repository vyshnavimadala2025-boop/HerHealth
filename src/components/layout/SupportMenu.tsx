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
      <DropdownMenuTrigger className="group inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:text-foreground">
        <LifeBuoy className="size-4" aria-hidden="true" />
        Support
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        {SUPPORT_ITEMS.map((item) => (
          <DropdownMenuItem key={item.key} asChild>
            {item.external ? (
              <a href={item.href} className="flex items-center gap-2">
                <item.icon className="size-4 text-primary" aria-hidden="true" />
                {item.name}
              </a>
            ) : (
              <Link to={item.href} className="flex items-center gap-2">
                <item.icon className="size-4 text-primary" aria-hidden="true" />
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

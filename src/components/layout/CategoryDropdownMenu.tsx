import { Link, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { isProductItemActive } from '@/components/layout/navUtils'
import { cn } from '@/lib/utils'

export interface CategoryMenuItem {
  key: string
  name: string
  description: string
  href: string
  icon: LucideIcon
  comingSoon?: boolean
}

interface CategoryDropdownMenuProps {
  label: string
  items: CategoryMenuItem[]
}

/**
 * Compact nav dropdown reused for both "Wellness" and "Lifestyle" — the
 * old single "Products" mega-menu (3 grouped columns, up to 640–880px
 * wide) was replaced by two of these focused dropdowns, one per category,
 * so neither ever needs more than a two-column layout regardless of how
 * many products HerHealth grows to. Add a third category later by adding
 * a third instance of this same component with its own catalog file —
 * no new dropdown component required.
 */
function CategoryDropdownMenu({ label, items }: CategoryDropdownMenuProps) {
  const { pathname } = useLocation()
  const twoColumn = items.length > 5

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul
              className={cn(
                'grid w-[min(90vw,340px)] grid-cols-1 gap-1 p-3',
                twoColumn && 'sm:w-[min(90vw,560px)] sm:grid-cols-2',
              )}
            >
              {items.map((item) => {
                const active = isProductItemActive(pathname, item.href)
                return (
                  <li key={item.key}>
                    <NavigationMenuLink asChild aria-current={active ? 'page' : undefined}>
                      <Link to={item.href} className={cn(active && 'bg-accent/60')}>
                        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <item.icon className="size-4 text-primary" aria-hidden="true" />
                          {item.name}
                          {item.comingSoon && (
                            <span className="rounded-full border border-dashed border-border px-1.5 py-0.5 text-[0.6rem] font-medium tracking-wide text-muted-foreground uppercase">
                              Soon
                            </span>
                          )}
                        </span>
                        <span className="text-caption text-muted-foreground">{item.description}</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                )
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default CategoryDropdownMenu

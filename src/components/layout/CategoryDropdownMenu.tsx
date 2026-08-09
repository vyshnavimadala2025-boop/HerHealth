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
  /** Optional presentational grouping label (UI/UX Phase 2) — items sharing consecutive group values render under one small heading; omit for a flat list (e.g. "Wellness"). */
  group?: string
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
              {items.map((item, index) => {
                const active = isProductItemActive(pathname, item.href)
                const showGroupLabel = item.group && item.group !== items[index - 1]?.group
                return (
                  <li key={item.key}>
                    {showGroupLabel && (
                      <p className="px-2 pt-2 pb-1 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase first:pt-0.5">
                        {item.group}
                      </p>
                    )}
                    <NavigationMenuLink asChild aria-current={active ? 'page' : undefined}>
                      <Link to={item.href} className={cn(active && 'bg-accent/60')}>
                        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <item.icon className="size-4 text-primary" aria-hidden="true" />
                          {item.name}
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

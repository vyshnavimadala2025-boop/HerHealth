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
  /**
   * 'hero' renders the dropdown as a dark glassmorphism panel for use on
   * PublicNavbar's home-page-only violet theme (over the cinematic hero).
   * Defaults to 'light', the original popover styling — AuthenticatedNav
   * and every non-home public route keep using that default unchanged.
   */
  theme?: 'light' | 'hero'
}

/**
 * Compact nav dropdown reused for both "Wellness" and "Lifestyle" — the
 * old single "Products" mega-menu (3 grouped columns, up to 640–880px
 * wide) was replaced by two of these focused dropdowns, one per category,
 * so neither ever needs more than a two-column layout regardless of how
 * many products SIRILA grows to. Add a third category later by adding
 * a third instance of this same component with its own catalog file —
 * no new dropdown component required.
 */
function CategoryDropdownMenu({ label, items, theme = 'light' }: CategoryDropdownMenuProps) {
  const { pathname } = useLocation()
  const twoColumn = items.length > 5
  const hero = theme === 'hero'

  return (
    <NavigationMenu
      viewportClassName={
        hero
          ? 'rounded-2xl border border-hero-panel-foreground/15 bg-hero-panel/70 text-hero-panel-foreground shadow-[0_12px_40px_rgba(0,0,0,0.35),0_0_28px_rgba(168,120,255,0.12)] backdrop-blur-xl'
          : undefined
      }
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={
              hero
                ? 'text-hero-panel-foreground/85 hover:text-hero-panel-foreground data-[state=open]:text-hero-panel-foreground'
                : undefined
            }
          >
            {label}
          </NavigationMenuTrigger>
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
                      <p
                        className={cn(
                          'px-2 pt-2 pb-1 text-[0.7rem] font-medium tracking-wide uppercase first:pt-0.5',
                          hero ? 'text-hero-panel-foreground/45' : 'text-muted-foreground',
                        )}
                      >
                        {item.group}
                      </p>
                    )}
                    <NavigationMenuLink
                      asChild
                      aria-current={active ? 'page' : undefined}
                      className={hero ? 'hover:bg-hero-panel-foreground/8 focus-visible:bg-hero-panel-foreground/8 focus-visible:ring-peach/40' : undefined}
                    >
                      <Link to={item.href} className={cn(active && (hero ? 'bg-hero-panel-foreground/12' : 'bg-accent/60'))}>
                        <span
                          className={cn(
                            'flex items-center gap-2 text-sm font-medium',
                            hero ? 'text-hero-panel-foreground' : 'text-foreground',
                          )}
                        >
                          <item.icon className={cn('size-4', hero ? 'text-peach' : 'text-primary')} aria-hidden="true" />
                          {item.name}
                        </span>
                        <span className={cn('text-caption', hero ? 'text-hero-panel-foreground/60' : 'text-muted-foreground')}>
                          {item.description}
                        </span>
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

import { Link, useLocation } from 'react-router-dom'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  groupProductItems,
  isProductItemActive,
  type ProductCategory,
} from '@/components/layout/productCatalog'
import { cn } from '@/lib/utils'

interface ProductsMenuProps {
  labels: Record<ProductCategory, string>
}

/**
 * Shared "Products" mega-menu content — used by both PublicNavbar and
 * AuthenticatedNav with different group labels (see productCatalog.ts),
 * so the underlying route list is defined exactly once. Desktop only;
 * MobileNav renders the same catalog data in its own layout for small
 * screens.
 */
function ProductsMenu({ labels }: ProductsMenuProps) {
  const groups = groupProductItems(labels)
  const { pathname } = useLocation()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[min(92vw,640px)] grid-cols-1 gap-x-8 gap-y-6 p-6 sm:grid-cols-2">
              {groups.map((group) => (
                <div key={group.category} className="flex flex-col gap-2">
                  <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
                    {group.label}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const active = isProductItemActive(pathname, item.href)
                      return (
                        <li key={item.name}>
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
                </div>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default ProductsMenu

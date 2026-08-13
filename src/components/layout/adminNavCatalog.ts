import {
  Activity,
  BarChart3,
  LayoutDashboard,
  MessageSquareHeart,
  ServerCog,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

/**
 * Single source of truth for the admin sidebar nav, mirroring the existing
 * *Catalog.ts pattern used by the public/authenticated nav (see
 * wellnessCatalog.ts, lifestyleCatalog.ts). `href: null` means "planned,
 * not yet built" — rendered as an inert, clearly-labeled disabled row
 * rather than a dead link or a /coming-soon/:slug placeholder.
 */
export interface AdminNavItem {
  key: string
  name: string
  icon: LucideIcon
  href: string | null
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { key: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { key: 'users', name: 'Users', icon: Users, href: null },
  { key: 'activity', name: 'Activity', icon: Activity, href: null },
  { key: 'feedback', name: 'Feedback', icon: MessageSquareHeart, href: null },
  { key: 'analytics', name: 'Analytics', icon: BarChart3, href: null },
  { key: 'platform-health', name: 'Platform Health', icon: ServerCog, href: null },
  { key: 'settings', name: 'Settings', icon: Settings, href: null },
]

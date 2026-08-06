import {
  FileText,
  Flag,
  HelpCircle,
  Info,
  Mail,
  MessageSquareHeart,
  ScrollText,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'

/**
 * Single source of truth for the Support dropdown's items. Every item is
 * a real, complete destination — Help Center and Release Notes are real
 * in-app pages; Contact, Feedback, and Report an Issue are genuine
 * mailto: links (this project has no backend for a contact form, so a
 * fake "Send" button that goes nowhere would be dishonest — a mailto:
 * link is the one option that's both real and doesn't require adding
 * server-side infrastructure).
 */
export interface SupportCatalogItem {
  key: string
  name: string
  href: string
  icon: LucideIcon
  external?: boolean
}

export const SUPPORT_ITEMS: SupportCatalogItem[] = [
  { key: 'help-center', name: 'Help Center', href: '/help-center', icon: HelpCircle },
  { key: 'privacy', name: 'Privacy', href: '/privacy', icon: ShieldCheck },
  { key: 'terms', name: 'Terms', href: '/terms', icon: FileText },
  { key: 'medical-disclaimer', name: 'Medical Disclaimer', href: '/medical-disclaimer', icon: Stethoscope },
  { key: 'contact', name: 'Contact', href: 'mailto:support@herhealth.app', icon: Mail, external: true },
  { key: 'about', name: 'About HerHealth', href: '/about', icon: Info },
  {
    key: 'feedback',
    name: 'Feedback',
    href: 'mailto:feedback@herhealth.app?subject=HerHealth%20Feedback',
    icon: MessageSquareHeart,
    external: true,
  },
  {
    key: 'report-issue',
    name: 'Report an Issue',
    href: 'mailto:support@herhealth.app?subject=Issue%20Report',
    icon: Flag,
    external: true,
  },
  { key: 'release-notes', name: 'Release Notes', href: '/release-notes', icon: ScrollText },
]

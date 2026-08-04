import { Link } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'

interface FooterColumn {
  heading: string
  links: { label: string; href: string }[]
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Daily Check-In', href: '/dashboard#checkin' },
      { label: 'Cycle Tracker', href: '/cycle-tracker' },
      { label: 'Wellness Insights', href: '/dashboard#insights' },
      { label: 'Private Journal', href: '/journal' },
      { label: 'Goals and Progress', href: '/goals' },
      { label: 'Wellness Reports', href: '/reports' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About HerHealth', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
    ],
  },
  {
    heading: 'Legal and Privacy',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Medical Disclaimer', href: '/medical-disclaimer' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Create Account', href: '/signup' },
    ],
  },
]

function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3">
              <p className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
                {column.heading}
              </p>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-6 text-caption text-muted-foreground sm:flex-row sm:justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-sm font-medium text-foreground">
            <HeartPulse className="size-4 text-primary" aria-hidden="true" />
            HerHealth
          </Link>
          <p>&copy; {new Date().getFullYear()} HerHealth. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter

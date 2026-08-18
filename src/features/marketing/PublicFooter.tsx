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
      { label: 'SIRILA Intelligence', href: '/ai' },
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
      { label: 'About SIRILA', href: '/about' },
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
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_2fr] lg:gap-16 lg:py-20">
        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg text-foreground">
            <HeartPulse className="size-5 text-primary" aria-hidden="true" />
            SIRILA
          </Link>
          <p className="max-w-xs text-caption text-muted-foreground">
            Smart Intelligent Responsive Insights Life Assistant
          </p>
          <p className="font-display text-base text-foreground/80 italic">Understand yourself. Live better.</p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3.5">
              <p className="text-caption font-medium tracking-[0.1em] text-muted-foreground uppercase">
                {column.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 py-6 text-caption text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <p>&copy; {new Date().getFullYear()} SIRILA. All rights reserved.</p>
          <p>Private by design. Not medical advice.</p>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter

import { Link } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import AmbientOrb from '@/components/shared/AmbientOrb'

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

/**
 * Continues the page's atmosphere into the footer rather than closing
 * every page on a flat white/plain block — deep violet fading toward
 * near-black, the same visual family as HeroSection/FinalCta's
 * bg-hero-panel, so scrolling to the bottom of any page reads as the
 * environment settling rather than an abrupt cut to a generic footer.
 */
function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-hero-panel-foreground/10 bg-gradient-to-b from-hero-panel to-[#080511]">
      <AmbientOrb color="var(--hero-panel-accent)" size={560} top="-180px" left="-120px" opacity={0.16} />
      <AmbientOrb color="var(--lavender)" size={420} bottom="-160px" right="-80px" opacity={0.12} />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_2fr] lg:gap-16 lg:py-20">
        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg text-hero-panel-foreground">
            <HeartPulse className="size-5 text-peach" aria-hidden="true" />
            SIRILA
          </Link>
          <p className="max-w-xs text-caption text-hero-panel-foreground/60">
            Smart Intelligent Responsive Insights Life Assistant
          </p>
          <p className="font-display text-base text-hero-panel-foreground/80 italic">Understand yourself. Live better.</p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3.5">
              <p className="text-caption font-medium tracking-[0.1em] text-hero-panel-foreground/50 uppercase">
                {column.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-hero-panel-foreground/70 transition-colors hover:text-hero-panel-foreground"
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

      <div className="relative border-t border-hero-panel-foreground/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 py-6 text-caption text-hero-panel-foreground/45 sm:flex-row sm:justify-between sm:px-6">
          <p>&copy; {new Date().getFullYear()} SIRILA. All rights reserved.</p>
          <p>Private by design. Not medical advice.</p>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter

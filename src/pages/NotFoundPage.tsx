import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
import ScrollReveal from '@/components/shared/ScrollReveal'
import { useAuth } from '@/features/auth/useAuth'

/**
 * Catch-all for any unmatched URL. Self-contained (no AppShell) so it
 * renders correctly regardless of auth state, matching the same
 * full-screen pattern already used for Login/Signup/Onboarding. The
 * return destination is chosen from real auth state, never hardcoded.
 */
function NotFoundPage() {
  const { status } = useAuth()
  const isAuthenticated = status === 'authenticated'

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 overflow-hidden p-4 py-16 text-center sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(45% 45% at 50% 35%, color-mix(in oklch, var(--primary), transparent 92%) 0%, transparent 100%)',
        }}
      />

      <p
        aria-hidden="true"
        className="relative text-8xl font-display text-primary/10 select-none sm:text-9xl"
      >
        404
      </p>

      <div className="relative -mt-14 flex flex-col items-center gap-6 sm:-mt-16">
        <ScrollReveal>
          <div className="flex size-16 items-center justify-center rounded-full bg-lavender text-lavender-foreground shadow-[0_0_24px_color-mix(in_oklch,var(--primary),transparent_75%)]">
            <Compass className="size-7" aria-hidden="true" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <PageHeader
            title="We couldn't find that page"
            description="The link may be out of date, or the page may have moved."
            className="items-center"
          />
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <Button asChild variant="outline" className="transition-transform duration-200 hover:-translate-y-0.5">
            <Link to={isAuthenticated ? '/dashboard' : '/'}>
              <ArrowLeft aria-hidden="true" />
              {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
            </Link>
          </Button>
        </ScrollReveal>
      </div>
    </main>
  )
}

export default NotFoundPage

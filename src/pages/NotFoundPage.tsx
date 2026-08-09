import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-4 py-16 text-center animate-in fade-in duration-500 motion-reduce:animate-none sm:p-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-lavender text-lavender-foreground">
        <Compass className="size-7" aria-hidden="true" />
      </div>
      <p className="text-caption font-medium tracking-wide text-primary uppercase">404</p>
      <PageHeader
        title="We couldn't find that page"
        description="The link may be out of date, or the page may have moved."
        className="items-center"
      />
      <Button asChild variant="outline">
        <Link to={isAuthenticated ? '/dashboard' : '/'}>
          <ArrowLeft aria-hidden="true" />
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
        </Link>
      </Button>
    </main>
  )
}

export default NotFoundPage

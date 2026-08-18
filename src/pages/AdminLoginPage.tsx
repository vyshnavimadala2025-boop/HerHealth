import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/shared/PasswordInput'
import FullScreenLoader from '@/components/shared/FullScreenLoader'
import AuthLayout from '@/features/auth/AuthLayout'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { signIn, signOut } from '@/features/auth/authService'
import { useAuth } from '@/features/auth/useAuth'
import { checkIsAdmin } from '@/features/admin/adminAuth/adminAuthService'

/**
 * Administrator sign-in — a distinct entry point, not a second auth
 * system. Uses the exact same supabase.auth.signInWithPassword() call as
 * the regular LoginPage (via authService.signIn()); the only difference
 * is what happens after a successful sign-in: this page additionally
 * calls the existing public.is_admin() RPC (via checkIsAdmin(), already
 * used by AdminAuthProvider) and only proceeds to /admin if it returns
 * true. There is no separate credential store, no admin-specific
 * password, and no client-side notion of "admin" beyond that RPC result
 * — the same server-side boundary every admin RPC already enforces
 * independently is what actually protects /admin, not this page.
 *
 * If the authenticated account is not an admin, the session is signed
 * back out immediately rather than left in an ambiguous half-logged-in
 * state on an admin-branded page, and a generic message is shown. This
 * only ever reveals whether the account the visitor just proved
 * ownership of (by typing its real password) is an admin — never
 * anything about any other account, satisfying "never expose whether
 * another user's account is an administrator."
 */
function AdminLoginPage() {
  const { status } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const isSubmittingRef = useRef(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  // Already signed in (as anyone) — let the real guard (RequireAdmin,
  // via /admin) decide, rather than showing a login form to someone
  // already authenticated. Mirrors PublicOnlyRoute's pattern but targets
  // /admin instead of /dashboard.
  //
  // Guarded by !isSubmittingRef.current: AuthContext's status flips to
  // 'authenticated' the instant signIn() below succeeds — synchronously
  // triggering a re-render of this component WHILE onSubmit's own
  // checkIsAdmin()/signOut() logic is still awaiting. Without this guard,
  // that re-render would hit this early return and navigate to /admin
  // before this page's own admin check (and its sign-out-if-denied
  // behavior) ever got to run — confirmed by live testing, not
  // theoretical. RequireAdmin would still have safely bounced a non-admin
  // off of /admin either way (no unauthorized access), but the intended
  // "verify, then either enter or sign back out with a clear message" UX
  // never happened.
  if (status === 'loading') {
    return <FullScreenLoader />
  }
  if (status === 'authenticated' && !isSubmittingRef.current) {
    return <Navigate to="/admin" replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setSubmitError(null)
    setAccessDenied(false)
    try {
      await signIn(values)

      let isAdmin: boolean
      try {
        isAdmin = await checkIsAdmin()
      } catch {
        // Fail closed: if we can't confirm admin status, don't grant it.
        await signOut().catch(() => {})
        setSubmitError('Could not verify admin access. Please try again.')
        return
      }

      if (!isAdmin) {
        await signOut().catch(() => {})
        setAccessDenied(true)
        return
      }

      navigate('/admin', { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSubmittingRef.current = false
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
          <span className="text-caption font-medium uppercase tracking-wide">Administrator sign-in</span>
        </div>
        <h1 className="text-heading font-display text-foreground">Admin Login</h1>
        <p className="text-body text-muted-foreground">
          This area is restricted to authorized SIRILA administrators.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-email">Email address</Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="email"
            className="h-13 rounded-xl"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'admin-email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="admin-email-error" className="text-caption text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-password">Password</Label>
          <PasswordInput
            id="admin-password"
            autoComplete="current-password"
            className="h-13 rounded-xl"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'admin-password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p id="admin-password-error" className="text-caption text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {submitError && (
          <p role="alert" className="text-caption text-destructive">
            {submitError}
          </p>
        )}

        {accessDenied && (
          <p role="alert" className="text-caption text-destructive">
            This account doesn't have admin access.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="mt-2 h-14 w-full rounded-xl text-base transition-transform duration-200 hover:-translate-y-0.5"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
          Admin Login
        </Button>

        <p className="text-center text-caption text-muted-foreground">
          Not an administrator?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to regular sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default AdminLoginPage

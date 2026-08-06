import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/shared/PasswordInput'
import AuthLayout from '@/features/auth/AuthLayout'
import { signupSchema, type SignupFormValues } from '@/features/auth/schemas'
import { signUp } from '@/features/auth/authService'

function SignupPage() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const isSubmittingRef = useRef(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (values: SignupFormValues) => {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setSubmitError(null)
    try {
      const data = await signUp(values)
      if (data.session) {
        // Email confirmation is disabled on this Supabase project, so
        // signUp() already returned an active session — no verification
        // email was sent, so go straight to the dashboard.
        toast.success('Account created successfully. Welcome to HerHealth.')
        navigate('/dashboard', { replace: true })
      } else {
        // Email confirmation is enabled — Supabase sent a verification
        // email and no session exists yet.
        setSuccess(true)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSubmittingRef.current = false
    }
  }

  return (
    <AuthLayout>
      {success ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-support text-support-foreground">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </div>
          <h1 className="text-heading font-display text-foreground">Check your email</h1>
          <p className="text-body text-muted-foreground">
            Your account was created. Please check your email to complete verification.
          </p>
          <Button asChild size="lg" className="mt-2 h-14 w-full rounded-xl text-base">
            <Link to="/login">Go to login</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-heading font-display text-foreground">Begin your wellness journey</h1>
            <p className="text-body text-muted-foreground">
              Create your private HerHealth space and start understanding your wellness, one day at
              a time.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                className="h-13 rounded-xl"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-caption text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="h-13 rounded-xl"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="text-caption text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                className="h-13 rounded-xl"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <p id="password-error" className="text-caption text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                className="h-13 rounded-xl"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-caption text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {submitError && (
              <p role="alert" className="text-caption text-destructive">
                {submitError}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-2 h-14 w-full rounded-xl text-base transition-transform duration-200 hover:-translate-y-0.5"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
              {isSubmitting ? 'Creating account…' : 'Create My Account'}
            </Button>

            <p className="text-center text-caption text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </>
      )}
    </AuthLayout>
  )
}

export default SignupPage

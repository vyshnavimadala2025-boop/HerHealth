import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/shared/PasswordInput'
import AuthLayout from '@/features/auth/AuthLayout'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { signIn } from '@/features/auth/authService'

interface LocationState {
  from?: Location
}

function LoginPage() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isSubmittingRef = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setSubmitError(null)
    try {
      await signIn(values)
      const state = location.state as LocationState | null
      const redirectTo = state?.from ? `${state.from.pathname}${state.from.search}` : '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSubmittingRef.current = false
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-2">
        <h1 className="text-heading font-display text-foreground">Welcome back</h1>
        <p className="text-body text-muted-foreground">
          Continue your wellness journey with a private space designed around you.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 flex flex-col gap-5">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-caption font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
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
          Sign In
        </Button>

        <p className="text-center text-caption text-muted-foreground">
          New to SIRILA?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default LoginPage

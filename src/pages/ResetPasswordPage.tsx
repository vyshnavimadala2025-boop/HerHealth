import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { HeartPulse, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/shared/PasswordInput'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schemas'
import { updatePassword } from '@/features/auth/authService'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/features/auth/useAuth'
import FullScreenLoader from '@/components/shared/FullScreenLoader'

function ResetPasswordPage() {
  const { status } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setSubmitError(null)
    try {
      await updatePassword(values.password)
      await supabase.auth.signOut()
      toast.success('Password updated. Please log in.')
      navigate('/login', { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
    }
  }

  if (status === 'loading') {
    return <FullScreenLoader />
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 animate-in fade-in duration-500 motion-reduce:animate-none">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="size-5 text-primary" />
            Set a new password
          </CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>

        {status === 'unauthenticated' ? (
          <CardContent className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-body text-muted-foreground">
              This password reset link is invalid or has expired.
            </p>
            <Button asChild className="w-full">
              <Link to="/forgot-password">Request a new link</Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">New password</Label>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
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
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
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
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
                Update password
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  )
}

export default ResetPasswordPage

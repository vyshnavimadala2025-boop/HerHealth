import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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

/**
 * Reuses the exact same zod schema (resetPasswordSchema) and service
 * function (updatePassword) already used by ResetPasswordPage — no
 * duplicate password validation logic. No current-password field: Supabase
 * updateUser({ password }) only requires the existing active session, not
 * re-entry of the current password, which is already how ResetPasswordPage
 * behaves today.
 */
function ChangePasswordForm() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const isSubmittingRef = useRef(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true
    setSubmitError(null)
    setSubmitSuccess(false)
    try {
      await updatePassword(values.password)
      setSubmitSuccess(true)
      reset()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      isSubmittingRef.current = false
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settings-password">New password</Label>
            <PasswordInput
              id="settings-password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'settings-password-error' : undefined}
              {...register('password')}
            />
            {errors.password && (
              <p id="settings-password-error" className="text-caption text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settings-confirm-password">Confirm new password</Label>
            <PasswordInput
              id="settings-confirm-password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? 'settings-confirm-password-error' : undefined
              }
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p id="settings-confirm-password-error" className="text-caption text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {submitError && (
            <p role="alert" className="text-caption text-destructive">
              {submitError}
            </p>
          )}
          {submitSuccess && (
            <p role="status" className="text-caption text-primary">
              Password updated.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Updating…' : 'Update password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default ChangePasswordForm

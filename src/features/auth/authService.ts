import type { AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

const FRIENDLY_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Incorrect email or password.',
  'User already registered': 'An account with this email already exists.',
  'Email not confirmed': 'Please confirm your email address before logging in.',
  'Password should be at least 8 characters': 'Password must be at least 8 characters.',
  'Email rate limit exceeded': 'Too many attempts. Please wait a moment and try again.',
  'For security purposes, you can only request this after 60 seconds':
    'Please wait a moment before trying again.',
}

function toFriendlyMessage(error: AuthError | Error): string {
  const status = 'status' in error ? error.status : undefined
  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  const message = error.message
  return FRIENDLY_MESSAGES[message] ?? 'Something went wrong. Please try again.'
}

export interface SignUpInput {
  fullName: string
  email: string
  password: string
}

export async function signUp({ fullName, email, password }: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    if (error.status === 429) {
      throw new Error(
        'Signup is temporarily limited because too many verification emails were requested. Please wait and try again.',
      )
    }
    throw new Error(toFriendlyMessage(error))
  }

  // The profile row is created server-side by a database trigger on
  // auth.users (see supabase/migrations/0001_profiles.sql), not here — that
  // way it works even before email confirmation, when no session exists yet.
  return data
}

export interface SignInInput {
  email: string
  password: string
}

export async function signIn({ email, password }: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(toFriendlyMessage(error))
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(toFriendlyMessage(error))
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw new Error(toFriendlyMessage(error))
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(toFriendlyMessage(error))
}

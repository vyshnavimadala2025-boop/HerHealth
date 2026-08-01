import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { AuthContext, type AuthStatus, type ProfileStatus } from '@/features/auth/AuthContext'
import { getProfile } from '@/features/profile/profileService'
import type { Profile } from '@/features/profile/types'

interface AuthState {
  status: AuthStatus
  user: User | null
  session: Session | null
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
    session: null,
  })
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('idle')

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      setState({
        status: session ? 'authenticated' : 'unauthenticated',
        user: session?.user ?? null,
        session,
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setState({
        status: session ? 'authenticated' : 'unauthenticated',
        user: session?.user ?? null,
        session,
      })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const userId = state.user?.id ?? null

  useEffect(() => {
    let active = true

    if (!userId) {
      setProfile(null)
      setProfileStatus('idle')
      return
    }

    setProfileStatus('loading')
    getProfile(userId)
      .then((result) => {
        if (!active) return
        setProfile(result)
        setProfileStatus('ready')
      })
      .catch(() => {
        if (!active) return
        setProfile(null)
        setProfileStatus('error')
      })

    return () => {
      active = false
    }
  }, [userId])

  const refreshProfile = useCallback(async () => {
    if (!userId) return
    try {
      const result = await getProfile(userId)
      setProfile(result)
      setProfileStatus('ready')
    } catch {
      setProfileStatus('error')
    }
  }, [userId])

  const value = useMemo(
    () => ({ ...state, profile, profileStatus, refreshProfile }),
    [state, profile, profileStatus, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider

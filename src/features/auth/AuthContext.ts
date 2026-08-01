import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '@/features/profile/types'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
export type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  session: Session | null
  profile: Profile | null
  profileStatus: ProfileStatus
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

import { createContext } from 'react'

export type AdminAuthStatus = 'loading' | 'authorized' | 'unauthorized' | 'error'

export interface AdminAuthContextValue {
  status: AdminAuthStatus
  refresh: () => void
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

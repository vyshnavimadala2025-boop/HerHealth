import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { signOut } from '@/features/auth/authService'

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

  const logout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      toast.success('You have been logged out.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong.')
      setIsLoggingOut(false)
    }
  }

  return { logout, isLoggingOut }
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiLogin, apiLogout, apiMe, apiRegister, type Me } from '../utils/account'

interface AuthContextValue {
  user: Me | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiMe()
      .then(me => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string) => {
    setUser(await apiLogin(email, password))
  }

  const register = async (email: string, password: string, name: string) => {
    setUser(await apiRegister(email, password, name))
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
  }

  const refresh = async () => {
    setUser(await apiMe())
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

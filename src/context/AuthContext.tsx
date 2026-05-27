import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'
import type { Profile } from '../api/client'

type User = {
  id: string
  email: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  login: (_email: string, _password: string) => Promise<void>
  register: (_email: string, _password: string, _full_name: string, _company: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ user: User; profile: Profile }>('/auth/me')
      .then((data) => {
        setUser(data.user)
        setProfile(data.profile)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleAuthExpired() {
      setUser(null)
      setProfile(null)
    }
    window.addEventListener('auth:expired', handleAuthExpired)
    return () => window.removeEventListener('auth:expired', handleAuthExpired)
  }, [])

  async function login(email: string, password: string) {
    const data = await api.post<{ user: User; profile: Profile }>('/auth/login', { email, password })
    setUser(data.user)
    setProfile(data.profile)
  }

  async function register(email: string, password: string, full_name: string, company: string) {
    const data = await api.post<{ user: User; profile: Profile }>('/auth/register', { email, password, full_name, company })
    setUser(data.user)
    setProfile(data.profile)
  }

  async function logout() {
    try {
      await api.post('/auth/logout', {})
    } catch {
    } finally {
      setUser(null)
      setProfile(null)
    }
  }
  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
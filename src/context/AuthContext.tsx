import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

type User = {
  id: string
  email: string
}

type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  company: string | null
  role: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    api.get('/auth/me')
      .then((data) => {
        setUser(data.user)
        setProfile(data.profile)
      })
      .catch(() => {
        localStorage.removeItem('token')
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.session.access_token)
    setUser(data.user)
    setProfile(null)

    const me = await api.get('/auth/me')
    setProfile(me.profile)
  }

  async function register(email: string, password: string, full_name: string) {
    const data = await api.post('/auth/register', { email, password, full_name })
    localStorage.setItem('token', data.session.access_token)
    setUser(data.user)

    const me = await api.get('/auth/me')
    setProfile(me.profile)
  }

  function logout() {
    api.post('/auth/logout', {})
    localStorage.removeItem('token')
    setUser(null)
    setProfile(null)
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

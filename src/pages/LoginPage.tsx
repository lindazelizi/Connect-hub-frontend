import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { gradientBtn } from '../lib/utils'
import loginImg from '../public/login.png'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-gray-100"
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex" style={{ minHeight: '380px' }}>

        <div className="relative hidden sm:block w-2/5 overflow-hidden">
          <img
            src={loginImg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"/>
        </div>

        <div className="flex-1 flex flex-col justify-center px-10 py-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">User Login</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
              <UserCircleIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Username"
                className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
              <LockClosedIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Password"
                className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-white font-semibold text-sm disabled:opacity-60 transition-opacity hover:opacity-80"
              style={gradientBtn}
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-3">
            <Link to="/forgot-password" className="hover:text-gray-600 transition-colors">Forgot Username / Password?</Link>
          </p>

          <p className="text-xs text-gray-400 text-center mt-4">Don't have an account?{' '}
            <Link to="/register" className="text-gray-600 font-semibold hover:underline">Create Your Account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
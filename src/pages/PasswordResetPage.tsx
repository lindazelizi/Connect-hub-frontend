import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { EnvelopeIcon, LockClosedIcon, CheckIcon } from '@heroicons/react/24/outline'
import { api } from '../api/client'
import { gradientBtnWide } from '../lib/utils'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-2 w-full" style={gradientBtnWide} />
        <div className="px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Reset Password</h1>
          <p className="text-sm text-gray-400 mb-6">We'll send you a reset link</p>

          {sent ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <EnvelopeIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-800">Check your email</p>
              <p className="text-sm text-gray-500">If an account exists for <span className="font-medium text-gray-700">{email}</span>, we've sent a reset link.
              </p>
              <Link to="/login" className="block text-sm text-gray-500 hover:text-gray-700 hover:underline mt-2">Back to log in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="Email" className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold text-sm tracking-widest disabled:opacity-60 hover:opacity-90 transition-opacity" style={{ ...gradientBtnWide, letterSpacing: '0.1em' }}>
                {loading ? 'SENDING...' : 'SEND RESET LINK'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                <Link to="/login" className="text-gray-600 font-semibold hover:underline">Back to log in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const at = params.get('access_token')
    const rt = params.get('refresh_token')
    const type = params.get('type')
    if (!at || !rt || type !== 'recovery') { setInvalidLink(true); return }
    setAccessToken(at)
    setRefreshToken(rt)
  }, [])

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { access_token: accessToken, refresh_token: refreshToken, new_password: password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-2 w-full" style={gradientBtnWide} />
        <div className="px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">New Password</h1>
          <p className="text-sm text-gray-400 mb-6">Choose a strong password</p>

          {invalidLink ? (
            <div className="text-center space-y-3">
              <p className="text-red-500 text-sm font-medium">Invalid or expired reset link.</p>
              <Link to="/forgot-password" className="block text-sm text-gray-600 hover:underline">Request a new link</Link>
            </div>
          ) : done ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-800">Password updated!</p>
              <p className="text-sm text-gray-500">Redirecting to log in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                <LockClosedIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="New password" className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
              </div>
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                <LockClosedIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Confirm password" className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 hover:opacity-90 transition-opacity" style={{ ...gradientBtnWide, letterSpacing: '0.1em' }}>
                {loading ? 'SAVING...' : 'SET NEW PASSWORD'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
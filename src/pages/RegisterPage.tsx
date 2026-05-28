import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserCircleIcon, EnvelopeIcon, LockClosedIcon, BuildingOffice2Icon, CheckIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { gradientBtnWide } from '../lib/utils'

const COMPANIES = [
  'Quinix', 'NordTech AB', 'Vega Solutions', 'Helix Dynamics',
  'Astra Innovations', 'Kronos Systems', 'Elara Group',
  'Meridian Labs', 'Solara Ventures', 'Apex Digital',
]


export default function RegisterPage() {
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  function friendlyError(msg: string): string {
    const m = msg.toLowerCase()
    if (m.includes('already') || m.includes('exists') || m.includes('duplicate') || m.includes('unique')) return 'An account with this email already exists. Try logging in instead.'
    if (m.includes('invalid') && m.includes('email')) return 'Please enter a valid email address.'
    if (m.includes('invalid') && m.includes('format')) return 'Please enter a valid email address.'
    if (m.includes('password') && m.includes('short')) return 'Password is too short.'
    return 'Something went wrong. Please try again.'
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!company) { setError('Please select your company.'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setError('Please enter a valid email address.'); return }
    setError('')
    setLoading(true)
    try {
      await register(email, password, fullName, company)
      setRegistered(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? friendlyError(err.message) : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-2 w-full" style={gradientBtnWide} />

        <div className="px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
          <p className="text-sm text-gray-400 mb-6">Join your team on ConnectHub</p>

          {registered ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-800">Account created!</p>
              <p className="text-sm text-gray-500">Check your email to verify, then log in.</p>
              <Link to="/login" className="block w-full py-3 rounded-xl text-white font-semibold text-sm text-center mt-2 hover:opacity-90 transition-opacity" style={gradientBtnWide}>Go to log in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3">
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                <UserCircleIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="off" placeholder="Full name" className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
              </div>

              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="off" placeholder="Email" className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
              </div>

              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                <LockClosedIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" placeholder="Password" style={{ WebkitTextSecurity: 'disc' } as React.CSSProperties} className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
              </div>

              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                <BuildingOffice2Icon className="w-4 h-4 text-gray-400 shrink-0" />
                <select value={company} onChange={(e) => setCompany(e.target.value)} required className="bg-transparent flex-1 text-sm text-gray-700 focus:outline-none">
                  <option value="">Select company...</option>
                  {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <p className="text-xs text-gray-400 px-1">You will only connect with colleagues from the same company.</p>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold text-sm tracking-widest disabled:opacity-60 hover:opacity-90 transition-opacity" style={{ ...gradientBtnWide, letterSpacing: '0.1em' }}>
                {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
              </button>

              <p className="text-xs text-gray-400 text-center">Already have an account?{' '}<Link to="/login" className="text-gray-600 font-semibold hover:underline">Log in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/ui'
import { useImageUpload } from '../hooks'

export default function EditProfilePage() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [industry, setIndustry] = useState(profile?.industry ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { url: avatarUrl, preview: avatarPreview, uploading, handleFileChange: handleAvatarChange } = useImageUpload(profile?.avatar_url ?? null)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.patch('/profiles/me', { full_name: fullName, bio: bio || null, industry: industry || null, avatar_url: avatarUrl || null })
      navigate(`/profile/${user?.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Edit profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile picture</label>
          <div className="flex items-center gap-4">
            <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar user={{ full_name: fullName || '?', avatar_url: avatarPreview }} size="lg" />
            </div>
            <div>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                {uploading ? 'Uploading...' : 'Choose Image'}
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG or PNG</p>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="glass-input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <div className="glass-input flex items-center justify-between opacity-60 cursor-not-allowed">
            <span>{profile?.company ?? '—'}</span>
            <span className="text-xs text-gray-400">Set at registration</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Optional" className="glass-input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a bit about yourself..." rows={4} className="glass-input resize-none" />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading || uploading} className="text-white text-sm px-5 py-2 rounded-lg disabled:opacity-50 hover:opacity-80 transition-opacity" style={{ background: '#be185d' }}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Cancel</button>
        </div>
      </form>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '../api/client'

export default function FollowButton({ userId }: { userId: string }) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/follows/status/${userId}`)
      .then((data) => setFollowing(data.following))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  async function toggle() {
    if (loading) return
    setLoading(true)
    try {
      if (following) {
        await api.delete(`/follows/${userId}`)
        setFollowing(false)
      } else {
        await api.post(`/follows/${userId}`, {})
        setFollowing(true)
      }
    } catch {
      toast.error('Could not update follow status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50 ${
        following
          ? 'border border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'
          : 'text-white hover:opacity-80'
      }`}
      style={following ? {} : { background: '#be185d' }}>{loading ? '...' : following ? 'Following' : 'Follow'}</button>
  )
}
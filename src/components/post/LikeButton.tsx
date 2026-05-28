import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid'
import { HandThumbUpIcon as HandThumbUpOutline } from '@heroicons/react/24/outline'
import { api } from '../../api/client'

export default function LikeButton({ postId, initialCount = 0 }: { postId: string; initialCount?: number }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/likes/post/${postId}`)
      .then((data) => { setLiked(data.liked); setCount(data.count ?? data.likes_count ?? initialCount) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [postId])

  async function toggle() {
    if (loading) return
    setLoading(true)
    try {
      if (liked) {
        await api.delete(`/likes/post/${postId}`)
        setLiked(false); setCount((c) => c - 1)
      } else {
        await api.post(`/likes/post/${postId}`, {})
        setLiked(true); setCount((c) => c + 1)
      }
    } catch {
      toast.error('Could not update like')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={toggle} disabled={loading} className={`flex items-center gap-1 text-sm transition-colors ${liked ? 'text-pink-700' : 'text-gray-400 hover:text-pink-700'}`}>
      {liked ? <HandThumbUpSolid className="w-4 h-4" /> : <HandThumbUpOutline className="w-4 h-4" />}
      {count > 0 && <span>{count}</span>}
    </button>
  )
}

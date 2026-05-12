import { useEffect, useState } from 'react'
import { api } from '../api/client'

type Props = {
  postId: string
}

export default function LikeButton({ postId }: Props) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/likes/post/${postId}`)
      .then((data) => {
        setLiked(data.liked)
        setCount(data.count ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [postId])

  async function toggle() {
    if (loading) return
    setLoading(true)
    try {
      if (liked) {
        await api.delete(`/likes/post/${postId}`)
        setLiked(false)
        setCount((c) => c - 1)
      } else {
        await api.post(`/likes/post/${postId}`, {})
        setLiked(true)
        setCount((c) => c + 1)
      }
    } catch {
      // återställ vid fel — ingen synlig ändring
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1 text-sm transition-colors ${
        liked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
      }`}
    >
      <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.25M6.633 10.25H5.25a1.125 1.125 0 0 0-1.125 1.125v6.75c0 .621.504 1.125 1.125 1.125h1.383" />
      </svg>
      {count > 0 && <span>{count}</span>}
    </button>
  )
}

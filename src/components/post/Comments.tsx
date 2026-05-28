import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { Comment } from '../../api/client'
import { Avatar } from '../ui'

const COMMENTS_PAGE_SIZE = 20

export default function Comments({ postId }: { postId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/posts/${postId}/comments?limit=${COMMENTS_PAGE_SIZE}&offset=0`)
      .then((data) => {
        const list: Comment[] = data.comments ?? data
        setComments(list)
        setHasMore(list.length === COMMENTS_PAGE_SIZE)
      })
      .catch(() => toast.error('Could not load comments'))
      .finally(() => setLoading(false))
  }, [postId])

  async function loadMore() {
    setLoadingMore(true)
    try {
      const data = await api.get(`/posts/${postId}/comments?limit=${COMMENTS_PAGE_SIZE}&offset=${comments.length}`)
      const list: Comment[] = data.comments ?? data
      setComments((prev) => [...prev, ...list])
      setHasMore(list.length === COMMENTS_PAGE_SIZE)
    } catch {
      toast.error('Could not load more comments')
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!text.trim()) 
      return
    setSubmitting(true)
    try {
      const data = await api.post(`/posts/${postId}/comments`, { content: text })
      setComments((prev) => [...prev, data.comment ?? data])
      setText('')
    } catch {
      toast.error('Could not post comment')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch {
      toast.error('Could not delete comment')
    }
  }

  return (
    <div className="space-y-3">
      {loading && <p className="text-xs text-gray-400">Loading comments..</p>}
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2 group">
          <Avatar user={c.author} size="sm" />
          <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold text-gray-700">{c.author.full_name}</p>
              {c.author.id === user?.id && (
                <button onClick={() => handleDelete(c.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" title="Delete">
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700">{c.content}</p>
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="text-xs text-gray-400 hover:text-pink-700 transition-colors disabled:opacity-50"
        >
          {loadingMore ? 'Loading..' : 'Load more comments'}
        </button>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment.." className="glass-input flex-1 rounded-full" style={{ width: 'auto' }} />
        <button type="submit" disabled={submitting || !text.trim()} className="text-white text-sm px-3 py-1.5 rounded-full disabled:opacity-50 hover:opacity-80 transition-opacity" style={{ background: '#be185d' }}>Send</button>
      </form>
    </div>
  )
}
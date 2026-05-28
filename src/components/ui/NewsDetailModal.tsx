import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from '@heroicons/react/24/solid'
import { HandThumbUpIcon as HandThumbUpOutline, HandThumbDownIcon as HandThumbDownOutline } from '@heroicons/react/24/outline'
import { Avatar } from '.'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { fmtDateLong, fmtTime, CATEGORY_COLORS, gradientBtn } from '../../lib/utils'
import type { NewsPost, NewsComment } from '../../api/client'

type Props = {
  item: NewsPost
  onClose: () => void
  onReact?: (_newsId: string, _newReaction: 'like' | 'dislike' | null, _prevReaction: 'like' | 'dislike' | null) => void
  autoFocusComments?: boolean
  showFeedLink?: boolean
}

export default function NewsDetailModal({ item, onClose, onReact, autoFocusComments, showFeedLink }: Props) {
  const { user } = useAuth()
  const [comments, setComments] = useState<NewsComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reacting, setReacting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLInputElement>(null)
  const commentsSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get(`/news/${item.id}/comments`)
      .then((data: any) => setComments(Array.isArray(data) ? data : data.comments ?? []))
      .catch(() => {})
      .finally(() => setCommentsLoading(false))
  }, [item.id])

  useEffect(() => {
    if (autoFocusComments && !commentsLoading) {
      commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      commentInputRef.current?.focus()
    }
  }, [autoFocusComments, commentsLoading])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  async function handleReact(type: 'like' | 'dislike') {
    if (reacting) return
    setReacting(true)
    const prev = item.user_reaction
    try {
      const data: any = await api.post(`/news/${item.id}/react`, { type })
      onReact?.(item.id, data.user_reaction, prev)
    } catch {
      toast.error('Could not save reaction')
    } finally {
      setReacting(false)
    }
  }

  async function handleComment(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!commentText.trim() || submitting) return
    setSubmitting(true)
    try {
      const data: any = await api.post(`/news/${item.id}/comments`, { content: commentText })
      setComments((prev) => [...prev, data])
      setCommentText('')
    } catch {
      toast.error('Could not post comment')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      await api.delete(`/news/${item.id}/comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch {
      toast.error('Could not delete comment')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {item.image_url && (
          <img src={item.image_url} alt="" className="w-full object-cover max-h-72 rounded-t-2xl" />
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {item.category && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {item.category}
                </span>
              )}
              <span className="text-xs text-gray-400">{fmtDateLong(item.created_at)}</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 text-lg leading-none">X</button>
          </div>

          <h2 className="font-bold text-gray-900 text-xl leading-snug">{item.title}</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.content}</p>

          {item.author && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <Avatar user={item.author} size="sm" />
              <Link to={`/profile/${item.author.id}`} onClick={onClose} className="text-xs text-gray-500 hover:underline font-medium">
                {item.author.full_name}
              </Link>
            </div>
          )}
          {showFeedLink && (
            <div className="pt-1">
              <Link to="/news" onClick={onClose} className="text-sm font-medium text-pink-700 hover:text-pink-600 transition-colors">Read more news</Link>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => handleReact('like')}
              disabled={reacting}
              className={`flex items-center gap-1 text-sm transition-colors disabled:opacity-50 ${item.user_reaction === 'like' ? 'text-pink-700' : 'text-gray-400 hover:text-pink-700'}`}
            >
              {item.user_reaction === 'like' ? <HandThumbUpSolid className="w-4 h-4" /> : <HandThumbUpOutline className="w-4 h-4" />}
              {item.likes_count > 0 && <span>{item.likes_count}</span>}
            </button>
            <button
              onClick={() => handleReact('dislike')}
              disabled={reacting}
              className={`flex items-center gap-1 text-sm transition-colors disabled:opacity-50 ${item.user_reaction === 'dislike' ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {item.user_reaction === 'dislike' ? <HandThumbDownSolid className="w-4 h-4" /> : <HandThumbDownOutline className="w-4 h-4" />}
              {item.dislikes_count > 0 && <span>{item.dislikes_count}</span>}
            </button>
          </div>

          <div ref={commentsSectionRef} className="border-t border-gray-100 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Comments {comments.length > 0 && `(${comments.length})`}
            </h3>

            {commentsLoading ? (
              <p className="text-xs text-gray-400">Loading comments..</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-400">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar user={c.author} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-xl px-3 py-2">
                        <Link
                          to={`/profile/${c.author.id}`}
                          onClick={onClose}
                          className="text-xs font-semibold text-gray-800 hover:underline"
                        >
                          {c.author.full_name}
                        </Link>
                        <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 px-1">
                        <span className="text-xs text-gray-400">{fmtTime(c.created_at)}</span>
                        {c.user_id === user?.id && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}

            <form onSubmit={handleComment} className="flex gap-2 pt-1">
              <input
                ref={commentInputRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="glass-input flex-1 rounded-full text-sm"
                style={{ width: 'auto' }}
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="text-white text-sm px-4 py-2 rounded-full disabled:opacity-50 hover:opacity-80 transition-opacity flex-shrink-0"style={gradientBtn}>Post</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
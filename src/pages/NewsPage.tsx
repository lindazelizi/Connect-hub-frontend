import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ArrowUpTrayIcon, PencilIcon, TrashIcon, ChatBubbleOvalLeftEllipsisIcon, HandThumbUpIcon as HandThumbUpOutline, HandThumbDownIcon as HandThumbDownOutline } from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from '@heroicons/react/24/solid'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { NewsPost } from '../api/client'
import { Avatar, PostSkeleton } from '../components/ui'
import { useImageUpload } from '../hooks'
import { gradientBtn, fmtDateLong, CATEGORY_COLORS } from '../lib/utils'
import NewsDetailModal from '../components/ui/NewsDetailModal'

const CATEGORIES = ['Announcement', 'Company Update', 'Employee of the Month', 'Event', 'Policy Change', 'Other']

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-600'}`}>{category}</span>
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-bold text-gray-900 text-lg">Delete post</h2>
        <p className="text-sm text-gray-600">Are you sure you want to delete this post? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="text-sm text-white px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  )
}


function NewsForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: NewsPost
  onSaved: (_post: NewsPost) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(initial?.image_url ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { url: newImageUrl, preview: newImagePreview, uploading, handleFileChange, reset: resetUpload } = useImageUpload()

  const isEdit = !!initial
  const previewSrc = newImagePreview ?? existingImageUrl

  function removeImage() {
    resetUpload()
    setExistingImageUrl(null)
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true); setError(null)
    const image_url = newImageUrl ?? existingImageUrl ?? null
    try {
      let data: NewsPost
      if (isEdit) {
        data = await api.patch(`/news/${initial.id}`, { title, content, category: category || null, image_url })
      } else {
        const res = await api.post('/news', { title, content, category: category || null, image_url })
        data = res.news ?? res
      }
      onSaved(data)
      toast.success(isEdit ? 'Post updated!' : 'Post published!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 space-y-3">
      <h2 className="font-semibold text-gray-900">{isEdit ? 'Edit post' : 'New post'}</h2>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="glass-input">
          <option value="">No category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Welcome our new team members!" required className="glass-input" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Content *</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write the news content here..." required rows={5} className="glass-input resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Image (optional)</label>
        {previewSrc ? (
          <div className="relative inline-block">
            <img src={previewSrc} alt="Preview" className="rounded-lg max-h-48 object-cover" />
            <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/70">X</button>
          </div>
        ) : (
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 hover:border-gray-400 transition-colors disabled:opacity-50">
            <ArrowUpTrayIcon className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Attach image'}
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading || uploading} className="text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 hover:opacity-80 transition-opacity" style={gradientBtn}>
          {loading ? (isEdit ? 'Saving...' : 'Publishing...') : (isEdit ? 'Save changes' : 'Publish')}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Cancel</button>
      </div>
    </form>
  )
}

export default function NewsPage() {
  const { profile } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsPost | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [openWithComments, setOpenWithComments] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [news, setNews] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)

  const selectedItem = selectedItemId ? news.find((n) => n.id === selectedItemId) ?? null : null

  useEffect(() => {
    api.get('/news')
      .then((data: any) => setNews(data.news ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])
  const isAdmin = profile?.role === 'admin'
  const filtered = activeCategory ? news.filter((n) => n.category === activeCategory) : news
  const usedCategories = Array.from(new Set(news.map((n) => n.category).filter(Boolean))) as string[]

  function handleDelete(e: React.MouseEvent, itemId: string) {
    e.stopPropagation()
    setDeletingId(itemId)
  }

  async function confirmDelete() {
    if (!deletingId) return
    try {
      await api.delete(`/news/${deletingId}`)
      setNews((prev) => prev.filter((n) => n.id !== deletingId))
      toast.success('Post deleted')
    } catch { toast.error('Could not delete post') }
    finally { setDeletingId(null) }
  }

  function handleSaved(post: NewsPost) {
    if (editingItem) {
      setNews((prev) => prev.map((n) => n.id === post.id ? post : n))
      setEditingItem(null)
    } else {
      setNews((prev) => [post, ...prev])
      setShowForm(false)
    }
  }

  function handleReact(newsId: string, newReaction: 'like' | 'dislike' | null, prevReaction: 'like' | 'dislike' | null) {
    setNews((prev) => prev.map((n) => {
      if (n.id !== newsId) return n
      return {
        ...n,
        likes_count: n.likes_count + (newReaction === 'like' ? 1 : 0) - (prevReaction === 'like' ? 1 : 0),
        dislikes_count: n.dislikes_count + (newReaction === 'dislike' ? 1 : 0) - (prevReaction === 'dislike' ? 1 : 0),
        user_reaction: newReaction,
      }
    }))
  }

  async function reactToNews(newsId: string, type: 'like' | 'dislike', currentReaction: 'like' | 'dislike' | null) {
    try {
      const data: any = await api.post(`/news/${newsId}/react`, { type })
      handleReact(newsId, data.user_reaction, currentReaction)
    } catch {
      toast.error('Could not save reaction')
    }
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}</div>

  return (
    <>
      {deletingId && <ConfirmModal onConfirm={confirmDelete} onCancel={() => setDeletingId(null)} />}
      {selectedItem && <NewsDetailModal item={selectedItem} onClose={() => { setSelectedItemId(null); setOpenWithComments(false) }} onReact={handleReact} autoFocusComments={openWithComments} />}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Company News</h1>
            {profile?.company && <p className="text-sm text-gray-400 mt-0.5">{profile.company}</p>}
          </div>
          {isAdmin && !showForm && !editingItem && (
            <button onClick={() => setShowForm(true)} className="text-white text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-opacity" style={gradientBtn}>+ Create new news</button>
          )}
        </div>

        {showForm && (
          <NewsForm onSaved={handleSaved} onCancel={() => setShowForm(false)} />
        )}

        {usedCategories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setActiveCategory(null)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${activeCategory === null ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`} style={activeCategory === null ? gradientBtn : {}}>All</button>
            {usedCategories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${activeCategory === cat ? 'text-white border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`} style={activeCategory === cat ? gradientBtn : {}}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 && <p className="text-gray-500 text-center py-12">No news posted yet.</p>}

        {filtered.map((item) =>
          editingItem?.id === item.id ? (
            <NewsForm
              key={item.id}
              initial={item}
              onSaved={handleSaved}
              onCancel={() => setEditingItem(null)}
            />
          ) : (
            <article
              key={item.id}
              className="glass-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedItemId(item.id)}>
              {item.image_url && (
                <img src={item.image_url} alt="" className="w-full object-cover max-h-52"/>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CategoryBadge category={item.category} />
                      <span className="text-xs text-gray-400">
                        {fmtDateLong(item.created_at)}
                      </span>
                    </div>
                    <h2 className="font-semibold text-gray-900 text-base leading-snug">{item.title}</h2>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-gray-400 hover:text-blue-500 transition-colors text-xs"
                        title="Edit">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors text-xs"
                        title="Delete">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-700 line-clamp-3">{item.content}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  {item.author ? (
                    <div className="flex items-center gap-2">
                      <Avatar user={item.author} size="sm" />
                      <span className="text-xs text-gray-500 font-medium">{item.author.full_name}</span>
                    </div>
                  ) : <div />}
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => reactToNews(item.id, 'like', item.user_reaction)}
                      className={`flex items-center gap-1 text-sm transition-colors ${item.user_reaction === 'like' ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}>
                      {item.user_reaction === 'like' ? <HandThumbUpSolid className="w-4 h-4" /> : <HandThumbUpOutline className="w-4 h-4" />}
                      {item.likes_count > 0 && <span>{item.likes_count}</span>}
                    </button>
                    <button
                      onClick={() => reactToNews(item.id, 'dislike', item.user_reaction)}
                      className={`flex items-center gap-1 text-sm transition-colors ${item.user_reaction === 'dislike' ? 'text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {item.user_reaction === 'dislike' ? <HandThumbDownSolid className="w-4 h-4" /> : <HandThumbDownOutline className="w-4 h-4" />}
                      {item.dislikes_count > 0 && <span>{item.dislikes_count}</span>}
                    </button>
                    <button
                      onClick={() => { setSelectedItemId(item.id); setOpenWithComments(true) }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-500 transition-colors">
                      <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
                      {item.comments_count > 0 && item.comments_count}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        )}
      </div>
    </>
  )
}
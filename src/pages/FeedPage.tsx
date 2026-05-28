import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PlusIcon } from '@heroicons/react/24/outline'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Post, NewsPost } from '../api/client'
import { PAGE_SIZE, fmtDateLong, CATEGORY_COLORS, gradientBtn } from '../lib/utils'
import CreatePost from '../components/post/CreatePost'
import PostCard from '../components/post/PostCard'
import { PostSkeleton, Avatar } from '../components/ui'
import NewsDetailModal from '../components/ui/NewsDetailModal'

function NewsCard({ item, onOpen }: { item: NewsPost; onOpen: () => void }) {
  return (
    <article className="glass-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onOpen}>
      {item.image_url && <img src={item.image_url} alt="" className="w-full object-cover max-h-52" />}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700">Company News</span>
          {item.category && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] ?? 'bg-gray-100 text-gray-600'}`}>{item.category}</span>
          )}
          <span className="text-xs text-gray-400 ml-auto">{fmtDateLong(item.created_at)}</span>
        </div>
        <h2 className="font-semibold text-gray-900 text-base leading-snug">{item.title}</h2>
        <p className="mt-2 text-sm text-gray-700 line-clamp-3">{item.content}</p>
        {item.author && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <Avatar user={item.author} size="sm" />
            <span className="text-xs text-gray-500 font-medium">{item.author.full_name}</span>
          </div>
        )}
      </div>
    </article>
  )
}

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [newsList, setNewsList] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedNews, setSelectedNews] = useState<NewsPost | null>(null)

  function handleNewsReact(newsId: string, newReaction: 'like' | 'dislike' | null, prevReaction: 'like' | 'dislike' | null) {
    const update = (n: NewsPost): NewsPost => ({
      ...n,
      likes_count: n.likes_count + (newReaction === 'like' ? 1 : 0) - (prevReaction === 'like' ? 1 : 0),
      dislikes_count: n.dislikes_count + (newReaction === 'dislike' ? 1 : 0) - (prevReaction === 'dislike' ? 1 : 0),
      user_reaction: newReaction,
    })
    setNewsList(prev => prev.map(n => n.id === newsId ? update(n) : n))
    setSelectedNews(prev => (prev?.id === newsId ? update(prev) : prev))
  }

  useEffect(() => {
    api.get<Post[]>(`/posts/feed?page=1&limit=${PAGE_SIZE}`)
      .then((data: any) => {
        const list: Post[] = Array.isArray(data.posts) ? data.posts : Array.isArray(data) ? data : []
        setPosts(list)
        setHasMore(list.length === PAGE_SIZE)
      })
      .catch((err: any) => setError(err.message ?? 'Something went wrong'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    api.get('/news?limit=10')
      .then((data: any) => setNewsList(Array.isArray(data.news) ? data.news : Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  async function loadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const data: any = await api.get(`/posts/feed?page=${nextPage}&limit=${PAGE_SIZE}`)
      const list: Post[] = Array.isArray(data.posts) ? data.posts : Array.isArray(data) ? data : []
      setPosts(prev => [...prev, ...list])
      setPage(nextPage)
      setHasMore(list.length === PAGE_SIZE)
    } catch {
      toast.error('Could not load more posts')
    } finally {
      setLoadingMore(false)
    }
  }

  function handleDelete(postId: string) {
    if (!window.confirm('Delete this post?')) return
    api.delete(`/posts/${postId}`)
      .then(() => setPosts(prev => prev.filter(p => p.id !== postId)))
      .catch(() => toast.error('Could not delete post'))
  }

  const feedItems = [
    ...posts.map(p => ({ kind: 'post' as const, data: p, sortKey: p.created_at })),
    ...newsList.map(n => ({ kind: 'news' as const, data: n, sortKey: n.created_at })),
  ].sort((a, b) => b.sortKey.localeCompare(a.sortKey))

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}</div>
  if (error) return (
    <div className="glass-card p-8 text-center space-y-3">
      <p className="text-red-500 font-medium">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="text-sm px-4 py-2 rounded-lg text-white hover:opacity-80 transition-opacity"
        style={gradientBtn}>Try again</button>
    </div>
  )

  return (
    <>
      {selectedNews && <NewsDetailModal item={selectedNews} onClose={() => setSelectedNews(null)} onReact={handleNewsReact} showFeedLink />}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">New post</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">X</button>
            </div>
            <CreatePost onCreated={(post) => { setPosts(prev => [post, ...prev]); setShowCreate(false) }} />
          </div>
        </div>
      )}

      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-40 w-14 h-14 rounded-full text-white shadow-lg hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
        style={gradientBtn}
        title="New post"
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      <div className="space-y-4">
        {feedItems.length === 0 && (
          <p className="text-gray-500 text-center py-8">Nothing to show yet. Follow colleagues to see their posts!</p>
        )}

        {feedItems.map(item => {
          if (item.kind === 'post') return <PostCard key={`post-${item.data.id}`} post={item.data} currentUserId={user?.id} onDeleted={handleDelete} />
          if (item.kind === 'news') return <NewsCard key={`news-${item.data.id}`} item={item.data} onOpen={() => setSelectedNews(item.data)} />
          return null
        })}

        {hasMore && (
          <div className="text-center py-2">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-sm px-4 py-2 rounded-lg text-white disabled:opacity-50 hover:opacity-80 transition-opacity"
              style={gradientBtn}
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
        {!hasMore && feedItems.length > 0 && (
          <p className="text-xs text-gray-300 text-center">You're all caught up</p>
        )}
      </div>
    </>
  )
}
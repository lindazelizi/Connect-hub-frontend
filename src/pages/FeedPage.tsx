import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import CreatePost from '../components/CreatePost'
import LikeButton from '../components/LikeButton'
import Comments from '../components/Comments'

type Post = {
  id: string
  content: string
  image_url: string | null
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
    company: string | null
  }
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get('/posts/feed')
      .then((data) => setPosts(data.posts ?? data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-500">Laddar flöde...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="space-y-4">
      <CreatePost onCreated={(post) => setPosts((prev) => [post, ...prev])} />
      {posts.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          Inget att visa ännu. Följ andra användare för att se deras inlägg.
        </p>
      )}
      {posts.map((post) => (
        <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm overflow-hidden">
              {post.author.avatar_url ? (
                <img src={post.author.avatar_url} alt={post.author.full_name} className="w-full h-full object-cover" />
              ) : (
                post.author.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <Link to={`/profile/${post.author.id}`} className="font-semibold text-gray-900 text-sm hover:underline">{post.author.full_name}</Link>
              {post.author.company && (
                <p className="text-xs text-gray-500">{post.author.company}</p>
              )}
            </div>
            <span className="ml-auto text-xs text-gray-400">
              {new Date(post.created_at).toLocaleDateString('sv-SE')}
            </span>
          </div>

          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>

          {post.image_url && (
            <img
              src={post.image_url}
              alt="Inläggsbild"
              className="mt-3 rounded-lg w-full object-cover max-h-80"
            />
          )}

          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4">
            <LikeButton postId={post.id} />
            <Comments postId={post.id} />
          </div>
        </article>
      ))}
    </div>
  )
}

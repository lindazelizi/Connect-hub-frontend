import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import FollowButton from '../components/FollowButton'

type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  company: string | null
  bio: string | null
  industry: string | null
}

type Post = {
  id: string
  content: string
  image_url: string | null
  created_at: string
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isOwnProfile = user?.id === id

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.get(`/profiles/${id}`),
      api.get(`/posts/user/${id}`),
    ])
      .then(([profileData, postsData]) => {
        setProfile(profileData.profile ?? profileData)
        setPosts(postsData.posts ?? postsData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-gray-500">Laddar profil...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!profile) return null

  return (
    <div>
      {/* Profilhuvud */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl flex-shrink-0 overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              profile.full_name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
            {profile.company && <p className="text-sm text-gray-500">{profile.company}</p>}
            {profile.industry && <p className="text-xs text-gray-400">{profile.industry}</p>}
            {profile.bio && <p className="text-sm text-gray-700 mt-2">{profile.bio}</p>}
          </div>

          <div className="flex-shrink-0">
            {isOwnProfile ? (
              <Link
                to="/profile/edit"
                className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Redigera profil
              </Link>
            ) : (
              <FollowButton userId={id!} />
            )}
          </div>
        </div>
      </div>

      {/* Inlägg */}
      <div className="space-y-4">
        {posts.length === 0 && (
          <p className="text-gray-500 text-center py-8">Inga inlägg ännu.</p>
        )}
        {posts.map((post) => (
          <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Inläggsbild"
                className="mt-3 rounded-lg w-full object-cover max-h-80"
              />
            )}
            <p className="text-xs text-gray-400 mt-2">
              {new Date(post.created_at).toLocaleDateString('sv-SE')}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

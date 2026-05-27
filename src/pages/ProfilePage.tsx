import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Profile, Post } from '../api/client'
import { Avatar, ProfileSkeleton, PostSkeleton } from '../components/ui'
import FollowButton from '../components/FollowButton'
import PostCard from '../components/post/PostCard'

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isOwnProfile = user?.id === id

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      api.get(`/profiles/${id}`),
      api.get(`/posts/user/${id}`),
      api.get(`/follows/${id}/followers`),
      api.get(`/follows/${id}/following`),
    ])
      .then(([profileData, postsData, followersData, followingData]) => {
        setProfile(profileData.profile ?? profileData)
        setPosts(postsData.posts ?? postsData)
        setCounts({
          followers: (followersData.followers ?? followersData).length,
          following: (followingData.following ?? followingData).length,
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  function handleDelete(postId: string) {
    if (!window.confirm('Delete this post?')) return
    api.delete(`/posts/${postId}`)
      .then(() => setPosts(prev => prev.filter(p => p.id !== postId)))
      .catch(() => toast.error('Could not delete post'))
  }

  if (loading) return <div className="space-y-4"><ProfileSkeleton />{Array.from({ length: 2 }).map((_, i) => <PostSkeleton key={i} />)}</div>
  if (error) return <p className="text-red-500">{error}</p>
  if (!profile) return null

  return (
    <div>
      <div className="glass-card p-6 mb-4">
        <div className="flex items-start gap-4">
          <Avatar user={profile} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
              {profile.role === 'admin' && (
                <span className="text-xs font-semibold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>
            {profile.company && <p className="text-sm text-gray-500">{profile.company}</p>}
            {profile.industry && <p className="text-xs text-gray-400">{profile.industry}</p>}
            {profile.bio && <p className="text-sm text-gray-700 mt-2">{profile.bio}</p>}
            <div className="flex gap-4 mt-3">
              <span className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{counts.followers}</span> followers</span>
              <span className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{counts.following}</span> following</span>
              <span className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{posts.length}</span> posts</span>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col gap-2">
            {isOwnProfile ? (
              <Link to="/profile/edit" className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-center">Edit profile</Link>
            ) : (
              <>
                <FollowButton userId={id!} />
                <button onClick={() => navigate(`/messages/${id}`)} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Send message</button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {posts.length === 0 && <p className="text-gray-500 text-center py-8">No posts yet</p>}
        {posts.map((post) => <PostCard key={post.id} post={post} showAuthor={false} currentUserId={user?.id} onDeleted={handleDelete} />)}
      </div>
    </div>
  )
}
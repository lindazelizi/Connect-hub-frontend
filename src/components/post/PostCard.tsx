import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrashIcon, ChatBubbleOvalLeftEllipsisIcon, UsersIcon } from '@heroicons/react/24/outline'
import type { Post } from '../../api/client'
import { Avatar } from '../ui'
import LikeButton from './LikeButton'
import Comments from './Comments'

type Props = {
  post: Post
  currentUserId?: string
  showAuthor?: boolean
  onDeleted?: (_id: string) => void
}

export default function PostCard({ post, currentUserId, showAuthor = true, onDeleted }: Props) {
  const isOwn = currentUserId === post.author.id
  const [commentsOpen, setCommentsOpen] = useState(false)

  const deleteButton = isOwn && onDeleted && (
    <button onClick={() => onDeleted(post.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="Delete post">
      <TrashIcon className="w-4 h-4" />
    </button>
  )

  const visibilityBadge = post.visibility === 'followers' && (
    <span className="flex items-center gap-1 text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
      <UsersIcon className="w-3 h-3" />
      Followers
    </span>
  )

  return (
    <article className="glass-card p-4">
      {showAuthor && (
        <div className="flex items-center gap-3 mb-3">
          <Avatar user={post.author} size="md" />
          <div>
            <Link to={`/profile/${post.author.id}`} className="font-semibold text-gray-900 text-sm hover:underline">
              {post.author.full_name}
            </Link>
            {post.author.company && <p className="text-xs text-gray-400">{post.author.company}</p>}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {visibilityBadge}
            <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('en-GB')}</span>
            {deleteButton}
          </div>
        </div>
      )}

      {!showAuthor && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {visibilityBadge}
            <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString('en-GB')}</p>
          </div>
          {deleteButton}
        </div>
      )}

      {showAuthor ? (
        <Link to={`/profile/${post.author.id}`} className="block hover:opacity-90 transition-opacity">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          {post.image_url && <img src={post.image_url} alt="Post image" className="mt-3 rounded-lg w-full object-cover max-h-80" />}
        </Link>
      ) : (
        <>
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          {post.image_url && <img src={post.image_url} alt="Post image" className="mt-3 rounded-lg w-full object-cover max-h-80" />}
        </>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
        <div className="flex items-center gap-4">
          <LikeButton postId={post.id} initialCount={post.likes_count ?? 0} />
          <button
            onClick={() => setCommentsOpen(o => !o)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-pink-500 transition-colors"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />Comments</button>
        </div>
        {commentsOpen && <Comments postId={post.id} />}
      </div>
    </article>
  )
}
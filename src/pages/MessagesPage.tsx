import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { UserStub } from '../api/client'
import { Avatar, ListItemSkeleton } from '../components/ui'
import { gradientBtn } from '../lib/utils'

type ConversationRow = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string; read: boolean; sender: UserStub; receiver: UserStub }
type ConversationItem = { user: UserStub; lastMessage: string; lastAt: string; hasUnread: boolean }

export default function MessagesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [following, setFollowing] = useState<UserStub[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get<ConversationRow[]>('/messages')
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.created_at.localeCompare(a.created_at))
        const seen = new Set<string>()
        const unique: ConversationItem[] = []
        for (const msg of sorted) {
          const partner = msg.sender_id === user?.id ? msg.receiver : msg.sender
          if (seen.has(partner.id)) continue
          seen.add(partner.id)
          unique.push({ user: partner, lastMessage: msg.content, lastAt: msg.created_at, hasUnread: msg.receiver_id === user?.id && !msg.read })
        }
        setConversations(unique)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id])

  function openNewMessage() {
    setShowNewMessage(true)
    setSearch('')
    if (following.length === 0 && user) {
      api.get<UserStub[]>(`/follows/${user.id}/following`)
        .then(setFollowing)
        .catch(() => {})
    }
  }

  const filtered = following.filter((f) =>
    f.full_name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <ListItemSkeleton key={i} />)}</div>

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Messages</h1>
          <button
            onClick={openNewMessage}
            className="text-white text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-opacity whitespace-nowrap"
            style={gradientBtn}>+ New Message</button>
        </div>

        {conversations.length === 0 && <p className="text-gray-500 text-center py-10 px-4">No conversations yet</p>}
        {conversations.map((c) => (
          <Link key={c.user.id} to={`/messages/${c.user.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
            <Avatar user={c.user} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{c.user.full_name}</p>
              {c.lastMessage && <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>}
            </div>
            {c.lastAt && <span className="text-xs text-gray-400 flex-shrink-0">{new Date(c.lastAt).toLocaleDateString('en-GB')}</span>}
            {c.hasUnread && <span className="w-2 h-2 rounded-full bg-pink-700 flex-shrink-0" />}
          </Link>
        ))}
      </div>

      {showNewMessage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setShowNewMessage(false)}>
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">New Message</h2>
              <button onClick={() => setShowNewMessage(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-2 border-b border-gray-100">
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm outline-none text-gray-800 placeholder-gray-400"
              />
            </div>

            <div className="overflow-y-auto max-h-72">
              {filtered.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">
                  {following.length === 0 ? "You're not following anyone yet" : 'No results'}
                </p>
              )}
              {filtered.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setShowNewMessage(false); navigate(`/messages/${f.id}`) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <Avatar user={f} size="md" />
                  <span className="text-sm font-medium text-gray-900">{f.full_name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
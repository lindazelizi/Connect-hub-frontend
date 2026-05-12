import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

type Conversation = {
  user: {
    id: string
    full_name: string
    avatar_url: string | null
    company: string | null
  }
  last_message: {
    content: string
    created_at: string
  } | null
  unread_count: number
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/messages')
      .then((data) => setConversations(data.conversations ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-500">Laddar meddelanden...</p>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      <h1 className="text-lg font-bold text-gray-900 px-4 py-3">Meddelanden</h1>

      {conversations.length === 0 && (
        <p className="text-gray-500 text-center py-10 px-4">Inga konversationer ännu.</p>
      )}

      {conversations.map((c) => (
        <Link
          key={c.user.id}
          to={`/messages/${c.user.id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0 overflow-hidden">
            {c.user.avatar_url ? (
              <img src={c.user.avatar_url} alt={c.user.full_name} className="w-full h-full object-cover" />
            ) : (
              c.user.full_name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{c.user.full_name}</p>
            {c.last_message && (
              <p className="text-xs text-gray-500 truncate">{c.last_message.content}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {c.last_message && (
              <span className="text-xs text-gray-400">
                {new Date(c.last_message.created_at).toLocaleDateString('sv-SE')}
              </span>
            )}
            {c.unread_count > 0 && (
              <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {c.unread_count}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

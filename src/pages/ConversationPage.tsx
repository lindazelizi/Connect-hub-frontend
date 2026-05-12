import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
}

type OtherUser = {
  id: string
  full_name: string
  avatar_url: string | null
}

export default function ConversationPage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return

    Promise.all([
      api.get(`/messages/${userId}`),
      api.get(`/profiles/${userId}`),
    ]).then(([msgData, profileData]) => {
      setMessages(msgData.messages ?? msgData)
      setOtherUser(profileData.profile ?? profileData)
    }).catch(() => {})
  }, [userId])

  // SSE för realtid
  useEffect(() => {
    if (!userId) return
    const token = localStorage.getItem('token')
    if (!token) return

    const url = `${import.meta.env.VITE_API_URL}/realtime/stream`
    const es = new EventSource(`${url}?token=${token}`)

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'new_message' && event.data?.sender_id === userId) {
          setMessages((prev) => [...prev, event.data])
        }
      } catch {
        //
      }
    }

    return () => es.close()
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !userId) return

    setSending(true)
    try {
      const data = await api.post(`/messages/${userId}`, { content: text })
      setMessages((prev) => [...prev, data.message ?? data])
      setText('')
    } catch {
      //
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <Link to="/messages" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        {otherUser && (
          <>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold overflow-hidden">
              {otherUser.avatar_url ? (
                <img src={otherUser.avatar_url} alt={otherUser.full_name} className="w-full h-full object-cover" />
              ) : (
                otherUser.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <Link to={`/profile/${otherUser.id}`} className="font-semibold text-gray-900 text-sm hover:underline">
              {otherUser.full_name}
            </Link>
          </>
        )}
      </div>

      {/* Meddelandelista */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((m) => {
          const isMine = m.sender_id === user?.id
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p>{m.content}</p>
                <p className={`text-xs mt-0.5 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(m.created_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Inmatningsfält */}
      <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t border-gray-100">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv ett meddelande..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Skicka
        </button>
      </form>
    </div>
  )
}

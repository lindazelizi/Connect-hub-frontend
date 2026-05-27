import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Message, Profile } from '../api/client'
import { Avatar } from '../components/ui'

export default function ConversationPage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userId) return
    Promise.all([api.get(`/messages/${userId}`), api.get(`/profiles/${userId}`)]).then(([msgData, profileData]) => {
      setMessages((msgData as any).messages ?? msgData as any)
      setOtherUser((profileData as any).profile ?? profileData as any)
    }).catch(() => {})
    api.patch(`/messages/${userId}/read`, {}).catch(() => {})
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const interval = setInterval(() => {
      api.get(`/messages/${userId}`)
        .then((data: any) => {
          setMessages(data.messages ?? data)
          api.patch(`/messages/${userId}/read`, {}).catch(() => {})
        })
        .catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [userId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function handleSend(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!text.trim() || !userId) return
    setSending(true)
    try {
      const data: any = await api.post(`/messages/${userId}`, { content: text })
      setMessages((prev) => [...prev, data.message ?? data])
      setText('')
    } catch {} finally { setSending(false) }
  }

  return (
    <div className="glass-card overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <Link to="/messages" className="text-gray-400 hover:text-gray-600">
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        {otherUser && (
          <>
            <Avatar user={otherUser} size="sm" />
            <Link to={`/profile/${otherUser.id}`} className="font-semibold text-gray-900 text-sm hover:underline">{otherUser.full_name}</Link>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((m) => {
          const isMine = m.sender_id === user?.id
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 text-sm ${isMine ? 'glass-bubble-mine' : 'glass-bubble-other'}`}>
                <p>{m.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-0.5 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                  <span className="text-xs">{new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMine && <span className="text-xs" title={m.read ? 'Read' : 'Sent'}>{m.read ? '✓✓' : '✓'}</span>}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t border-gray-100">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." className="glass-input rounded-full flex-1" style={{ width: 'auto' }} />
        <button type="submit" disabled={sending || !text.trim()} className="text-white px-4 py-2 rounded-full text-sm disabled:opacity-50 hover:opacity-80 transition-opacity" style={{ background: 'linear-gradient(to right, #f97316, #ec4899)' }}>Send</button>
      </form>
    </div>
  )
}
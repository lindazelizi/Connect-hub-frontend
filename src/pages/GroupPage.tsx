import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

type Group = {
  id: string
  name: string
  description: string | null
  member_count: number
}

type Member = {
  id: string
  full_name: string
  avatar_url: string | null
  company: string | null
}

type GroupMessage = {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

export default function GroupPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [isMember, setIsMember] = useState(false)
  const [tab, setTab] = useState<'chat' | 'members'>('chat')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [joining, setJoining] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/groups/${id}`),
      api.get(`/groups/${id}/members`),
      api.get(`/groups/${id}/messages`),
    ])
      .then(([groupData, membersData, messagesData]) => {
        const g = groupData.group ?? groupData
        const m = membersData.members ?? membersData
        setGroup(g)
        setMembers(m)
        setMessages(messagesData.messages ?? messagesData)
        setIsMember(m.some((mem: Member) => mem.id === user?.id))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, user?.id])

  // SSE för realtid
  useEffect(() => {
    if (!id) return
    const token = localStorage.getItem('token')
    if (!token) return

    const url = `${import.meta.env.VITE_API_URL}/realtime/stream`
    const es = new EventSource(`${url}?token=${token}`)

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'new_group_message' && event.data?.group_id === id) {
          setMessages((prev) => [...prev, event.data])
        }
      } catch {
        //
      }
    }

    return () => es.close()
  }, [id])

  useEffect(() => {
    if (tab === 'chat') bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, tab])

  async function toggleMembership() {
    if (!id) return
    setJoining(true)
    try {
      if (isMember) {
        await api.delete(`/groups/${id}/leave`)
        setIsMember(false)
        setMembers((prev) => prev.filter((m) => m.id !== user?.id))
      } else {
        await api.post(`/groups/${id}/join`, {})
        setIsMember(true)
      }
    } catch {
      //
    } finally {
      setJoining(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !id) return
    setSending(true)
    try {
      const data = await api.post(`/groups/${id}/messages`, { content: text })
      setMessages((prev) => [...prev, data.message ?? data])
      setText('')
    } catch {
      //
    } finally {
      setSending(false)
    }
  }

  if (loading) return <p className="text-gray-500">Laddar grupp...</p>
  if (!group) return <p className="text-red-500">Gruppen hittades inte.</p>

  return (
    <div className="space-y-4">
      {/* Grupphuvud */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl flex-shrink-0">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
            {group.description && <p className="text-sm text-gray-500 mt-1">{group.description}</p>}
            <p className="text-xs text-gray-400 mt-1">{members.length} medlemmar</p>
          </div>
          <button
            onClick={toggleMembership}
            disabled={joining}
            className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex-shrink-0 ${
              isMember
                ? 'border border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {joining ? '...' : isMember ? 'Lämna' : 'Gå med'}
          </button>
        </div>
      </div>

      {/* Flikar */}
      <div className="flex border-b border-gray-200">
        {(['chat', 'members'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'chat' ? 'Chatt' : 'Medlemmar'}
          </button>
        ))}
      </div>

      {/* Chatt */}
      {tab === 'chat' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ height: '420px' }}>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-gray-400 text-sm text-center pt-8">Inga meddelanden ännu.</p>
            )}
            {messages.map((m) => {
              const isMine = m.sender_id === user?.id
              return (
                <div key={m.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-semibold flex-shrink-0 overflow-hidden">
                    {m.sender.avatar_url ? (
                      <img src={m.sender.avatar_url} alt={m.sender.full_name} className="w-full h-full object-cover" />
                    ) : (
                      m.sender.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className={`max-w-xs ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMine && (
                      <Link to={`/profile/${m.sender.id}`} className="text-xs text-gray-500 font-medium mb-0.5 hover:underline">
                        {m.sender.full_name}
                      </Link>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      {m.content}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(m.created_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {isMember ? (
            <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 border-t border-gray-100">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Skriv ett meddelande..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Skicka
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-400 text-center py-3 border-t border-gray-100">
              Gå med i gruppen för att skicka meddelanden.
            </p>
          )}
        </div>
      )}

      {/* Medlemmar */}
      {tab === 'members' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {members.map((m) => (
            <Link
              key={m.id}
              to={`/profile/${m.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-semibold flex-shrink-0 overflow-hidden">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.full_name} className="w-full h-full object-cover" />
                ) : (
                  m.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{m.full_name}</p>
                {m.company && <p className="text-xs text-gray-500">{m.company}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Group, Member, GroupMessage } from '../api/client'
import { Avatar, ProfileSkeleton, ListItemSkeleton } from '../components/ui'
import { gradientBtn, fmtTime } from '../lib/utils'

type MemberWithRole = Member & { role: string }

function ChatView({ messages, isMember, userId, text, sending, setText, onSend, bottomRef }: {
  messages: GroupMessage[]; isMember: boolean; userId?: string; text: string; sending: boolean
  setText: (_t: string) => void; onSend: (_e: { preventDefault(): void }) => void; bottomRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="glass-card overflow-hidden flex flex-col" style={{ height: '420px' }}>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && <p className="text-gray-400 text-sm text-center pt-8">No messages yet.</p>}
        {messages.map((m) => {
          const isMine = m.sender_id === userId
          return (
            <div key={m.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
              <Avatar user={m.sender} size="sm" />
              <div className={`max-w-xs flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {!isMine && <Link to={`/profile/${m.sender.id}`} className="text-xs text-gray-500 font-medium mb-0.5 hover:underline">{m.sender.full_name}</Link>}
                <div className={`px-3 py-2 text-sm ${isMine ? 'glass-bubble-mine' : 'glass-bubble-other'}`}>{m.content}</div>
                <p className="text-xs text-gray-400 mt-0.5">{fmtTime(m.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      {isMember ? (
        <form onSubmit={onSend} className="flex gap-2 px-4 py-3 border-t border-gray-100">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." className="glass-input rounded-full flex-1" style={{ width: 'auto' }} />
          <button type="submit" disabled={sending || !text.trim()} className="text-white px-4 py-2 rounded-full text-sm disabled:opacity-50 hover:opacity-80 transition-opacity" style={gradientBtn}>Send</button>
        </form>
      ) : (
        <p className="text-xs text-gray-400 text-center py-3 border-t border-gray-100">Join the group to participate in the chat.</p>
      )}
    </div>
  )
}

function MemberList({ members, isAdmin, currentUserId, onKick }: { members: MemberWithRole[]; isAdmin: boolean; currentUserId?: string; onKick: (_id: string) => void }) {
  return (
    <div className="glass-card overflow-hidden">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
          <Link to={`/profile/${m.id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <Avatar user={m} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-gray-900">{m.full_name}</p>
                {m.role === 'admin' && <span className="text-xs bg-pink-100 text-pink-600 font-medium px-1.5 py-0.5 rounded-full">Admin</span>}
              </div>
              {m.company && <p className="text-xs text-gray-500">{m.company}</p>}
            </div>
          </Link>
          {isAdmin && m.id !== currentUserId && m.role !== 'admin' && (
            <button onClick={() => onKick(m.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 px-2 py-1 rounded border border-gray-200 hover:border-red-300">
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default function GroupPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<MemberWithRole[]>([])
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [isMember, setIsMember] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tab, setTab] = useState<'chat' | 'members'>('chat')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [joining, setJoining] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)

  useEffect(() => {
    if (!id) return
    Promise.all([api.get(`/groups/${id}`), api.get(`/groups/${id}/members`), api.get(`/groups/${id}/messages`)])
      .then(([groupData, membersData, messagesData]: any[]) => {
        const raw: { role: string; member: Member }[] = membersData.members ?? membersData
        const m: MemberWithRole[] = raw.map((item) => ({ ...item.member, role: item.role }))
        setGroup(groupData.group ?? groupData); setMembers(m); setMessages(messagesData.messages ?? messagesData)
        const myMembership = m.find((mem) => mem.id === user?.id)
        setIsMember(!!myMembership); setIsAdmin(myMembership?.role === 'admin')
      })
      .catch(() => toast.error('Could not load group'))
      .finally(() => setLoading(false))
  }, [id, user?.id])

  useEffect(() => {
    if (!id) return
    const interval = setInterval(() => {
      api.get(`/groups/${id}/messages`)
        .then((data: any) => setMessages(data.messages ?? data))
        .catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    if (tab === 'chat' && messages.length > prevMessageCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMessageCountRef.current = messages.length
  }, [messages, tab])

  async function toggleMembership() {
    if (!id) return
    setJoining(true)
    try {
      if (isMember) {
        await api.delete(`/groups/${id}/leave`)
        setIsMember(false); setIsAdmin(false)
        setMembers((prev) => prev.filter((m) => m.id !== user?.id))
      } else {
        await api.post(`/groups/${id}/join`, {})
        setIsMember(true); toast.success('Joined group!')
      }
    } catch { toast.error('Could not update membership') } finally { setJoining(false) }
  }

  async function handleKick(userId: string) {
    if (!id || !window.confirm('Remove this member?')) return
    try {
      await api.delete(`/groups/${id}/members/${userId}`)
      setMembers((prev) => prev.filter((m) => m.id !== userId))
    } catch { toast.error('Could not remove member') }
  }

  async function handleSend(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!text.trim() || !id) return
    setSending(true)
    try {
      const data: any = await api.post(`/groups/${id}/messages`, { content: text })
      setMessages((prev) => [...prev, data.message ?? data]); setText('')
    } catch { toast.error('Could not send message') } finally { setSending(false) }
  }

  if (loading) return <div className="space-y-2"><ProfileSkeleton />{Array.from({ length: 3 }).map((_, i) => <ListItemSkeleton key={i} />)}</div>
  if (!group) return <p className="text-red-500">Group not found.</p>

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <div className="flex items-start gap-4">
          {group.avatar_url ? (
            <img src={group.avatar_url} alt={group.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0" style={gradientBtn}>
              {group.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
            {group.description && <p className="text-sm text-gray-500 mt-1">{group.description}</p>}
            <p className="text-xs text-gray-400 mt-1">{members.length} members</p>
          </div>
          <button onClick={toggleMembership} disabled={joining} className={`text-sm px-4 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50 flex-shrink-0 ${isMember ? 'border border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500' : 'text-white hover:opacity-80'}`} style={isMember ? {} : gradientBtn}>
            {joining ? '...' : isMember ? 'Leave' : 'Join'}
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        {(['chat', 'members'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t ? 'border-b-2 border-pink-700 text-pink-700' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'chat' ? 'Chat' : `Members (${members.length})`}</button>
        ))}
      </div>

      {tab === 'chat' && <ChatView messages={messages} isMember={isMember} userId={user?.id} text={text} sending={sending} setText={setText} onSend={handleSend} bottomRef={bottomRef} />}
      {tab === 'members' && <MemberList members={members} isAdmin={isAdmin} currentUserId={user?.id} onKick={handleKick} />}
    </div>
  )
}
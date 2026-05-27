import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { Notification } from '../api/client'
import { Avatar, ListItemSkeleton } from '../components/ui'

function notificationText(type: string): string {
  switch (type) {
    case 'follow': return 'started following you'
    case 'like_post': return 'liked your post'
    case 'like_comment': return 'liked your comment'
    case 'comment': return 'commented on your post'
    case 'message': return 'sent you a message'
    default: return 'interacted with you'
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/notifications')
      .then((data: any) => setNotifications(data.notifications ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleClick(n: Notification) {
    if (!n.read) {
      api.patch(`/notifications/${n.id}/read`, {}).catch(() => {})
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    }
    if (n.type === 'message') navigate('/messages')
  }

  if (loading) return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <ListItemSkeleton key={i} />)}</div>

  return (
    <div className="glass-card overflow-hidden">
      <h1 className="text-lg font-bold text-gray-900 px-4 py-3 border-b border-gray-100">Notifications</h1>
      {notifications.length === 0 && <p className="text-gray-500 text-center py-10 px-4">No notifications yet.</p>}
      {notifications.map((n) => (
        <div key={n.id} onClick={() => handleClick(n)} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50">
          {n.actor ? <Avatar user={n.actor} size="md" /> : <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            {n.actor ? (
              <p className="text-sm text-gray-800">
                <Link to={`/profile/${n.actor.id}`} className="font-semibold hover:underline" onClick={e => e.stopPropagation()}>{n.actor.full_name}</Link>{' '}{notificationText(n.type)}
              </p>
            ) : (
              <p className="text-sm text-gray-800">{notificationText(n.type)}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">{new Date(n.created_at).toLocaleDateString('en-GB')}</p>
          </div>
          {!n.read && <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0" />}
        </div>
      ))}
    </div>
  )
}
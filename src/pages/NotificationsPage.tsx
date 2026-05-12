import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

type Notification = {
  id: string
  type: string
  read: boolean
  created_at: string
  actor: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

function notificationText(type: string): string {
  switch (type) {
    case 'follow': return 'började följa dig'
    case 'like_post': return 'gillade ditt inlägg'
    case 'like_comment': return 'gillade din kommentar'
    case 'comment': return 'kommenterade ditt inlägg'
    default: return 'interagerade med dig'
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications')
      .then((data) => setNotifications(data.notifications ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))

    api.patch('/notifications/read-all', {}).catch(() => {})
  }, [])

  if (loading) return <p className="text-gray-500">Laddar notifikationer...</p>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
      <h1 className="text-lg font-bold text-gray-900 px-4 py-3">Notifikationer</h1>

      {notifications.length === 0 && (
        <p className="text-gray-500 text-center py-10 px-4">Inga notifikationer ännu.</p>
      )}

      {notifications.map((n) => (
        <div key={n.id} className={`flex items-center gap-3 px-4 py-3 ${!n.read ? 'bg-blue-50' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold flex-shrink-0 overflow-hidden">
            {n.actor?.avatar_url ? (
              <img src={n.actor.avatar_url} alt={n.actor.full_name} className="w-full h-full object-cover" />
            ) : (
              n.actor?.full_name.charAt(0).toUpperCase() ?? '?'
            )}
          </div>

          <div className="flex-1 min-w-0">
            {n.actor ? (
              <p className="text-sm text-gray-800">
                <Link to={`/profile/${n.actor.id}`} className="font-semibold hover:underline">
                  {n.actor.full_name}
                </Link>{' '}
                {notificationText(n.type)}
              </p>
            ) : (
              <p className="text-sm text-gray-800">{notificationText(n.type)}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(n.created_at).toLocaleDateString('sv-SE')}
            </p>
          </div>

          {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
        </div>
      ))}
    </div>
  )
}

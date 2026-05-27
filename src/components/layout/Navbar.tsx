import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { HomeIcon, MagnifyingGlassIcon, EnvelopeIcon, NewspaperIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/client'
import NotificationBell from '../NotificationBell'
import { Avatar } from '../ui'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/search', label: 'Search', icon: MagnifyingGlassIcon },
  { to: '/messages', label: 'Messages', icon: EnvelopeIcon },
  { to: '/news', label: 'News', icon: NewspaperIcon },
  { to: '/groups', label: 'Groups', icon: UserGroupIcon },
]

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (!user) return
    function fetchUnread() {
      api.get('/messages/unread-count')
        .then((data) => setUnreadMessages((data as { count?: number }).count ?? 0))
        .catch(() => {})
    }
    fetchUnread()
    const id = setInterval(fetchUnread, 30000)
    return () => clearInterval(id)
  }, [user])

  useEffect(() => {
    if (location.pathname.startsWith('/messages')) setUnreadMessages(0)
  }, [location.pathname])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      <nav className="glass-nav px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold" style={{ background: 'linear-gradient(to right, #f97316, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ConnectHub</Link>

        <div className="hidden sm:flex items-center gap-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative transition-colors ${isActive ? 'text-pink-500' : 'text-gray-400 hover:text-gray-700'}`
              }
              title={item.label}
            >
              <item.icon className="w-5 h-5" strokeWidth={2} />
              {item.to === '/messages' && unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </NavLink>
          ))}
          <NotificationBell />
          {user && (
            <Link to={`/profile/${user.id}`} className="text-sm text-gray-700 hover:text-pink-500 transition-colors font-medium">
              {profile?.full_name}
            </Link>
          )}
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition-colors">Log out</button>
        </div>

        <div className="flex sm:hidden items-center gap-3">
          <NotificationBell />
          {user && profile && (
            <Link to={`/profile/${user.id}`}>
              <Avatar user={profile} size="sm" />
            </Link>
          )}
        </div>
      </nav>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 glass-bottom-nav flex z-50">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 text-xs gap-0.5 transition-colors ${
                isActive ? 'text-pink-500' : 'text-gray-400'
              }`
            }
          >
            <span className="relative">
              <item.icon className="w-5 h-5" strokeWidth={2} />
              {item.to === '/messages' && unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {unreadMessages > 9 ? '9+' : unreadMessages}</span>
              )}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sm:hidden h-16" />
    </>
  )
}
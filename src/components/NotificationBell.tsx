import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { BellIcon } from '@heroicons/react/24/outline'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function NotificationBell() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  const location = useLocation()

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then((data: any) => setCount(data.count ?? 0))
      .catch(() => {})
  }, [location.pathname])

  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      api.get('/notifications/unread-count')
        .then((data: any) => setCount(data.count ?? 0))
        .catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <NavLink to="/notifications" className={({ isActive }) => `relative transition-colors ${isActive ? 'text-pink-700' : 'text-gray-400 hover:text-gray-900'}`}>
      <BellIcon className="w-5 h-5" strokeWidth={2} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {count > 9 ? '9+' : count}</span>
      )}
    </NavLink>
  )
}
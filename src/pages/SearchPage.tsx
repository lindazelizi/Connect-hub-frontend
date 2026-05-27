import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Profile } from '../api/client'
import { Avatar, ListItemSkeleton } from '../components/ui'
import FollowButton from '../components/FollowButton'

export default function SearchPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return }
    const timer = setTimeout(() => {
      setLoading(true)
      api.get(`/profiles?search=${encodeURIComponent(query)}`)
        .then((data) => { setResults(data.profiles ?? data); setSearched(true) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 shrink-0" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for users..." autoFocus className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
      </div>

      {loading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <ListItemSkeleton key={i} />)}</div>}
      {searched && !loading && results.length === 0 && <p className="text-gray-500 text-center py-8">No users found for "{query}".</p>}

      <div className="space-y-2">
        {results.map((p) => (
          <div key={p.id} className="flex items-center gap-3 glass-card px-4 py-3">
            <Link to={`/profile/${p.id}`} className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar user={p} size="md" />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{p.full_name}</p>
                {p.company && <p className="text-xs text-gray-500 truncate">{p.company}</p>}
                {p.industry && <p className="text-xs text-gray-400 truncate">{p.industry}</p>}
              </div>
            </Link>
            {p.id !== user?.id && <FollowButton userId={p.id} />}
          </div>
        ))}
      </div>
    </div>
  )
}
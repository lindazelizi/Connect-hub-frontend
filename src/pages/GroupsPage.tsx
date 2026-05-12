import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

type Group = {
  id: string
  name: string
  description: string | null
  member_count: number
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    const q = search.trim() ? `?search=${encodeURIComponent(search)}` : ''
    api.get(`/groups${q}`)
      .then((data) => setGroups(data.groups ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const data = await api.post('/groups', { name: newName, description: newDesc || null })
      setGroups((prev) => [data.group ?? data, ...prev])
      setNewName('')
      setNewDesc('')
      setShowForm(false)
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Något gick fel')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök grupper..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + Ny grupp
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Skapa grupp</h2>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Gruppnamn"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Beskrivning (valfritt)"
            rows={2}
            className="w-full resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {createError && <p className="text-red-500 text-sm">{createError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Skapar...' : 'Skapa'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Avbryt
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Laddar grupper...</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Inga grupper hittades.</p>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <Link
              key={g.id}
              to={`/groups/${g.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                {g.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{g.name}</p>
                {g.description && (
                  <p className="text-xs text-gray-500 truncate">{g.description}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{g.member_count} medlemmar</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

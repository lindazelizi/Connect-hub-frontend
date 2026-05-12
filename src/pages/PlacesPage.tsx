import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

type Place = {
  id: string
  name: string
  category: string | null
  description: string | null
  address: string | null
  avg_rating: number | null
  review_count: number
}

const CATEGORIES = ['Restaurant', 'Café', 'Bar', 'Hotel', 'Aktivitet', 'Butik', 'Övrigt']

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
        </svg>
      ))}
    </span>
  )
}

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: '', description: '', address: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search)
    if (category) params.set('category', category)
    const q = params.toString() ? `?${params}` : ''
    api.get(`/places${q}`)
      .then((data) => setPlaces(data.places ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, category])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const data = await api.post('/places', {
        name: form.name,
        category: form.category || null,
        description: form.description || null,
        address: form.address || null,
      })
      setPlaces((prev) => [data.place ?? data, ...prev])
      setForm({ name: '', category: '', description: '', address: '' })
      setShowForm(false)
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Något gick fel')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Sök + filter + ny knapp */}
      <div className="flex gap-2 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sök platser..."
          className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        >
          <option value="">Alla kategorier</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + Ny plats
        </button>
      </div>

      {/* Skapa-formulär */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Lägg till plats</h2>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Namn *"
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="">Välj kategori</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Adress (valfritt)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              {creating ? 'Sparar...' : 'Spara'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
              Avbryt
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-gray-500">Laddar platser...</p>
      ) : places.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Inga platser hittades.</p>
      ) : (
        <div className="space-y-2">
          {places.map((p) => (
            <Link
              key={p.id}
              to={`/places/${p.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {p.category && <span className="text-xs text-gray-400">{p.category}</span>}
                  {p.address && <span className="text-xs text-gray-400 truncate">{p.address}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {p.avg_rating !== null && <StarRating rating={p.avg_rating} />}
                <span className="text-xs text-gray-400">{p.review_count} rec.</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

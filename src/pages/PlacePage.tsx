import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

type Place = {
  id: string
  name: string
  category: string | null
  description: string | null
  address: string | null
  avg_rating: number | null
  review_count: number
}

type Review = {
  id: string
  rating: number
  comment: string | null
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

function Stars({ value, onClick }: { value: number; onClick?: (n: number) => void }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          onClick={() => onClick?.(s)}
          className={`w-5 h-5 ${onClick ? 'cursor-pointer' : ''} ${s <= value ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
        </svg>
      ))}
    </span>
  )
}

export default function PlacePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [place, setPlace] = useState<Place | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const myReview = reviews.find((r) => r.author.id === user?.id)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.get(`/places/${id}`),
      api.get(`/places/${id}/reviews`),
    ])
      .then(([placeData, reviewData]) => {
        const p = placeData.place ?? placeData
        const r = reviewData.reviews ?? reviewData
        setPlace(p)
        setReviews(r)
        const mine = r.find((rev: Review) => rev.author.id === user?.id)
        if (mine) {
          setRating(mine.rating)
          setComment(mine.comment ?? '')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, user?.id])

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!id || rating === 0) return
    setSubmitting(true)
    setReviewError(null)
    try {
      const data = await api.post(`/places/${id}/reviews`, { rating, comment: comment || null })
      const saved = data.review ?? data
      setReviews((prev) =>
        myReview
          ? prev.map((r) => (r.id === myReview.id ? saved : r))
          : [saved, ...prev]
      )
      setPlace((p) => p ? { ...p, review_count: myReview ? p.review_count : p.review_count + 1 } : p)
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Något gick fel')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!id) return
    try {
      await api.delete(`/places/${id}/reviews/${reviewId}`)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setRating(0)
      setComment('')
    } catch {
      //
    }
  }

  if (loading) return <p className="text-gray-500">Laddar plats...</p>
  if (!place) return <p className="text-red-500">Platsen hittades inte.</p>

  return (
    <div className="space-y-4">
      {/* Platshuvud */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{place.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {place.category && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{place.category}</span>
              )}
              {place.address && <span className="text-xs text-gray-500">{place.address}</span>}
            </div>
            {place.description && <p className="text-sm text-gray-600 mt-2">{place.description}</p>}
          </div>
          {place.avg_rating !== null && (
            <div className="flex flex-col items-end flex-shrink-0">
              <Stars value={Math.round(place.avg_rating)} />
              <span className="text-xs text-gray-400 mt-0.5">{place.review_count} recensioner</span>
            </div>
          )}
        </div>
      </div>

      {/* Lämna recension */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h2 className="font-semibold text-gray-900 mb-3">
          {myReview ? 'Din recension' : 'Lämna en recension'}
        </h2>
        <form onSubmit={handleReview} className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Betyg</p>
            <Stars value={rating} onClick={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Kommentar (valfritt)"
            rows={3}
            className="w-full resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Sparar...' : myReview ? 'Uppdatera' : 'Skicka'}
            </button>
            {myReview && (
              <button
                type="button"
                onClick={() => handleDeleteReview(myReview.id)}
                className="text-sm text-red-500 hover:text-red-700 px-3 py-2"
              >
                Ta bort
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Alla recensioner */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        <h2 className="font-semibold text-gray-900 px-4 py-3">Recensioner</h2>
        {reviews.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-8 px-4">Inga recensioner ännu.</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="px-4 py-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-semibold flex-shrink-0 overflow-hidden">
                {r.author.avatar_url ? (
                  <img src={r.author.avatar_url} alt={r.author.full_name} className="w-full h-full object-cover" />
                ) : (
                  r.author.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <Link to={`/profile/${r.author.id}`} className="text-sm font-semibold text-gray-900 hover:underline">
                  {r.author.full_name}
                </Link>
                <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('sv-SE')}</p>
              </div>
              <div className="ml-auto">
                <Stars value={r.rating} />
              </div>
            </div>
            {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

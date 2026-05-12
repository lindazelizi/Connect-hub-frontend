import { useState } from 'react'
import { api } from '../api/client'

type Post = {
  id: string
  content: string
  image_url: string | null
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
    company: string | null
  }
}

type Props = {
  onCreated: (post: Post) => void
}

export default function CreatePost({ onCreated }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/posts', { content })
      onCreated(data.post ?? data)
      setContent('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Något gick fel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Vad tänker du på?"
        rows={3}
        className="w-full resize-none border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Publicerar...' : 'Publicera'}
        </button>
      </div>
    </form>
  )
}

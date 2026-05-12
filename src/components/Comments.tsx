import { useEffect, useState } from 'react'
import { api } from '../api/client'

type Comment = {
  id: string
  content: string
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

type Props = {
  postId: string
}

export default function Comments({ postId }: Props) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.get(`/posts/${postId}/comments`)
      .then((data) => setComments(data.comments ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, postId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const data = await api.post(`/posts/${postId}/comments`, { content: text })
      setComments((prev) => [...prev, data.comment ?? data])
      setText('')
    } catch {
      //
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
        Kommentarer {comments.length > 0 && `(${comments.length})`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loading && <p className="text-xs text-gray-400">Laddar kommentarer...</p>}

          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold flex-shrink-0 overflow-hidden">
                {c.author.avatar_url ? (
                  <img src={c.author.avatar_url} alt={c.author.full_name} className="w-full h-full object-cover" />
                ) : (
                  c.author.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-gray-700">{c.author.full_name}</p>
                <p className="text-sm text-gray-800">{c.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Skriv en kommentar..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Skicka
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { XMarkIcon, PhotoIcon, GlobeAltIcon, UsersIcon } from '@heroicons/react/24/outline'
import { api } from '../../api/client'
import type { Post } from '../../api/client'
import { useImageUpload } from '../../hooks'

export default function CreatePost({ onCreated }: { onCreated: (_post: Post) => void }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { url: imageUrl, preview: imagePreview, uploading, handleFileChange, reset: resetImage } = useImageUpload()

  function removeImage() {
    resetImage()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.post('/posts', { content, image_url: imageUrl, visibility })
      onCreated(data.post ?? data)
      setContent('')
      resetImage()
      setVisibility('public')
      toast.success('Post published!')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What are you thinking?"
        rows={3}
        className="glass-input resize-none"
      />

      {imagePreview && (
        <div className="relative mt-2 inline-block">
          <img src={imagePreview} alt="preview" className="rounded-lg max-h-48 object-cover" />
          <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70">
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setVisibility('public')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-all ${visibility === 'public' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <GlobeAltIcon className="w-3.5 h-3.5" />
          Everyone
        </button>
        <button
          type="button"
          onClick={() => setVisibility('followers')}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-all ${visibility === 'followers' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <UsersIcon className="w-3.5 h-3.5" />My followers</button>
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      <div className="flex items-center justify-between mt-2">
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-pink-700 disabled:opacity-50 transition-colors">
          <PhotoIcon className="w-4 h-4" />
          {uploading ? 'Uploading..' : 'Add image'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <button type="submit" disabled={loading || uploading || !content.trim()} className="text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity" style={{ background: '#be185d' }}>
          {loading ? 'Publishing..' : 'Publish'}
        </button>
      </div>
    </form>
  )
}
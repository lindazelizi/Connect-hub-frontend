import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CameraIcon } from '@heroicons/react/24/outline'
import { api } from '../api/client'
import type { Group } from '../api/client'
import { ListItemSkeleton } from '../components/ui'
import { useImageUpload } from '../hooks'
import { gradientBtn } from '../lib/utils'

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { url: imageUrl, preview: imagePreview, uploading, handleFileChange, reset: resetImage } = useImageUpload()

  useEffect(() => {
    setLoading(true)
    api.get('/groups')
      .then((data: any) => setGroups(data.groups ?? data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const data = await api.post('/groups', { name: newName, description: newDesc || null, avatar_url: imageUrl || null })
      setGroups((prev) => [data.group ?? data, ...prev])
      setNewName(''); setNewDesc(''); resetImage(); setShowForm(false)
      toast.success('Group created!')
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setCreating(false) }
  }

  const list = groups

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="text-white text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-opacity whitespace-nowrap" style={gradientBtn}>+ New Group</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Create Group</h2>
          <div className="flex items-center gap-3">
            <div onClick={() => fileInputRef.current?.click()} className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden flex-shrink-0">
              {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : (
                <CameraIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-400">{uploading ? 'Uploading...' : 'Click to add group image'}</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Group name *" required className="glass-input" />
          <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={2} className="glass-input resize-none" />
          {createError && <p className="text-red-500 text-sm">{createError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={creating || uploading} className="text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 hover:opacity-80 transition-opacity" style={gradientBtn}>
              {creating ? 'Creating...' : 'Create Group'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <ListItemSkeleton key={i} />)}</div>
      ) : list.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No groups found.</p>
      ) : (
        <div className="space-y-2">
          {list.map((g) => (
            <Link key={g.id} to={`/groups/${g.id}`} className="flex items-center gap-4 glass-card px-4 py-3 hover:bg-gray-50 transition-colors">
              {g.avatar_url ? (
                <img src={g.avatar_url} alt={g.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={gradientBtn}>
                  {g.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{g.name}</p>
                {g.description && <p className="text-xs text-gray-500 truncate">{g.description}</p>}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{g.member_count} members</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '../api/client'

export function useImageUpload(initialUrl: string | null = null) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [preview, setPreview] = useState<string | null>(initialUrl)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const uploaded = await api.upload(file)
      setUrl(uploaded)
    } catch {
      setPreview(initialUrl)
      setUrl(initialUrl)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  function reset() {
    setUrl(null)
    setPreview(null)
  }

  return { url, preview, uploading, handleFileChange, reset }
}
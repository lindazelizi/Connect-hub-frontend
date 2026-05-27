const BASE_URL = import.meta.env.VITE_API_URL

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'))
    throw new Error('Not logged in')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
  return data
}

export type UserStub = {
  id: string
  full_name: string
  avatar_url: string | null
}

export type Profile = {
  id: string
  full_name: string
  avatar_url: string | null
  company: string | null
  bio: string | null
  industry: string | null
  role?: string
}

export type Post = {
  id: string
  content: string
  image_url: string | null
  created_at: string
  visibility: 'public' | 'followers'
  author: UserStub & { company: string | null }
  likes_count?: number
}

export type Comment = {
  id: string
  content: string
  created_at: string
  author: UserStub
}

export type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  read: boolean
}

export type Group = {
  id: string
  name: string
  description: string | null
  member_count: number
  avatar_url: string | null
  created_by: string | null
}

export type Member = UserStub & { company: string | null; role?: string }

export type GroupMessage = {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: UserStub
}

export type Notification = {
  id: string
  type: string
  read: boolean
  created_at: string
  actor: UserStub | null
}

export type NewsPost = {
  id: string
  title: string
  content: string
  category: string | null
  image_url: string | null
  created_at: string
  author: (UserStub & { company?: string | null }) | null
  likes_count: number
  dislikes_count: number
  comments_count: number
  user_reaction: 'like' | 'dislike' | null
}

export type NewsComment = {
  id: string
  news_id: string
  content: string
  created_at: string
  user_id: string
  author: UserStub
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),
  post: <T = any>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T = any>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${BASE_URL}/storage/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Upload failed')
    return data.url
  },
}

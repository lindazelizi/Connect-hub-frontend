import { Component, type ReactNode } from 'react'
import type { UserStub } from '../../api/client'

const AVATAR_SIZE = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-2xl',
}

type AvatarProps = {
  user: Pick<UserStub, 'full_name' | 'avatar_url'>
  size?: keyof typeof AVATAR_SIZE
  className?: string
}

export function Avatar({ user, size = 'md', className = '' }: AvatarProps) {
  return (
    <div className={`rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0 overflow-hidden ${AVATAR_SIZE[size]} ${className}`}>
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
      ) : (
        (user.full_name ?? '?').charAt(0).toUpperCase()
      )}
    </div>
  )
}

type BoundaryProps = { children: ReactNode }
type BoundaryState = { hasError: boolean }

export class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center space-y-3">
            <p className="text-xl font-semibold text-gray-900">Something went wrong</p>
            <p className="text-sm text-gray-500">Try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">Refresh</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`glass-skeleton ${className ?? ''}`} />
}

export function PostSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <SkeletonBox className="h-3 w-32" />
          <SkeletonBox className="h-2.5 w-20" />
        </div>
      </div>
      <SkeletonBox className="h-3 w-full" />
      <SkeletonBox className="h-3 w-4/5" />
      <SkeletonBox className="h-3 w-2/3" />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start gap-4">
        <SkeletonBox className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-4 w-40" />
          <SkeletonBox className="h-3 w-28" />
          <SkeletonBox className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 glass-card px-4 py-3">
      <SkeletonBox className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBox className="h-3 w-36" />
        <SkeletonBox className="h-2.5 w-24" />
      </div>
    </div>
  )
}
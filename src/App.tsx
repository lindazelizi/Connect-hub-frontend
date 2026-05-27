import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuth } from './context/AuthContext'
import { ErrorBoundary } from './components/ui'
import Navbar from './components/layout/Navbar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { ForgotPasswordPage, ResetPasswordPage } from './pages/PasswordResetPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import MessagesPage from './pages/MessagesPage'
import ConversationPage from './pages/ConversationPage'
import GroupsPage from './pages/GroupsPage'
import GroupPage from './pages/GroupPage'
import SearchPage from './pages/SearchPage'
import NewsPage from './pages/NewsPage'

function PrivateRoute() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 animate-spin" style={{ borderTopColor: '#f97316' }} />
    </div>
  )
  if (!user) return <Navigate to="/login" />
  return (
    <div className="page-gradient">
      <Navbar />
      <main className="max-w-2xl mx-auto py-6 px-4">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
    <Toaster position="top-right" richColors />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<FeedPage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:userId" element={<ConversationPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:id" element={<GroupPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/news" element={<NewsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { onMessage } from '@/lib/firebase'


// Layout
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import RoleRoute from '@/components/layout/RoleRoute'

// Pages
import HomePage from '@/pages/HomePage'
import EventsPage from '@/pages/EventsPage'
import EventDetailPage from '@/pages/EventDetailPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import MyTicketsPage from '@/pages/MyTicketsPage'
import ProfilePage from '@/pages/ProfilePage'
import NotificationsPage from '@/pages/NotificationsPage'

// Organizer
import OrganizerEventsPage from '@/pages/organizer/OrganizerEventsPage'
import OrganizerCreatePage from '@/pages/organizer/OrganizerCreatePage'
import OrganizerEditPage from '@/pages/organizer/OrganizerEditPage'
import OrganizerCheckinPage from '@/pages/organizer/OrganizerCheckinPage'
import OrganizerAttendeesPage from '@/pages/organizer/OrganizerAttendeesPage'

// Admin
import AdminEventsPage from '@/pages/admin/AdminEventsPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminNotificationsPage from '@/pages/admin/AdminNotificationsPage'

export default function App() {
  const { setUser, setLoading, fetchProfile, initFCM } = useAuthStore()
  const { init, dark } = useThemeStore()

  useEffect(() => {
    init(dark)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id).then(() => {
          initFCM()
        })
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // FCM foreground messages
    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'font-body text-sm',
          style: {
            background: dark ? '#1e1e28' : '#fff',
            color: dark ? '#f1f5f9' : '#111',
            border: dark ? '1px solid #2e2e3e' : '1px solid #e5e7eb',
          },
          duration: 3500,
        }}
      />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/my-tickets" element={<MyTicketsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            <Route element={<RoleRoute roles={['organizer', 'admin']} />}>
              <Route path="/organizer/events" element={<OrganizerEventsPage />} />
              <Route path="/organizer/events/create" element={<OrganizerCreatePage />} />
              <Route path="/organizer/events/:id/edit" element={<OrganizerEditPage />} />
              <Route path="/organizer/events/:id/checkin" element={<OrganizerCheckinPage />} />
              <Route path="/organizer/events/:id/attendees" element={<OrganizerAttendeesPage />} />
            </Route>

            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/admin/events" element={<AdminEventsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

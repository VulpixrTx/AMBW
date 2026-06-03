import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'

export default function ProtectedRoute() {
  const { user, loading } = useAuthStore()
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

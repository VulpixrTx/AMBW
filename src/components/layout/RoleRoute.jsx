import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function RoleRoute({ roles }) {
  const { profile } = useAuthStore()
  if (!profile) return <Navigate to="/" replace />
  return roles.includes(profile.role) ? <Outlet /> : <Navigate to="/" replace />
}

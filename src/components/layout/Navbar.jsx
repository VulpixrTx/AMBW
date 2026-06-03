import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, Bell, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Berhasil keluar')
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-surface-0/80 backdrop-blur-lg border-b border-gray-100 dark:border-surface-2">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-xl text-brand-500 tracking-tight">
          Event<span className="text-gray-900 dark:text-white">In</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/events" className="btn-ghost text-sm px-3 py-1.5">Jelajahi</Link>
          {user && profile?.role !== 'peserta' && (
            <Link to="/organizer/events" className="btn-ghost text-sm px-3 py-1.5 gap-1.5 flex items-center">
              <LayoutDashboard size={14} /> Dashboard
            </Link>
          )}
          {user && profile?.role === 'admin' && (
            <Link to="/admin/events" className="btn-ghost text-sm px-3 py-1.5">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="btn-ghost p-2 rounded-xl">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              <Link to="/notifications" className="btn-ghost p-2 rounded-xl">
                <Bell size={18} />
              </Link>
              <Link to="/profile" className="btn-ghost p-2 rounded-xl">
                <User size={18} />
              </Link>
              <button onClick={handleSignOut} className="btn-ghost p-2 rounded-xl text-red-500">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm px-4 py-2">Masuk</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
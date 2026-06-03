import { NavLink } from 'react-router-dom'
import { Home, Search, Ticket, Bell, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/events', icon: Search, label: 'Explore' },
  { to: '/my-tickets', icon: Ticket, label: 'Tiket', auth: true },
  { to: '/notifications', icon: Bell, label: 'Notif', auth: true },
  { to: '/profile', icon: User, label: 'Profil', auth: true },
]

export default function BottomNav() {
  const { user } = useAuthStore()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-surface-1/90 backdrop-blur-lg border-t border-gray-100 dark:border-surface-2 safe-area-pb">
      <div className="flex">
        {navItems.filter(i => !i.auth || user).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-body transition-colors ${
                isActive
                  ? 'text-brand-500'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
        {!user && (
          <NavLink
            to="/login"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-body text-brand-500"
          >
            <User size={20} strokeWidth={1.8} />
            Masuk
          </NavLink>
        )}
      </div>
    </nav>
  )
}

import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setNotifs(data || [])
      setLoading(false)
      // Mark all as read
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    }
    fetch()
  }, [user])

  const TYPE_ICONS = { registration: '🎫', reminder: '⏰', update: '📢', info: '💬' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="section-title flex items-center gap-2">
        <Bell size={24} className="text-brand-500" /> Notifikasi
      </h1>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-20 text-gray-400 space-y-3">
          <Bell size={48} className="mx-auto opacity-30" />
          <p>Belum ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} className={`card p-4 flex gap-3 transition-opacity ${n.read ? 'opacity-70' : 'border-brand-500/30'}`}>
              <span className="text-2xl shrink-0">{TYPE_ICONS[n.type] || '💬'}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{n.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{n.body}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: id })}
                </p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

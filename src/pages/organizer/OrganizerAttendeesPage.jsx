import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Users, CheckCircle2, Clock, Search } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import Spinner from '@/components/ui/Spinner'

export default function OrganizerAttendeesPage() {
  const { id: eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data: ev } = await supabase.from('events').select('title, max_capacity').eq('id', eventId).single()
      setEvent(ev)
      const { data } = await supabase
        .from('registrations')
        .select('*, users(name, email, avatar_url)')
        .eq('event_id', eventId)
        .neq('status', 'cancelled')
        .order('registered_at', { ascending: true })
      setAttendees(data || [])
      setLoading(false)
    }
    fetch()
  }, [eventId])

  const filtered = attendees.filter(a =>
    !search || a.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.users?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const checkedIn = attendees.filter(a => a.status === 'checked_in').length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="section-title">Daftar Peserta</h1>
        {event && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.title}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Terdaftar', value: attendees.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Check-in', value: checkedIn, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Belum Hadir', value: attendees.length - checkedIn, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-3 text-center space-y-1">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mx-auto`}>
              <Icon size={16} className={color} />
            </div>
            <p className="font-display font-bold text-xl text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9 text-sm" placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Tidak ada peserta ditemukan.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a, i) => (
            <div key={a.id} className="card p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-500 shrink-0">
                {a.users?.avatar_url
                  ? <img src={a.users.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  : (i + 1)
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.users?.name || 'N/A'}</p>
                <p className="text-xs text-gray-400 truncate">{a.users?.email}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={a.status === 'checked_in' ? 'badge-green' : 'badge-yellow'}>
                  {a.status === 'checked_in' ? '✓ Hadir' : 'Belum'}
                </span>
                {a.checked_in_at && (
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(a.checked_in_at), 'HH:mm', { locale: id })}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

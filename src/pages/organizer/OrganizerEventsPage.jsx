import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Users, QrCode, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'

const STATUS_BADGE = { published: 'badge-green', draft: 'badge-yellow', cancelled: 'badge-red' }
const STATUS_LABEL = { published: 'Dipublikasi', draft: 'Draft', cancelled: 'Dibatalkan' }

export default function OrganizerEventsPage() {
  const { user } = useAuthStore()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*, registrations(count)')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const deleteEvent = async (eventId) => {
    if (!confirm('Hapus event ini?')) return
    await supabase.from('events').delete().eq('id', eventId)
    toast.success('Event dihapus')
    fetch()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Event Saya</h1>
        <Link to="/organizer/events/create" className="btn-primary">
          <Plus size={16} /> Buat Event
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-400 space-y-3">
          <p className="text-5xl">📅</p>
          <p className="font-semibold">Belum ada event</p>
          <Link to="/organizer/events/create" className="btn-primary inline-flex mt-2"><Plus size={16} /> Buat Event Pertama</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} className="card p-4 flex gap-4 items-start">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-surface-2 shrink-0">
                {ev.poster_url
                  ? <img src={ev.poster_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🎫</div>
                }
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-display font-semibold text-gray-900 dark:text-white text-sm leading-snug">{ev.title}</h3>
                  <span className={STATUS_BADGE[ev.status]}>{STATUS_LABEL[ev.status]}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(ev.date), 'd MMM yyyy · HH:mm', { locale: id })} · {ev.registrations?.[0]?.count ?? 0}/{ev.max_capacity} peserta
                </p>
                <div className="flex gap-2 flex-wrap pt-1">
                  <Link to={`/organizer/events/${ev.id}/edit`} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
                    <Edit2 size={12} /> Edit
                  </Link>
                  <Link to={`/organizer/events/${ev.id}/attendees`} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
                    <Users size={12} /> Peserta
                  </Link>
                  <Link to={`/organizer/events/${ev.id}/checkin`} className="btn-secondary text-xs px-3 py-1.5 gap-1.5">
                    <QrCode size={12} /> Check-in
                  </Link>
                  <button onClick={() => deleteEvent(ev.id)} className="btn text-xs px-3 py-1.5 gap-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

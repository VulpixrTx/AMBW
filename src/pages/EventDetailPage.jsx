import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Ticket, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { sendNotification } from '@/lib/notifications'
import EventMap from '@/components/map/EventMap'
import Spinner from '@/components/ui/Spinner'

export default function EventDetailPage() {
  const { id: eventId } = useParams()
  const { user, profile } = useAuthStore()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [registration, setRegistration] = useState(null)
  const [regCount, setRegCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data: ev } = await supabase.from('events').select('*, users!organizer_id(name)').eq('id', eventId).single()
      setEvent(ev)
      const { count } = await supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('event_id', eventId).neq('status', 'cancelled')
      setRegCount(count || 0)
      if (user) {
        const { data: reg } = await supabase.from('registrations').select('*').eq('event_id', eventId).eq('user_id', user.id).single()
        setRegistration(reg)
      }
      setLoading(false)
    }
    fetch()
  }, [eventId, user])

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return }
    setRegistering(true)
    try {
      const { data, error } = await supabase.from('registrations').insert({
        event_id: eventId,
        user_id: user.id,
        qr_code: crypto.randomUUID(),
        status: 'registered',
      }).select().single()
      if (error) throw error
      setRegistration(data)
      setRegCount(c => c + 1)
      await sendNotification({
        userId: user.id,
        title: '🎫 Pendaftaran Berhasil!',
        body: `Kamu terdaftar di ${event.title}. Cek tiket QR-mu di menu Tiket.`,
        type: 'registration',
      })
      toast.success('Berhasil mendaftar! Cek tiketmu.')
    } catch (e) {
      toast.error(e.message || 'Gagal mendaftar')
    }
    setRegistering(false)
  }

  const handleShare = () => {
    navigator.share?.({ title: event.title, url: window.location.href })
      ?? navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link disalin!'))
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner size={36} /></div>
  if (!event) return <div className="text-center py-20 text-gray-400">Event tidak ditemukan.</div>

  const isFull = regCount >= event.max_capacity
  const isPast = new Date(event.date) < new Date()
  const CATEGORY_COLORS = { Seminar: 'badge-blue', Workshop: 'badge-green', Konser: 'badge-brand', Bazaar: 'badge-yellow' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Poster */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/7] bg-gray-100 dark:bg-surface-2">
        {event.poster_url ? (
          <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-brand-500/20 to-brand-700/20">🎫</div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={CATEGORY_COLORS[event.category] || 'badge-gray'}>{event.category}</span>
          {event.status === 'cancelled' && <span className="badge-red">Dibatalkan</span>}
        </div>
        <button onClick={handleShare} className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-surface-1/90 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform">
          <Share2 size={16} />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-4">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">{event.title}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-500" />
            {format(new Date(event.date), 'EEEE, d MMMM yyyy · HH:mm', { locale: id })}
          </span>
          {event.location_name && (
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-500" />{event.location_name}</span>
          )}
          <span className="flex items-center gap-1.5"><Users size={14} className="text-brand-500" />
            {regCount} / {event.max_capacity} peserta
          </span>
        </div>

        {event.users?.name && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Diselenggarakan oleh <span className="font-semibold text-gray-700 dark:text-gray-200">{event.users.name}</span>
          </p>
        )}

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full h-2 bg-gray-100 dark:bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (regCount / event.max_capacity) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {event.max_capacity - regCount > 0 ? `${event.max_capacity - regCount} kursi tersisa` : 'Penuh'}
          </p>
        </div>
      </div>

      {/* Register button */}
      {!isPast && event.status === 'published' && (
        <div className="card p-4">
          {registration ? (
            <div className="flex items-center gap-3">
              <Ticket size={20} className="text-brand-500 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">Kamu sudah terdaftar!</p>
                <p className="text-xs text-gray-500">Lihat QR tiketmu di menu <b>Tiket Saya</b>.</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleRegister}
              disabled={registering || isFull || event.status === 'cancelled'}
              className="btn-primary w-full"
            >
              {registering ? <Spinner size={16} /> : <Ticket size={16} />}
              {isFull ? 'Sudah Penuh' : registering ? 'Mendaftar...' : 'Daftar Sekarang — Gratis'}
            </button>
          )}
        </div>
      )}

      {/* Description */}
      <div className="card p-5 space-y-2">
        <h2 className="font-display font-semibold text-gray-900 dark:text-white">Tentang Event</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          {event.description}
        </p>
      </div>

      {/* Map */}
      {event.lat && event.lng && (
        <div className="card p-4 space-y-2">
          <h2 className="font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin size={16} className="text-brand-500" /> Lokasi Venue
          </h2>
          <EventMap lat={event.lat} lng={event.lng} locationName={event.location_name} height="280px" />
        </div>
      )}
    </div>
  )
}

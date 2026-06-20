import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, MapPin, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import EventCard from '@/components/events/EventCard'
import Spinner from '@/components/ui/Spinner'

const CATEGORIES = ['Semua', 'Seminar', 'Workshop', 'Konser', 'Bazaar', 'Lainnya']

export default function HomePage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('Semua')

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      let q = supabase
        .from('events')
        .select('*, registrations(count)')
        .eq('status', 'published')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(6)
      if (cat !== 'Semua') q = q.eq('category', cat)
      const { data } = await q
      setEvents(data || [])
      setLoading(false)
    }
    fetchEvents()
  }, [cat])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900 p-8 md:p-12 text-white">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10 max-w-2xl space-y-4 animate-fade-up">
          <div className="flex items-center gap-2 text-brand-100 text-sm font-semibold">
            <Sparkles size={14} />
            <span>Temukan event terbaik di kotamu</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl leading-tight">
            Semua Event Lokal,<br />Satu Aplikasi.
          </h1>
          <p className="text-brand-100 text-lg leading-relaxed">
            Dari seminar inspiratif hingga konser seru — daftar, dapat tiket digital, dan check-in dengan QR.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/events" className="btn bg-white text-brand-600 hover:bg-brand-50 shadow-lg">
              Jelajahi Event <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex gap-6 pt-4 text-brand-100 text-sm">
            <span className="flex items-center gap-1"><MapPin size={14} /> Surabaya & sekitarnya</span>
            <span className="flex items-center gap-1"><Users size={14} /> 1000+ peserta aktif</span>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Event Mendatang</h2>
          <Link to="/events" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1 font-semibold">
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                cat === c
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-gray-100 dark:bg-surface-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-surface-3'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={36} /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <p className="text-4xl mb-3">🎫</p>
            <p>Belum ada event untuk kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e, i) => (
              <div key={e.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <EventCard event={e} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

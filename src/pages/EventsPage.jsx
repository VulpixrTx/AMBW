import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import DatePicker from 'react-datepicker'
import { supabase } from '@/lib/supabase'
import EventCard from '@/components/events/EventCard'
import Spinner from '@/components/ui/Spinner'

const CATEGORIES = ['Semua', 'Seminar', 'Workshop', 'Konser', 'Bazaar', 'Lainnya']

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Semua')
  const [dateFrom, setDateFrom] = useState(null)
  const [dateTo, setDateTo] = useState(null)
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      let q = supabase
        .from('events')
        .select('*, registrations(count)')
        .eq('status', 'published')
        .order('date', { ascending: true })

      if (cat !== 'Semua') q = q.eq('category', cat)
      if (search) q = q.ilike('title', `%${search}%`)
      if (dateFrom) q = q.gte('date', dateFrom.toISOString())
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59)
        q = q.lte('date', end.toISOString())
      }

      const { data } = await q
      setEvents(data || [])
      setLoading(false)
    }
    fetch()
  }, [search, cat, dateFrom, dateTo])

  const clearFilters = () => {
    setSearch('')
    setCat('Semua')
    setDateFrom(null)
    setDateTo(null)
  }

  const hasFilter = search || cat !== 'Semua' || dateFrom || dateTo

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Jelajahi Event</h1>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`btn-secondary gap-2 ${showFilter ? 'ring-2 ring-brand-500' : ''}`}
        >
          <SlidersHorizontal size={16} /> Filter
          {hasFilter && <span className="w-2 h-2 rounded-full bg-brand-500" />}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-10"
          placeholder="Cari nama event..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filters panel */}
      {showFilter && (
        <div className="card p-4 space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-gray-700 dark:text-gray-200">Kategori</p>
            {hasFilter && (
              <button onClick={clearFilters} className="text-xs text-red-500 flex items-center gap-1">
                <X size={12} /> Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  cat === c
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 dark:bg-surface-2 text-gray-600 dark:text-gray-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Dari tanggal</label>
              <DatePicker
                selected={dateFrom}
                onChange={setDateFrom}
                placeholderText="Pilih tanggal"
                className="input text-sm"
                dateFormat="dd/MM/yyyy"
                isClearable
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Sampai tanggal</label>
              <DatePicker
                selected={dateTo}
                onChange={setDateTo}
                placeholderText="Pilih tanggal"
                className="input text-sm"
                dateFormat="dd/MM/yyyy"
                minDate={dateFrom}
                isClearable
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold">Tidak ada event ditemukan</p>
          <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e, i) => (
            <div key={e.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <EventCard event={e} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

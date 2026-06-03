import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Eye, Search } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import Spinner from '@/components/ui/Spinner'

const STATUS_BADGE = { published: 'badge-green', draft: 'badge-yellow', cancelled: 'badge-red' }
const STATUS_LABEL = { published: 'Published', draft: 'Draft', cancelled: 'Dibatalkan' }

export default function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const fetch = async () => {
    setLoading(true)
    let q = supabase.from('events').select('*, users!organizer_id(name), registrations(count)').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setEvents(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [filter])

  const updateStatus = async (id, status) => {
    await supabase.from('events').update({ status }).eq('id', id)
    toast.success(`Event ${status === 'published' ? 'disetujui' : 'dibatalkan'}`)
    fetch()
  }

  const filtered = events.filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="section-title">Manajemen Event</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Cari event..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {[['all', 'Semua'], ['draft', 'Draft'], ['published', 'Published'], ['cancelled', 'Dibatalkan']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === val ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-surface-2 text-gray-600 dark:text-gray-300'}`}
            >{label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ev => (
            <div key={ev.id} className="card p-4 flex gap-4 items-start">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-surface-2 shrink-0">
                {ev.poster_url ? <img src={ev.poster_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🎫</div>}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{ev.title}</p>
                  <span className={STATUS_BADGE[ev.status]}>{STATUS_LABEL[ev.status]}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Oleh: <b>{ev.users?.name}</b> · {format(new Date(ev.date), 'd MMM yyyy', { locale: id })} · {ev.registrations?.[0]?.count ?? 0} peserta
                </p>
                <div className="flex gap-2 flex-wrap pt-1">
                  <Link to={`/events/${ev.id}`} className="btn-secondary text-xs px-3 py-1.5 gap-1">
                    <Eye size={12} /> Detail
                  </Link>
                  {ev.status !== 'published' && (
                    <button onClick={() => updateStatus(ev.id, 'published')} className="btn text-xs px-3 py-1.5 gap-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      <CheckCircle2 size={12} /> Setujui
                    </button>
                  )}
                  {ev.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(ev.id, 'cancelled')} className="btn text-xs px-3 py-1.5 gap-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <XCircle size={12} /> Batalkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

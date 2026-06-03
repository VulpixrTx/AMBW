import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import QRScanner from '@/components/qr/QRScanner'
import Spinner from '@/components/ui/Spinner'

export default function OrganizerCheckinPage() {
  const { id: eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(null) // { success, name, message }
  const [checkedCount, setCheckedCount] = useState(0)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
      setEvent(data)
      const { count } = await supabase
        .from('registrations').select('*', { count: 'exact', head: true })
        .eq('event_id', eventId).eq('status', 'checked_in')
      setCheckedCount(count || 0)
      setLoading(false)
    }
    fetch()
  }, [eventId])

  const handleScan = async (raw) => {
    if (processing) return
    setProcessing(true)
    try {
      const parsed = JSON.parse(raw)
      if (parsed.eid !== eventId) {
        setResult({ success: false, message: 'QR ini bukan untuk event ini.' })
        toast.error('QR tidak valid untuk event ini')
        setProcessing(false)
        return
      }

      const { data: reg, error } = await supabase
        .from('registrations')
        .select('*, users(name)')
        .eq('id', parsed.rid)
        .eq('event_id', eventId)
        .single()

      if (error || !reg) {
        setResult({ success: false, message: 'Tiket tidak ditemukan.' })
        toast.error('Tiket tidak ditemukan')
        setProcessing(false)
        return
      }

      if (reg.status === 'checked_in') {
        setResult({ success: false, name: reg.users?.name, message: 'Peserta ini sudah check-in sebelumnya.' })
        toast.error('Sudah check-in sebelumnya')
        setProcessing(false)
        return
      }

      if (reg.status === 'cancelled') {
        setResult({ success: false, name: reg.users?.name, message: 'Tiket ini sudah dibatalkan.' })
        toast.error('Tiket dibatalkan')
        setProcessing(false)
        return
      }

      await supabase.from('registrations')
        .update({ status: 'checked_in', checked_in_at: new Date().toISOString() })
        .eq('id', reg.id)

      setCheckedCount(c => c + 1)
      setResult({ success: true, name: reg.users?.name, message: 'Check-in berhasil!' })
      toast.success(`✅ ${reg.users?.name} berhasil check-in!`)
    } catch {
      setResult({ success: false, message: 'QR tidak valid atau rusak.' })
      toast.error('QR tidak dapat dibaca')
    }
    setProcessing(false)
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner size={36} /></div>

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="section-title">Scan Check-in</h1>
        {event && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.title}</p>}
      </div>

      {/* Stats */}
      <div className="card p-4 flex items-center gap-3">
        <div className="p-2.5 bg-brand-500/10 rounded-xl">
          <Users size={20} className="text-brand-500" />
        </div>
        <div>
          <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">{checkedCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">peserta sudah check-in</p>
        </div>
      </div>

      {/* Result feedback */}
      {result && (
        <div className={`card p-4 flex items-start gap-3 animate-fade-up border-2 ${result.success ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-red-500/30 bg-red-50/50 dark:bg-red-900/10'}`}>
          {result.success
            ? <CheckCircle2 size={24} className="text-emerald-500 shrink-0 mt-0.5" />
            : <XCircle size={24} className="text-red-500 shrink-0 mt-0.5" />
          }
          <div>
            {result.name && <p className="font-semibold text-gray-900 dark:text-white">{result.name}</p>}
            <p className="text-sm text-gray-600 dark:text-gray-300">{result.message}</p>
          </div>
        </div>
      )}

      {/* Scanner */}
      <div className="card p-4 space-y-3">
        <h2 className="font-display font-semibold text-sm text-gray-900 dark:text-white">Arahkan kamera ke QR Tiket</h2>
        <QRScanner onScan={handleScan} />
      </div>

      {processing && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Spinner size={16} /> Memproses...
        </div>
      )}
    </div>
  )
}

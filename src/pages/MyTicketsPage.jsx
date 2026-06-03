import { useEffect, useState } from 'react'
import { Ticket } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import TicketQR from '@/components/qr/TicketQR'
import Spinner from '@/components/ui/Spinner'

export default function MyTicketsPage() {
  const { user } = useAuthStore()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('registrations')
        .select('*, events(*)')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .order('registered_at', { ascending: false })
      setTickets(data || [])
      setLoading(false)
    }
    fetch()
  }, [user])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="section-title flex items-center gap-2">
        <Ticket size={24} className="text-brand-500" /> Tiket Saya
      </h1>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 text-gray-400 space-y-3">
          <Ticket size={48} className="mx-auto opacity-30" />
          <p className="font-semibold">Belum ada tiket</p>
          <p className="text-sm">Daftar ke event untuk mendapatkan tiket QR digital.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map(t => (
            <TicketQR key={t.id} registration={t} event={t.events} />
          ))}
        </div>
      )}
    </div>
  )
}

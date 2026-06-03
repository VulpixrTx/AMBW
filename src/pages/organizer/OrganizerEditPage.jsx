import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import EventForm from '@/components/events/EventForm'
import Spinner from '@/components/ui/Spinner'

export default function OrganizerEditPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('events').select('*').eq('id', id).single().then(({ data }) => {
      setEvent(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner size={36} /></div>
  if (!event) return <div className="text-center py-20 text-gray-400">Event tidak ditemukan.</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="section-title">Edit Event</h1>
      <EventForm initial={event} isEdit />
    </div>
  )
}

import EventForm from '@/components/events/EventForm'

export default function OrganizerCreatePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="section-title">Buat Event Baru</h1>
      <EventForm />
    </div>
  )
}

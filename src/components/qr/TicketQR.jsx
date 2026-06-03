import { QRCodeSVG } from 'qrcode.react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function TicketQR({ registration, event }) {
  const qrData = JSON.stringify({
    rid: registration.id,
    eid: registration.event_id,
    uid: registration.user_id,
    ts: registration.registered_at,
  })

  return (
    <div className="card p-5 flex flex-col items-center gap-4 text-center">
      <div className="w-full">
        <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
          {event?.title}
        </h3>
        {event?.date && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {format(new Date(event.date), 'EEEE, d MMMM yyyy · HH:mm', { locale: id })}
          </p>
        )}
        {event?.location_name && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{event.location_name}</p>
        )}
      </div>

      <div className="p-4 bg-white rounded-2xl shadow-inner">
        <QRCodeSVG
          value={qrData}
          size={200}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#4338ca"
        />
      </div>

      <div className="w-full space-y-1">
        <div className={`badge mx-auto ${registration.status === 'checked_in' ? 'badge-green' : 'badge-blue'}`}>
          {registration.status === 'checked_in' ? '✓ Sudah Check-in' : 'Belum Check-in'}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          #{registration.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  )
}

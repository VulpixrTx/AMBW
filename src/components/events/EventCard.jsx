import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

const CATEGORY_COLORS = {
  Seminar:  'badge-blue',
  Workshop: 'badge-green',
  Konser:   'badge-brand',
  Bazaar:   'badge-yellow',
  default:  'badge-gray',
}

export default function EventCard({ event }) {
  const badgeClass = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default

  return (
    <Link to={`/events/${event.id}`} className="card-hover block overflow-hidden group">
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-surface-2">
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-brand-500/20 to-brand-700/20">
            🎫
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={badgeClass}>{event.category}</span>
        </div>
        {event.status === 'cancelled' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="badge-red text-base px-4 py-1">Dibatalkan</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-brand-500 shrink-0" />
            {format(new Date(event.date), 'EEEE, d MMM yyyy · HH:mm', { locale: id })}
          </span>
          {event.location_name && (
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-brand-500 shrink-0" />
              <span className="truncate">{event.location_name}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-brand-500 shrink-0" />
            {event.registrations?.[0]?.count ?? 0} / {event.max_capacity} peserta
          </span>
        </div>
      </div>
    </Link>
  )
}

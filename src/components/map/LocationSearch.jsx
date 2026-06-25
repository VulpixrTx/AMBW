import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, MapPin, Loader2, X } from 'lucide-react'

/**
 * LocationSearch — autocomplete input berbasis Nominatim (OpenStreetMap)
 * Props:
 *   value        : string — nilai teks saat ini
 *   onChange     : (name, lat, lng) => void — dipanggil saat user pilih lokasi
 *   placeholder  : string
 */
export default function LocationSearch({ value, onChange, placeholder = 'Cari nama tempat...' }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Sinkronkan jika value dari luar berubah (edit mode)
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handle = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const search = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1&accept-language=id`
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'id', 'User-Agent': 'evenin-app/1.0' }
      })
      const data = await res.json()
      setResults(data)
      setOpen(data.length > 0)
    } catch {
      setResults([])
    }
    setLoading(false)
  }, [])

  const handleInput = (e) => {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q), 400)
  }

  const handleSelect = (item) => {
    const name = item.display_name
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)
    setQuery(name)
    setResults([])
    setOpen(false)
    onChange?.(name, lat, lng)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
    onChange?.('', null, null)
  }

  // Icon kategori tempat
  const getIcon = (type) => {
    const icons = {
      university: '🎓', school: '🏫', college: '🎓',
      hospital: '🏥', clinic: '🏥',
      restaurant: '🍽️', cafe: '☕', fast_food: '🍔',
      hotel: '🏨', hostel: '🏨',
      mall: '🏬', supermarket: '🛒', shop: '🏪',
      park: '🌳', garden: '🌿',
      stadium: '🏟️', sports_centre: '⚽',
      museum: '🏛️', library: '📚', theatre: '🎭',
      place_of_worship: '⛪', mosque: '🕌', church: '⛪',
      airport: '✈️', bus_station: '🚌', train_station: '🚆',
      bank: '🏦', atm: '🏧',
      government: '🏛️', townhall: '🏛️',
    }
    return icons[type] || '📍'
  }

  // Singkat nama jalan/area supaya tidak terlalu panjang
  const formatDisplay = (item) => {
    const parts = item.display_name.split(', ')
    // Ambil 3-4 bagian pertama yang paling relevan
    return parts.slice(0, 4).join(', ')
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          className="input pl-9 pr-9"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {loading && (
          <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500 animate-spin" />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-[9999] mt-1.5 w-full bg-white dark:bg-surface-2 rounded-2xl shadow-xl border border-gray-100 dark:border-surface-3 overflow-hidden animate-fade-in">
          {results.map((item, i) => (
            <button
              key={item.place_id}
              type="button"
              onClick={() => handleSelect(item)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors text-sm
                ${i !== 0 ? 'border-t border-gray-100 dark:border-surface-3' : ''}`}
            >
              <span className="mt-0.5 text-base shrink-0">{getIcon(item.type || item.class)}</span>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate leading-snug">
                  {item.name || formatDisplay(item).split(',')[0]}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                  {formatDisplay(item)}
                </p>
              </div>
              <MapPin size={13} className="text-brand-500 shrink-0 mt-1 ml-auto" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

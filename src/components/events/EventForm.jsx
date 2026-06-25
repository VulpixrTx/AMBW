import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus, MapPin, Save } from 'lucide-react'
import DatePicker from 'react-datepicker'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import EventMap from '@/components/map/EventMap'
import LocationSearch from '@/components/map/LocationSearch'
import Spinner from '@/components/ui/Spinner'

const CATEGORIES = ['Seminar', 'Workshop', 'Konser', 'Bazaar', 'Lainnya']

export default function EventForm({ initial = {}, onSave, isEdit = false }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [form, setForm] = useState({
    title: '', description: '', category: 'Seminar',
    max_capacity: 100, location_name: '',
    lat: null, lng: null, status: 'draft',
    ...initial,
    date: initial.date ? new Date(initial.date) : null,
  })
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreview, setPosterPreview] = useState(initial.poster_url || null)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePoster = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPosterFile(file)
    setPosterPreview(URL.createObjectURL(file))
  }

  const handleMapClick = (latlng) => {
    set('lat', latlng.lat)
    set('lng', latlng.lng)
    toast.success('Lokasi dipilih di peta')
  }

  const handleLocationSelect = (name, lat, lng) => {
    setForm(f => ({ ...f, location_name: name, lat, lng }))
    if (name) toast.success('Lokasi ditemukan!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.date) { toast.error('Judul dan tanggal wajib diisi'); return }
    setSaving(true)
    try {
      let poster_url = form.poster_url || null
      if (posterFile) {
        const ext = posterFile.name.split('.').pop()
        const path = `posters/${user.id}-${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('posters').upload(path, posterFile)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('posters').getPublicUrl(path)
        poster_url = publicUrl
      }

      const payload = {
        ...form,
        organizer_id: user.id,
        poster_url,
        date: form.date.toISOString(),
        max_capacity: parseInt(form.max_capacity),
      }
      delete payload.registrations

      if (isEdit) {
        const { error } = await supabase.from('events').update(payload).eq('id', initial.id)
        if (error) throw error
        toast.success('Event diperbarui!')
      } else {
        const { error } = await supabase.from('events').insert(payload)
        if (error) throw error
        toast.success('Event dibuat! Tunggu persetujuan admin.')
      }
      navigate('/organizer/events')
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Poster upload */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Poster Event</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative cursor-pointer rounded-2xl overflow-hidden bg-gray-100 dark:bg-surface-2 border-2 border-dashed border-gray-200 dark:border-surface-3 hover:border-brand-500 transition-colors aspect-[16/7] flex items-center justify-center"
        >
          {posterPreview ? (
            <img src={posterPreview} alt="poster" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-400 space-y-2">
              <ImagePlus size={36} className="mx-auto" />
              <p className="text-sm">Klik untuk upload poster</p>
              <p className="text-xs">PNG, JPG, WebP · Maks 5MB</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePoster} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Judul Event *</label>
          <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Nama event" required />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Kategori</label>
          <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Status</label>
          <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Publish</option>
            <option value="cancelled">Batalkan</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Tanggal & Waktu *</label>
          <DatePicker
            selected={form.date}
            onChange={d => set('date', d)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy HH:mm"
            placeholderText="Pilih tanggal & waktu"
            className="input w-full"
            minDate={new Date()}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Kapasitas Peserta</label>
          <input type="number" className="input" value={form.max_capacity} onChange={e => set('max_capacity', e.target.value)} min={1} />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            <MapPin size={12} /> Cari Nama Lokasi / Venue
          </label>
          <LocationSearch
            value={form.location_name}
            onChange={handleLocationSelect}
            placeholder="Ketik nama tempat, misal: Universitas Kristen Petra..."
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            💡 Pilih dari hasil pencarian untuk otomatis pin lokasi di peta. Atau klik langsung di peta.
          </p>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
            <MapPin size={12} /> Pilih Lokasi di Peta (klik untuk pin)
          </label>
          <EventMap lat={form.lat} lng={form.lng} locationName={form.location_name} editable onLocationChange={handleMapClick} height="240px" />
          {form.lat && (
            <p className="text-xs text-gray-400 font-mono">📍 {form.lat.toFixed(6)}, {form.lng.toFixed(6)}</p>
          )}
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Deskripsi</label>
          <textarea className="input min-h-[120px] resize-none" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ceritakan tentang event ini..." />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Batal</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? <Spinner size={16} /> : <Save size={16} />}
          {isEdit ? 'Simpan Perubahan' : 'Buat Event'}
        </button>
      </div>
    </form>
  )
}

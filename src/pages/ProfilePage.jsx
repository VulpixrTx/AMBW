import { useState, useRef } from 'react'
import { User, Moon, Sun, Save, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import Spinner from '@/components/ui/Spinner'

const ROLE_LABELS = { peserta: 'Peserta', organizer: 'Organizer', admin: 'Admin' }
const ROLE_COLORS = { peserta: 'badge-blue', organizer: 'badge-green', admin: 'badge-brand' }

export default function ProfilePage() {
  const { user, profile, setProfile } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleSave = async () => {
    setSaving(true)
    const { data, error } = await supabase.from('users').update({ name }).eq('id', user.id).select().single()
    if (error) { toast.error('Gagal menyimpan'); setSaving(false); return }
    setProfile(data)
    toast.success('Profil disimpan!')
    setSaving(false)
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { toast.error('Gagal upload foto'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id)
    setProfile({ ...profile, avatar_url: publicUrl })
    toast.success('Foto profil diperbarui!')
    setUploading(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="section-title">Profil Saya</h1>

      <div className="card p-6 space-y-6 animate-fade-up">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-brand-500/10 ring-4 ring-brand-500/20">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-500">
                  <User size={36} />
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-1.5 bg-brand-500 text-white rounded-full shadow-lg hover:bg-brand-600 transition-colors"
            >
              {uploading ? <Spinner size={14} /> : <Camera size={14} />}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white">{profile?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className={`${ROLE_COLORS[profile?.role]} mt-1 inline-block`}>{ROLE_LABELS[profile?.role]}</span>
          </div>
        </div>

        {/* Name edit */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Nama Lengkap</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Nama kamu" />
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
          {saving ? <Spinner size={16} /> : <Save size={16} />} Simpan Perubahan
        </button>
      </div>

      {/* Theme toggle */}
      <div className="card p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">Tampilan</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dark ? 'Mode Gelap aktif' : 'Mode Terang aktif'}</p>
        </div>
        <button
          onClick={toggle}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${dark ? 'bg-brand-500' : 'bg-gray-200'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center transition-transform duration-300 ${dark ? 'translate-x-7' : ''}`}>
            {dark ? <Moon size={12} className="text-brand-500" /> : <Sun size={12} className="text-yellow-500" />}
          </span>
        </button>
      </div>

      {/* Info */}
      <div className="card p-5 space-y-2">
        <p className="font-semibold text-sm text-gray-900 dark:text-white">Info Akun</p>
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>Email: <span className="text-gray-700 dark:text-gray-200">{user?.email}</span></p>
          <p>Role: <span className="text-gray-700 dark:text-gray-200">{ROLE_LABELS[profile?.role]}</span></p>
        </div>
      </div>
    </div>
  )
}

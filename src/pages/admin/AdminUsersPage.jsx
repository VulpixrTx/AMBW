import { useEffect, useState } from 'react'
import { Search, Shield, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'

const ROLE_OPTIONS = ['peserta', 'organizer', 'admin']
const ROLE_LABELS = { peserta: 'Peserta', organizer: 'Organizer', admin: 'Admin' }
const ROLE_BADGE = { peserta: 'badge-blue', organizer: 'badge-green', admin: 'badge-brand' }

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const updateRole = async (uid, role) => {
    if (uid === currentUser.id) { toast.error('Tidak bisa mengubah role sendiri'); return }
    await supabase.from('users').update({ role }).eq('id', uid)
    setUsers(us => us.map(u => u.id === uid ? { ...u, role } : u))
    toast.success('Role diperbarui')
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="section-title flex items-center gap-2">
        <Shield size={24} className="text-brand-500" /> Manajemen User
      </h1>

      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9 text-sm" placeholder="Cari nama atau email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} user</p>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={32} /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                {u.avatar_url
                  ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-brand-500 font-bold text-sm">{u.name?.[0]?.toUpperCase()}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{u.name}</p>
                  {u.id === currentUser.id && <span className="badge-gray text-xs">Kamu</span>}
                </div>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              <select
                value={u.role}
                onChange={e => updateRole(u.id, e.target.value)}
                disabled={u.id === currentUser.id}
                className="input text-xs w-28 py-1.5"
              >
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

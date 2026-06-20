import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'

export default function RegisterPage() {
  const { signUp } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'peserta' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 🔍 DEBUG 1: Cek payload data form sebelum validasi & kirim
    console.log('=== [DEBUG] Submit Form Triggered ===')
    console.log('Payload Form:', { ...form, password: '***[HIDDEN]***', confirm: '***[HIDDEN]***' }) // Menyembunyikan password asli di log demi security

    if (form.password !== form.confirm) {
      console.warn('[DEBUG] Validasi Gagal: Password dan Konfirmasi tidak cocok.')
      toast.error('Password tidak cocok')
      return
    }
    if (form.password.length < 6) {
      console.warn('[DEBUG] Validasi Gagal: Panjang password kurang dari 6 karakter.')
      toast.error('Password minimal 6 karakter')
      return
    }

    setLoading(true)
    try {
      // 🔍 DEBUG 2: Cek variabel env sesaat sebelum memanggil fungsi signUp (Supabase / Firebase)
      console.log('=== [DEBUG] Mengirim ke Auth Store ===')
      console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
      console.log('VITE_SUPABASE_ANON_KEY ada?:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

      await signUp(form.email, form.password, form.name, form.role)

      console.log('[DEBUG] Auth signUp Berhasil!')
      toast.success('Akun berhasil dibuat! Cek email kamu untuk konfirmasi.')
      navigate('/login')
    } catch (err) {
      // 🔍 DEBUG 3: Menangkap full error object secara detail di console log
      console.error('=== [DEBUG] Auth signUp ERROR ===')
      console.error('Error Object Lengkap:', err)
      console.error('Pesan Error:', err.message)

      toast.error(err.message || 'Gagal membuat akun')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6 animate-fade-up">
        <div className="text-center space-y-1">
          <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">
            Bergabung di <span className="text-brand-500">EventIn</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sudah punya akun? <Link to="/login" className="text-brand-500 font-semibold hover:underline">Masuk</Link></p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {[
            { key: 'name', label: 'Nama Lengkap', type: 'text', icon: User, placeholder: 'Nama kamu' },
            { key: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'nama@email.com' },
          ].map(({ key, label, type, icon: Icon, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</label>
              <div className="relative">
                <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={type} className="input pl-9" placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)} required />
              </div>
            </div>
          ))}

          {/* Role */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Daftar sebagai</label>
            <div className="relative">
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                className="input pr-9 appearance-none"
                value={form.role}
                onChange={e => set('role', e.target.value)}
              >
                <option value="peserta">Peserta</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {['password', 'confirm'].map(key => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">{key === 'password' ? 'Password' : 'Konfirmasi Password'}</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={show ? 'text' : 'password'} className="input pl-9 pr-9" placeholder="••••••••" value={form[key]} onChange={e => set(key, e.target.value)} required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <Spinner size={16} /> : null}
            <span>{loading ? 'Memproses...' : 'Buat Akun'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
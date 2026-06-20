import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'

export default function LoginPage() {
  const { signIn, fetchProfile, initFCM } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await signIn(form.email, form.password)
      await fetchProfile(user.id)
      await initFCM()
      toast.success('Selamat datang kembali!')
      // Redirect based on role
      const { profile } = useAuthStore.getState()
      if (profile?.role === 'admin') {
        navigate('/admin/events')
      } else if (profile?.role === 'organizer') {
        navigate('/organizer/events')
      } else {
        navigate('/')
      }
    } catch (err) {
      toast.error(err.message || 'Email atau password salah')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-up">
        <div className="text-center space-y-1">
          <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">
            Masuk ke <span className="text-brand-500">EventIn</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Belum punya akun? <Link to="/register" className="text-brand-500 font-semibold hover:underline">Daftar</Link></p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" className="input pl-9" placeholder="nama@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={show ? 'text' : 'password'} className="input pl-9 pr-9" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <Spinner size={16} /> : null} Masuk
          </button>
        </form>
      </div>
    </div>
  )
}

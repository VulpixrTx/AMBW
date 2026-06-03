import { useState } from 'react'
import { Send, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendNotificationToAll } from '@/lib/notifications'
import Spinner from '@/components/ui/Spinner'

const TYPES = [
  { value: 'info', label: '💬 Info', desc: 'Informasi umum' },
  { value: 'reminder', label: '⏰ Reminder', desc: 'Pengingat event' },
  { value: 'update', label: '📢 Update', desc: 'Pembaruan penting' },
]

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({ title: '', body: '', type: 'info' })
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState([])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSend = async (e) => {
    e.preventDefault()
    if (!form.title || !form.body) { toast.error('Judul dan pesan wajib diisi'); return }
    setSending(true)
    try {
      await sendNotificationToAll({ title: form.title, body: form.body, type: form.type })
      const sent = { ...form, sentAt: new Date() }
      setHistory(h => [sent, ...h])
      setForm({ title: '', body: '', type: 'info' })
      toast.success('Notifikasi berhasil dikirim ke semua user!')
    } catch (err) {
      toast.error('Gagal mengirim notifikasi')
    }
    setSending(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="section-title flex items-center gap-2">
        <Bell size={24} className="text-brand-500" /> Kirim Notifikasi
      </h1>

      <form onSubmit={handleSend} className="card p-6 space-y-4 animate-fade-up">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Tipe Notifikasi</label>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('type', t.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  form.type === t.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-surface-3 hover:border-brand-300'
                }`}
              >
                <div className="text-lg">{t.label.split(' ')[0]}</div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Judul Notifikasi</label>
          <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Judul singkat..." required />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Isi Pesan</label>
          <textarea className="input min-h-[100px] resize-none" value={form.body} onChange={e => set('body', e.target.value)} placeholder="Tulis pesan notifikasi..." required />
        </div>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl text-xs text-yellow-700 dark:text-yellow-400">
          ⚠️ Notifikasi ini akan dikirim ke <b>semua user</b> yang terdaftar dan telah mengizinkan notifikasi.
        </div>

        <button type="submit" disabled={sending} className="btn-primary w-full">
          {sending ? <Spinner size={16} /> : <Send size={16} />}
          {sending ? 'Mengirim...' : 'Kirim ke Semua User'}
        </button>
      </form>

      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-gray-900 dark:text-white">Riwayat Pengiriman (sesi ini)</h2>
          {history.map((h, i) => (
            <div key={i} className="card p-3 flex gap-3">
              <span className="text-xl shrink-0">{TYPES.find(t => t.value === h.type)?.label.split(' ')[0]}</span>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{h.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{h.body}</p>
                <p className="text-xs text-gray-400 mt-0.5">{h.sentAt.toLocaleTimeString('id-ID')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

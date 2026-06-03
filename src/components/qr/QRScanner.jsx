import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff } from 'lucide-react'

export default function QRScanner({ onScan, onError }) {
  const [active, setActive] = useState(false)
  const [err, setErr] = useState(null)
  const scannerRef = useRef(null)
  const elementId = 'qr-reader'

  const start = async () => {
    setErr(null)
    try {
      const scanner = new Html5Qrcode(elementId)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan?.(decodedText)
        },
        () => {}
      )
      setActive(true)
    } catch (e) {
      setErr('Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.')
      onError?.(e)
    }
  }

  const stop = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
      scannerRef.current.clear()
    }
    setActive(false)
  }

  useEffect(() => () => { stop() }, [])

  return (
    <div className="space-y-3">
      <div
        id={elementId}
        className={`w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-surface-2 ${active ? 'min-h-[300px]' : 'hidden'}`}
      />

      {!active && (
        <div className="flex flex-col items-center justify-center gap-3 py-12 bg-gray-50 dark:bg-surface-2 rounded-2xl border-2 border-dashed border-gray-200 dark:border-surface-3">
          <Camera size={48} className="text-brand-500/50" />
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Klik tombol di bawah untuk mengaktifkan kamera<br />dan scan QR tiket peserta
          </p>
        </div>
      )}

      {err && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2">{err}</p>
      )}

      <button
        onClick={active ? stop : start}
        className={active ? 'btn-danger w-full' : 'btn-primary w-full'}
      >
        {active ? <><CameraOff size={16} /> Stop Kamera</> : <><Camera size={16} /> Aktifkan Kamera</>}
      </button>
    </div>
  )
}

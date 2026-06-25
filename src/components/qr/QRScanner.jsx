import { useEffect, useRef, useState, useCallback } from 'react'
import jsQR from 'jsqr'
import { Camera, CameraOff } from 'lucide-react'

export default function QRScanner({ onScan, onError }) {
  const [active, setActive] = useState(false)
  const [err, setErr] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const lastScanRef = useRef(null)

  const scanFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code && code.data && code.data !== lastScanRef.current) {
      lastScanRef.current = code.data
      onScan?.(code.data)
      // Reset cooldown setelah 2 detik supaya bisa scan ulang
      setTimeout(() => { lastScanRef.current = null }, 2000)
    }

    rafRef.current = requestAnimationFrame(scanFrame)
  }, [onScan])

  const start = async () => {
    setErr(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)
      rafRef.current = requestAnimationFrame(scanFrame)
    } catch (e) {
      setErr('Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.')
      onError?.(e)
    }
  }

  const stop = () => {
    cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    lastScanRef.current = null
    setActive(false)
  }

  useEffect(() => () => stop(), [])

  return (
    <div className="space-y-3">
      {/* Video preview */}
      <div className={`relative w-full rounded-2xl overflow-hidden bg-black ${active ? 'block' : 'hidden'}`}
        style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Scan overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-52 h-52">
            {/* Corner borders */}
            <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-500 rounded-tl-lg" />
            <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-500 rounded-tr-lg" />
            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-500 rounded-bl-lg" />
            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-500 rounded-br-lg" />
            {/* Scan line animation */}
            <div className="absolute left-1 right-1 h-0.5 bg-brand-500/80 animate-scan-line" />
          </div>
        </div>
        {/* Hidden canvas untuk proses QR */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Placeholder saat tidak aktif */}
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

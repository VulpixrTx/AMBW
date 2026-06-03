# EventIn 🎫
Aplikasi Event Lokal & Ticketing — Mobile Web (PWA)
**Stack:** React + Vite + Tailwind CSS + Supabase + Firebase FCM

---

## 🚀 Setup & Instalasi

### 1. Clone & Install
```bash
git clone <repo-url>
cd evenin
npm install
```

### 2. Konfigurasi Environment
Buat file `.env` dari `.env.example`:
```bash
cp .env.example .env
```
Isi semua value dari Supabase dan Firebase project kamu.

### 3. Setup Supabase
1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor**, paste dan jalankan isi file `supabase/schema.sql`
3. Pastikan 2 Storage Bucket terbuat: `posters` dan `avatars`
4. Copy **Project URL** dan **anon key** ke `.env`

### 4. Setup Firebase (untuk Push Notification)
1. Buat project di [console.firebase.google.com](https://console.firebase.google.com)
2. Tambahkan Web App, copy config ke `.env`
3. Aktifkan **Cloud Messaging** di Firebase Console
4. Generate **VAPID key** di Project Settings > Cloud Messaging > Web Push certificates
5. Copy ke `VITE_FIREBASE_VAPID_KEY`
6. Update `YOUR_PROJECT_ID` di kedua file Edge Function

### 5. Deploy Supabase Edge Functions
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy send-notification
supabase functions deploy send-notification-batch
supabase secrets set FCM_SERVER_KEY=your_fcm_server_key
```

### 6. Jalankan Development
```bash
npm run dev
```
Buka `http://localhost:5173`

---

## 📦 Deploy ke Vercel
1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Set semua Environment Variables dari `.env`
4. Deploy!

---

## 👤 Setup Akun Admin & Organizer
Setelah register akun pertama, jalankan di Supabase SQL Editor:
```sql
-- Jadikan admin
update public.users set role = 'admin' where email = 'emailkamu@gmail.com';

-- Jadikan organizer
update public.users set role = 'organizer' where email = 'organizer@gmail.com';
```

---

## 🗂️ Struktur Folder
```
src/
├── components/
│   ├── events/       # EventCard, EventForm
│   ├── layout/       # Navbar, BottomNav, AppLayout, ProtectedRoute, RoleRoute
│   ├── map/          # EventMap (Leaflet + OpenStreetMap)
│   ├── notifications/ 
│   ├── qr/           # TicketQR, QRScanner
│   └── ui/           # Spinner
├── lib/
│   ├── supabase.js   # Supabase client
│   ├── firebase.js   # FCM setup
│   └── notifications.js
├── pages/
│   ├── HomePage.jsx
│   ├── EventsPage.jsx
│   ├── EventDetailPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── MyTicketsPage.jsx
│   ├── ProfilePage.jsx
│   ├── NotificationsPage.jsx
│   ├── organizer/    # 5 halaman organizer
│   └── admin/        # 3 halaman admin
├── store/
│   ├── authStore.js  # Zustand auth + profile
│   └── themeStore.js # Dark/Light mode
└── styles/
    └── index.css
supabase/
├── schema.sql        # Setup database + RLS
└── functions/        # Edge Functions FCM
```

---

## ✅ Fitur yang Diimplementasi
| Fitur | Status | Poin |
|-------|--------|------|
| BaaS (Supabase) | ✅ | 20 |
| File Storage (Supabase Storage) | ✅ | 20 |
| QR Code Generation | ✅ | +25 |
| QR Code Scanner (Check-in) | ✅ | |
| Push Notification (FCM) | ✅ | +25 |
| OpenStreetMap Integration | ✅ | +30 |
| RBAC (Admin/Organizer/Peserta) | ✅ | +15 |
| Light & Dark Mode | ✅ | +10 |
| Date/Datetime Picker | ✅ | +5 |
| Image Picker (Upload poster/avatar) | ✅ | |
| Kelengkapan Aplikasi | ✅ | +15 |
| Kompleksitas (bukan CRUD biasa) | ✅ | +15 |
| **TOTAL** | | **~180 poin** |

-- =============================================
-- EventIn — Supabase Schema Setup
-- Jalankan file ini di Supabase SQL Editor
-- =============================================

-- 1. USERS TABLE
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  role        text not null default 'peserta' check (role in ('peserta', 'organizer', 'admin')),
  avatar_url  text,
  fcm_token   text,
  theme       text default 'light',
  created_at  timestamptz default now()
);

-- 2. EVENTS TABLE
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  organizer_id  uuid not null references public.users(id) on delete cascade,
  category      text default 'Seminar',
  poster_url    text,
  location_name text,
  lat           float,
  lng           float,
  date          timestamptz not null,
  max_capacity  integer not null default 100,
  status        text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
  created_at    timestamptz default now()
);

-- 3. REGISTRATIONS TABLE
create table if not exists public.registrations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events(id) on delete cascade,
  user_id        uuid not null references public.users(id) on delete cascade,
  qr_code        text not null default gen_random_uuid()::text,
  status         text not null default 'registered' check (status in ('registered', 'checked_in', 'cancelled')),
  registered_at  timestamptz default now(),
  checked_in_at  timestamptz,
  unique(event_id, user_id)
);

-- 4. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null,
  body        text not null,
  type        text default 'info',
  read        boolean default false,
  created_at  timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table public.users          enable row level security;
alter table public.events         enable row level security;
alter table public.registrations  enable row level security;
alter table public.notifications  enable row level security;

-- USERS policies
create policy "Users can view all profiles"
  on public.users for select using (true);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- EVENTS policies
create policy "Anyone can view published events"
  on public.events for select using (
    status = 'published' or organizer_id = auth.uid() or
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Organizers and admins can insert events"
  on public.events for insert with check (
    exists (select 1 from public.users where id = auth.uid() and role in ('organizer', 'admin'))
  );

create policy "Organizers can update own events, admins can update all"
  on public.events for update using (
    organizer_id = auth.uid() or
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Organizers can delete own events, admins can delete all"
  on public.events for delete using (
    organizer_id = auth.uid() or
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- REGISTRATIONS policies
create policy "Users can view own registrations"
  on public.registrations for select using (
    user_id = auth.uid() or
    exists (
      select 1 from public.events e
      where e.id = event_id and e.organizer_id = auth.uid()
    ) or
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can register"
  on public.registrations for insert with check (auth.uid() = user_id);

create policy "Users can cancel own registration, organizers can check-in"
  on public.registrations for update using (
    user_id = auth.uid() or
    exists (
      select 1 from public.events e
      where e.id = event_id and e.organizer_id = auth.uid()
    ) or
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- NOTIFICATIONS policies
create policy "Users can view own notifications"
  on public.notifications for select using (user_id = auth.uid());

create policy "Users can update own notifications (mark as read)"
  on public.notifications for update using (user_id = auth.uid());

create policy "Service role can insert notifications"
  on public.notifications for insert with check (true);

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Run these in Supabase Dashboard > Storage > New Bucket
-- or via SQL:
insert into storage.buckets (id, name, public) values ('posters', 'posters', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

-- Storage policies
create policy "Public read for posters"
  on storage.objects for select using (bucket_id = 'posters');

create policy "Authenticated users can upload posters"
  on storage.objects for insert with check (bucket_id = 'posters' and auth.role() = 'authenticated');

create policy "Users can update own posters"
  on storage.objects for update using (bucket_id = 'posters' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public read for avatars"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update own avatar"
  on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- SEED DATA (opsional untuk testing)
-- =============================================

-- Buat akun admin setelah register manual, lalu jalankan:
-- update public.users set role = 'admin' where email = 'admin@evenin.app';
-- update public.users set role = 'organizer' where email = 'organizer@evenin.app';

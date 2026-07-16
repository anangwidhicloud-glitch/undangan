-- Wedding Invitation schema for Supabase/PostgreSQL
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,100}$'),
  title text not null,
  groom_name text not null,
  bride_name text not null,
  event_date timestamptz,
  timezone text not null default 'Asia/Jakarta',
  status text not null default 'draft' check (status in ('draft', 'published')),
  theme_config jsonb not null default '{}'::jsonb,
  seo_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  role text not null check (role in ('groom', 'bride')),
  full_name text not null,
  nickname text not null,
  parent_names text not null default '',
  photo_url text,
  instagram_url text,
  description text not null default '',
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (wedding_id, role)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  event_type text not null,
  title text not null,
  event_date date,
  start_time time,
  end_time time,
  timezone text not null default 'Asia/Jakarta',
  venue_name text not null default '',
  address text not null default '',
  latitude numeric(10,7) check (latitude between -90 and 90),
  longitude numeric(10,7) check (longitude between -180 and 180),
  google_maps_url text,
  dress_code text,
  notes text,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.love_stories (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  title text not null,
  story text not null,
  story_date date,
  image_url text,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video', 'audio')),
  url text not null,
  cloudinary_public_id text,
  thumbnail_url text,
  caption text,
  alt_text text not null default '',
  is_featured boolean not null default false,
  orientation text check (orientation is null or orientation in ('horizontal', 'vertical')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  name text not null,
  greeting text not null default 'Bapak/Ibu/Saudara/i',
  phone text,
  guest_group text not null default 'Umum',
  invitation_quota integer not null default 1 check (invitation_quota between 1 and 20),
  slug text not null,
  token text not null default encode(gen_random_bytes(18), 'hex'),
  invitation_status text not null default 'belum_dikirim' check (invitation_status in ('belum_dikirim', 'sudah_dikirim')),
  rsvp_status text not null default 'belum' check (rsvp_status in ('belum', 'hadir', 'tidak_hadir', 'ragu')),
  notes text,
  first_opened_at timestamptz,
  last_opened_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (wedding_id, slug),
  unique (token)
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  guest_name text not null,
  attendance_status text not null check (attendance_status in ('hadir', 'tidak_hadir', 'ragu')),
  guest_count integer not null default 1 check (guest_count between 0 and 20),
  phone text,
  message text not null default '',
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.guest_messages (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  guest_name text not null,
  message text not null,
  attendance_status text not null check (attendance_status in ('hadir', 'tidak_hadir', 'ragu')),
  is_approved boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gift_accounts (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  gift_type text not null check (gift_type in ('bank', 'qris', 'shipping')),
  bank_name text,
  account_number text,
  account_holder text,
  qris_url text,
  shipping_address text,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  setting_key text not null,
  setting_value jsonb not null default 'null'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (wedding_id, setting_key)
);

create table if not exists public.visitor_logs (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings(id) on delete cascade,
  guest_id uuid references public.guests(id) on delete set null,
  session_id text not null,
  page_path text not null,
  referrer text,
  device_type text check (device_type is null or device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  browser text,
  ip_hash text,
  visited_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_weddings_slug_status on public.weddings (slug, status);
create index if not exists idx_couples_wedding_sort on public.couples (wedding_id, sort_order);
create index if not exists idx_events_wedding_date on public.events (wedding_id, event_date, sort_order);
create index if not exists idx_love_stories_wedding_sort on public.love_stories (wedding_id, sort_order);
create index if not exists idx_media_wedding_type_sort on public.media (wedding_id, media_type, sort_order);
create index if not exists idx_guests_wedding_name on public.guests (wedding_id, lower(name));
create index if not exists idx_guests_wedding_rsvp on public.guests (wedding_id, rsvp_status);
create index if not exists idx_guests_phone on public.guests (wedding_id, phone) where phone is not null;
create index if not exists idx_rsvps_wedding_created on public.rsvps (wedding_id, created_at desc);
create index if not exists idx_guest_messages_public on public.guest_messages (wedding_id, is_approved, created_at desc);
create index if not exists idx_visitor_logs_wedding_visited on public.visitor_logs (wedding_id, visited_at desc);
create index if not exists idx_visitor_logs_session on public.visitor_logs (wedding_id, session_id);

create or replace trigger weddings_updated_at before update on public.weddings for each row execute function public.set_updated_at();
create or replace trigger couples_updated_at before update on public.couples for each row execute function public.set_updated_at();
create or replace trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();
create or replace trigger love_stories_updated_at before update on public.love_stories for each row execute function public.set_updated_at();
create or replace trigger media_updated_at before update on public.media for each row execute function public.set_updated_at();
create or replace trigger guests_updated_at before update on public.guests for each row execute function public.set_updated_at();
create or replace trigger rsvps_updated_at before update on public.rsvps for each row execute function public.set_updated_at();
create or replace trigger guest_messages_updated_at before update on public.guest_messages for each row execute function public.set_updated_at();
create or replace trigger gift_accounts_updated_at before update on public.gift_accounts for each row execute function public.set_updated_at();
create or replace trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
-- RLS design:
-- 1. The public may only read content belonging to a published wedding.
-- 2. Guest lists, RSVP details, visitor logs, and site settings are never public.
-- 3. Public form submissions go through Next.js server routes using the service role.
-- 4. Administrative writes also go through authenticated server routes using the service role.

alter table public.weddings enable row level security;
alter table public.couples enable row level security;
alter table public.events enable row level security;
alter table public.love_stories enable row level security;
alter table public.media enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.guest_messages enable row level security;
alter table public.gift_accounts enable row level security;
alter table public.site_settings enable row level security;
alter table public.visitor_logs enable row level security;

revoke all on public.guests, public.rsvps, public.site_settings, public.visitor_logs from anon, authenticated;
revoke all on public.weddings, public.couples, public.events, public.love_stories, public.media, public.guest_messages, public.gift_accounts from anon, authenticated;
grant select on public.weddings, public.couples, public.events, public.love_stories, public.media, public.guest_messages, public.gift_accounts to anon, authenticated;

create policy "published weddings are publicly readable"
on public.weddings for select
to anon, authenticated
using (status = 'published');

create policy "published couples are publicly readable"
on public.couples for select
to anon, authenticated
using (exists (select 1 from public.weddings w where w.id = couples.wedding_id and w.status = 'published'));

create policy "published events are publicly readable"
on public.events for select
to anon, authenticated
using (exists (select 1 from public.weddings w where w.id = events.wedding_id and w.status = 'published'));

create policy "published stories are publicly readable"
on public.love_stories for select
to anon, authenticated
using (exists (select 1 from public.weddings w where w.id = love_stories.wedding_id and w.status = 'published'));

create policy "published media are publicly readable"
on public.media for select
to anon, authenticated
using (exists (select 1 from public.weddings w where w.id = media.wedding_id and w.status = 'published'));

create policy "approved messages are publicly readable"
on public.guest_messages for select
to anon, authenticated
using (
  is_approved = true
  and exists (select 1 from public.weddings w where w.id = guest_messages.wedding_id and w.status = 'published')
);

create policy "published gifts are publicly readable"
on public.gift_accounts for select
to anon, authenticated
using (exists (select 1 from public.weddings w where w.id = gift_accounts.wedding_id and w.status = 'published'));

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

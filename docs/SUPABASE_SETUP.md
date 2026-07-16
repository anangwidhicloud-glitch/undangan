# Setup Supabase

## 1. Buat proyek

Buat proyek baru dari dashboard Supabase, pilih region yang dekat dengan mayoritas tamu, lalu simpan database password di password manager.

## 2. Jalankan schema

Melalui **SQL Editor**, jalankan berurutan:

1. `supabase/schema.sql`
2. `supabase/policies.sql`
3. `supabase/seed.sql` untuk demo (opsional)

Melalui Supabase CLI, migration awal ada di `supabase/migrations/202607150001_initial_schema.sql`.

```bash
supabase link --project-ref PROJECT_REF
supabase db push
```

## 3. Isi environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` adalah secret server. Jangan pernah menambahkan prefix `NEXT_PUBLIC_`, memasukkannya ke screenshot, commit Git, atau response API.

## 4. Model akses

Public hanya mendapat SELECT pada:

- wedding berstatus `published`
- couples, events, stories, media, dan gift dari wedding published
- guest message dengan `is_approved = true`

Tidak ada akses public langsung ke guests, RSVP, settings, atau visitor logs. RSVP dan visitor tracking masuk melalui Next.js route handler yang memvalidasi, rate-limit, menyaring input, lalu menggunakan service role di server.

## 5. Storage bucket opsional

Media utama menggunakan Cloudinary. Bila ingin memakai Supabase Storage sebagai alternatif:

1. Buat bucket private bernama `wedding-private`.
2. Jangan memberikan public write policy.
3. Buat signed URL melalui server route.
4. Simpan metadata URL/public ID pada tabel `media`.

## 6. Contoh query

```sql
select id, slug, status, event_date
from public.weddings
order by created_at desc;

select attendance_status, count(*)
from public.rsvps
where wedding_id = '11111111-1111-4111-8111-111111111111'
group by attendance_status;

select date_trunc('day', visited_at) as day, count(*) as visitors
from public.visitor_logs
where wedding_id = '11111111-1111-4111-8111-111111111111'
group by 1
order by 1;
```

## 7. Backup dan retensi

- Aktifkan backup sesuai plan Supabase.
- Export CSV RSVP/tamu secara berkala.
- Hapus atau agregasikan visitor logs lama agar tabel tidak tumbuh tanpa batas.
- Jangan menyimpan IP mentah; aplikasi hanya menyimpan hash salted.

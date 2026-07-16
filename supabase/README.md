# Supabase files

Jalankan berurutan melalui Supabase SQL Editor:

1. `schema.sql`
2. `policies.sql`
3. `seed.sql` (opsional, untuk data demo)

Untuk Supabase CLI, migration awal tersedia di `migrations/202607150001_initial_schema.sql`. Aplikasi menggunakan `SUPABASE_SERVICE_ROLE_KEY` hanya pada server. Jangan pernah menambahkan key tersebut ke variabel `NEXT_PUBLIC_*`.

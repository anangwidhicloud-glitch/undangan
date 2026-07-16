# Architecture

## Runtime modes

### Demo/fallback

Supabase dan Cloudinary boleh kosong. Server mengembalikan content fallback. RSVP disimpan di localStorage setelah API mengonfirmasi mode demo. Admin draft juga disimpan lokal.

### Production

Next.js server route memakai Supabase service role untuk data dan Cloudinary secret untuk media. Client hanya menerima data terpilih dan tidak pernah menerima secret.

## Data flow

```text
Browser
  -> Next.js page/server component
  -> content-service
  -> Supabase service client OR fallback resolver

Admin browser
  -> authenticated route handler
  -> Zod / same-origin / rate limit
  -> Supabase or Cloudinary
```

## Authentication

Environment credentials diverifikasi server-side dengan timing-safe comparison atau bcrypt hash. Session berupa JWT HS256 dengan issuer/audience, disimpan dalam HttpOnly cookie. `src/proxy.ts` melakukan early redirect, sementara protected layout melakukan pemeriksaan server kedua.

## Multi-tenant readiness

Semua domain table membawa `wedding_id`. UI demo berfokus pada satu slug, tetapi schema dan route content mendukung wedding berbeda. Untuk SaaS multi-admin, migrasikan credential env ke Supabase Auth dan tambahkan membership/role table.

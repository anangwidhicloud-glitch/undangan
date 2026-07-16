# Deployment ke Vercel

## Persiapan

```bash
npm ci
npm run lint
npm run type-check
npm test
npm run build
```

## Deploy

1. Push proyek tanpa `.env.local`, `.next`, dan `node_modules`.
2. Import repository di Vercel.
3. Framework preset akan terdeteksi sebagai Next.js.
4. Tambahkan semua environment variables pada Production; tambahkan juga Preview bila dibutuhkan.
5. Deploy.
6. Atur custom domain.
7. Set `NEXT_PUBLIC_APP_URL=https://domain-anda.id` lalu redeploy agar canonical/OG URL benar.

## Production command

Vercel menggunakan `npm run build`. Untuk self-host:

```bash
npm run build
npm run start
```

Jalankan di belakang reverse proxy HTTPS dan pastikan forwarded headers benar.

## Security headers

Headers dasar dikonfigurasi di `next.config.ts`: nosniff, SAMEORIGIN, referrer policy, permissions policy, COOP, dan noindex admin. Evaluasi Content Security Policy sesuai domain final Cloudinary, Supabase, maps, dan analytics sebelum production.

## Distributed rate limiting

Rate limiter bawaan bersifat in-memory dan cocok untuk demo/single instance. Pada Vercel multi-instance, ganti implementasi `src/lib/rate-limit.ts` dengan Upstash Redis atau datastore terdistribusi agar limit konsisten.

## Post-deploy smoke check

- `/invite/nathan-dan-aulia?to=Nama%20Tamu`
- cover dapat dibuka
- musik dapat dihentikan
- peta dan video tidak overflow
- RSVP tersimpan ke Supabase
- `/admin` redirect ke login
- login berhasil
- upload Cloudinary dan delete bekerja
- preview Open Graph menggunakan URL production

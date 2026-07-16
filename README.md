# Arunika Wedding Invitation — Premium Cinematic Edition

Aplikasi undangan pernikahan digital Indonesia berbasis **Next.js App Router**, TypeScript, Tailwind CSS, Supabase, dan Cloudinary. Proyek ini mobile-first, mempunyai halaman publik yang personal, admin panel responsif, mode fallback tanpa database, import/export Excel, RSVP, buku tamu, statistik, tema, serta deployment configuration untuk Vercel.

## Tampilan aplikasi

Halaman publik memakai gaya **luxury editorial–cinematic** dengan palet olive gelap, ivory, dan emas. Cover dibuka menggunakan transisi tirai terbelah, monogram berputar lembut, kartu tamu glassmorphism, dan tombol emas berkilau. Setelah dibuka, pengguna masuk ke hero full-screen dengan komposisi tipografi besar, depth/parallax ringan, progress bar, music controller, serta floating navigation dock yang mengikuti bagian aktif.

Setiap bagian memakai ritme layout berbeda agar tidak terasa seperti template card generik: countdown glass gelap, profil mempelai asimetris, event card editorial bernomor, peta ber-depth, timeline minimal, galeri masonry sinematik, video theater, RSVP dua kolom, dan wedding gift bergaya premium. Seluruh animasi menghormati `prefers-reduced-motion`.

Preview bawaan:

- [`Cover mobile`](docs/screenshots/01-cover-mobile.png)
- [`Hero mobile`](docs/screenshots/02-hero-mobile.png)
- [`Profil mobile`](docs/screenshots/03-couple-mobile.png)
- [`Hero desktop`](docs/screenshots/04-hero-desktop.png)
- [`Galeri desktop`](docs/screenshots/05-gallery-desktop.png)
- [`Our Story mobile`](docs/screenshots/09-our-story-mobile.png)

Admin panel tetap memakai sidebar yang berubah menjadi drawer pada mobile. Seluruh pengaturan berada dalam satu console: data pasangan, acara, media, tamu, import Excel, gift, tema, SEO, WhatsApp, preview mobile/tablet/desktop, serta statistik.

## Fitur yang telah diimplementasikan

### Undangan publik

- URL dinamis `/invite/[slug]` dan personalisasi `?to=Nama Tamu`.
- Splash screen, sessionStorage, animasi Framer Motion dan AOS, serta reduced-motion support.
- Musik hanya setelah interaksi pengguna, tombol play/pause melayang, volume awal rendah.
- Countdown client-safe tanpa hydration mismatch, termasuk kondisi tanggal kosong dan acara lewat.
- Profil dua mempelai, multi-acara, format tanggal Indonesia, Google Calendar, salin alamat.
- Peta OpenStreetMap dengan marker serta tautan Google Maps.
- Our Story sinematik dengan foto per chapter, parallax scroll, polaroid pendamping, timeline progres, galeri responsif, slider Swiper, lightbox, dan lazy image fallback.
- Video lokal/Cloudinary, poster, `preload="metadata"`, tanpa autoplay bersuara.
- RSVP tervalidasi Zod, honeypot, rate limit, sanitasi, hash IP, dan mode localStorage.
- Buku tamu dengan moderasi admin; React escaping dan sanitasi server mencegah XSS.
- Rekening/hadiah dengan nomor tersamarkan dan tombol salin.
- Metadata dinamis, Open Graph, Twitter card, canonical, sitemap, robots, dan Event schema.

### Admin

- Login server-side melalui `.env.local`, JWT signed session, HttpOnly cookie, SameSite, Secure di production.
- Proteksi `/admin` melalui `src/proxy.ts` dan layout server.
- CRUD semua konten utama dengan draft browser pada mode demo dan snapshot Supabase saat aktif.
- Upload gambar/video ke Cloudinary melalui endpoint server-only, progress upload, validasi MIME dan ukuran.
- Pengelolaan tamu: tambah/edit/hapus, cari, filter RSVP, personal link, WhatsApp, tandai dikirim.
- Import Excel dengan preview valid/gagal, deduplikasi, normalisasi nomor Indonesia, skip/overwrite.
- Export daftar tamu dan laporan gagal import ke Excel.
- Moderasi ucapan, pengaturan rekening, enam preset tema dan lima preset UI/UX layout dengan preview langsung, SEO, status draft/published.
- Preview mobile, tablet, desktop, serta dashboard RSVP/statistik.

### Fallback dan keamanan

- Prioritas data: Supabase valid → environment/config → fallback lokal → media bebas lisensi.
- Aplikasi tetap berjalan saat Supabase/Cloudinary kosong, gagal, atau tabel belum berisi data.
- Fallback terpusat di `src/config/fallback-content.ts` dan `src/lib/content-resolver.ts`.
- Service role dan Cloudinary secret tidak pernah dikirim ke browser.
- Same-origin check, server validation, rate limiting, MIME/size validation, security headers.
- Row Level Security membatasi data publik hanya pada undangan published dan ucapan approved.
- `npm audit` diverifikasi tanpa vulnerability pada laporan pengujian terakhir.

## Teknologi

- Next.js 16 App Router, React 19, TypeScript 5
- Tailwind CSS 4
- Supabase JS
- Cloudinary Node SDK
- Framer Motion, AOS, Swiper
- React Hook Form + Zod
- Recharts, Lucide React
- SheetJS API 0.20.3 melalui paket kompatibel `@e965/xlsx`
- Vitest dan Playwright
- ESLint dan Prettier

## Persyaratan

- Node.js 20.9 atau lebih baru
- npm 10 atau lebih baru
- Akun Supabase dan Cloudinary hanya diperlukan untuk mode production/data persisten

## Instalasi cepat

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`. Root URL otomatis diarahkan ke slug default.

### Kredensial lokal

Isi sendiri `.env.local`; tidak ada password hardcoded di source code.

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ganti-dengan-password-kuat
ADMIN_SESSION_SECRET=ganti-dengan-random-secret-minimal-32-karakter
```

Password hash lebih disarankan:

```bash
npm run generate:password-hash -- "password-kuat-anda"
```

Salin output ke `ADMIN_PASSWORD_HASH`, lalu kosongkan/hapus `ADMIN_PASSWORD`.

## Environment variables

Lihat `.env.example`.

| Variabel                                    | Kegunaan                                        | Wajib            |
| ------------------------------------------- | ----------------------------------------------- | ---------------- |
| `NEXT_PUBLIC_APP_URL`                       | URL canonical aplikasi                          | Production       |
| `ADMIN_EMAIL`                               | Email login admin                               | Ya               |
| `ADMIN_PASSWORD` atau `ADMIN_PASSWORD_HASH` | Kredensial admin                                | Ya               |
| `ADMIN_SESSION_SECRET`                      | Menandatangani JWT session, minimal 32 karakter | Ya               |
| `NEXT_PUBLIC_SUPABASE_URL`                  | URL proyek Supabase                             | Tidak untuk demo |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`             | Anon key Supabase                               | Tidak untuk demo |
| `SUPABASE_SERVICE_ROLE_KEY`                 | Operasi server administratif                    | Tidak untuk demo |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`         | Cloud name                                      | Tidak untuk demo |
| `CLOUDINARY_API_KEY`                        | API key server                                  | Tidak untuk demo |
| `CLOUDINARY_API_SECRET`                     | API secret server                               | Tidak untuk demo |
| `CLOUDINARY_UPLOAD_FOLDER`                  | Folder media                                    | Tidak            |
| `NEXT_PUBLIC_DEFAULT_WEDDING_SLUG`          | Slug default                                    | Tidak            |
| `NEXT_PUBLIC_DEFAULT_TIMEZONE`              | Zona waktu default                              | Tidak            |

Aplikasi tidak crash saat variabel Supabase/Cloudinary kosong. Variabel admin menampilkan error konfigurasi yang jelas pada halaman login.

## Perintah

```bash
npm run dev                 # development
npm run lint                # ESLint, zero warning
npm run type-check          # TypeScript
npm test                    # unit tests
npm run test:e2e            # Playwright smoke tests (jalankan build dahulu)
npm run build               # production build
npm run start               # production server
npm run format              # format source
npm run generate:excel-template
npm run generate:password-hash -- "password"
```

Sebelum smoke test pertama kali:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

## Setup Supabase

1. Buat proyek Supabase.
2. Jalankan `supabase/schema.sql`.
3. Jalankan `supabase/policies.sql`.
4. Opsional: jalankan `supabase/seed.sql`.
5. Isi tiga environment variable Supabase.
6. Restart development server.

Detail lengkap: [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

## Setup Cloudinary

Buat akun Cloudinary dan isi cloud name, API key, dan API secret. Upload dilakukan melalui `/api/cloudinary/upload`; browser tidak menerima API secret. Detail: [`docs/CLOUDINARY_SETUP.md`](docs/CLOUDINARY_SETUP.md).

## Login dan pengelolaan admin

Buka `/admin/login`. Setelah login, buka tiap menu di sidebar. Perubahan ditandai sebagai draft sampai tombol **Simpan** ditekan. Pada mode demo, snapshot disimpan ke localStorage browser. Pada mode Supabase, snapshot disimpan di `site_settings` melalui server route.

Panduan: [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md).

## Import Excel

Template valid tersedia di:

`public/templates/template-daftar-tamu.xlsx`

Kolom wajib:

```text
name, greeting, phone, group, invitation_quota, notes
```

Batas saat ini: 5 MB dan 1.000 baris per file. Detail: [`docs/EXCEL_IMPORT.md`](docs/EXCEL_IMPORT.md).

### Lima UI/UX layout

Tema visual dan layout bekerja secara independen. Mengganti layout tidak menghapus data pasangan, acara, tamu, RSVP, galeri, atau hadiah.

1. **Cinematic Editorial** — curtain cover, hero full-screen, masonry gallery, floating dock.
2. **Classic Invitation** — paper cover, komposisi simetris, classic grid, top navigation.
3. **Storytelling Journey** — envelope reveal, zig-zag story, filmstrip gallery, side dots.
4. **Modern Minimal** — door reveal, clean split hero, slideshow, compact menu.
5. **Cultural Heritage** — floral reveal, royal hero, polaroid gallery, scrapbook story.

Konfigurasi tersimpan di `weddings.theme_config` dan dinormalisasi otomatis untuk data versi lama.

## Mengganti tema dan fallback media

- Enam preset tersedia di menu **Tema & UI/UX Layout**: Luxury Gold, Modern Botanical, Elegant Nusantara, Romantic Blush, Midnight Silver, dan Ivory Minimal. Admin dapat mengubah warna, font, ornamen, hero, surface, dan animasi. Lima UI/UX layout terpisah mengatur cover, navigasi, galeri, serta Our Story: Cinematic Editorial, Classic Invitation, Storytelling Journey, Modern Minimal, dan Cultural Heritage.
- Fallback media dan demo content berada di `src/config/fallback-content.ts`.
- Validasi URL dan fallback chain berada di `src/lib/content-resolver.ts`.
- Domain image remote tambahan harus dimasukkan ke `next.config.ts`.

## Struktur folder

```text
src/
  app/                  routes, API, metadata, error/loading
  components/
    admin/              admin console dan login
    invitation/         pengalaman undangan publik
    shared/             komponen reusable
  config/               fallback terpusat
  lib/                  auth, Cloudinary, Supabase, security, Excel
  services/             content data access
  types/                domain types
public/
  audio/ images/ video/ templates/
supabase/
  migrations/ schema.sql policies.sql seed.sql
tests/
  unit tests dan e2e smoke tests
docs/
scripts/
```

## Deploy ke Vercel

1. Push source ke GitHub/GitLab/Bitbucket.
2. Import repository di Vercel.
3. Tambahkan environment variables production.
4. Deploy.
5. Ubah `NEXT_PUBLIC_APP_URL` menjadi domain final dan redeploy.

Panduan lengkap: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Troubleshooting

### Login menampilkan konfigurasi belum lengkap

Pastikan `.env.local` memiliki `ADMIN_EMAIL`, salah satu password, dan secret minimal 32 karakter. Restart server setelah mengubah env.

### Upload gagal dan pesan Cloudinary belum dikonfigurasi

Isi tiga credential Cloudinary. Pastikan MIME file didukung dan ukurannya di bawah 8 MB untuk gambar atau 50 MB untuk video.

### Data tidak masuk Supabase

Pastikan schema, policies, dan seed dijalankan; URL/key benar; serta service role hanya disimpan di server environment. Periksa log server, bukan console browser.

### Gambar remote tidak tampil

Gunakan HTTPS, Cloudinary, Unsplash image CDN yang diizinkan, atau tambahkan hostname ke `next.config.ts`. Komponen otomatis kembali ke fallback saat gambar gagal.

### Musik tidak langsung berbunyi

Ini disengaja. Browser modern melarang autoplay audio sebelum interaksi. Musik baru dicoba setelah tombol **Buka Undangan** ditekan.

## Catatan production

- Ganti seluruh demo bank account, alamat, foto, video, audio, dan tanggal.
- Gunakan `ADMIN_PASSWORD_HASH`, random secret kuat, dan rotasi key bila pernah bocor.
- Pasang distributed rate limit seperti Upstash Redis saat deployment multi-instance/traffic tinggi.
- Backup database dan Cloudinary secara berkala.
- Tinjau ulang privacy policy sebelum merekam analytics pengunjung.
- Batasi ukuran dan retensi `visitor_logs` dengan scheduled cleanup.
- Jalankan seluruh test command setelah perubahan dependency atau schema.

Hasil pengujian aktual ada di [`docs/TESTING_REPORT.md`](docs/TESTING_REPORT.md).

## Troubleshooting npm di Windows

Jika instalasi terhenti dengan `EPERM` atau `ETIMEDOUT`, tutup proses `npm run dev` dan terminal lain yang memakai folder proyek, lalu jalankan PowerShell sebagai pengguna biasa dari folder proyek:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm config delete proxy
npm config delete https-proxy
npm config set registry https://registry.npmjs.org/
npm cache verify
npm ci
```

Lock file distribusi ini menggunakan registry npm publik dan proyek juga menyertakan `.npmrc` lokal agar registry tetap konsisten.

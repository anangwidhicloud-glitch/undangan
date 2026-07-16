# Laporan Pengujian

Tanggal pengujian terakhir: **16 Juli 2026**  
Lingkungan: Linux container, Node.js **v22.16.0**, npm **10.9.2**.

## Ringkasan hasil

| Pemeriksaan           | Perintah                                                           | Hasil                                                                |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Instalasi dependency  | `npm ci`                                                           | Lulus; 549 package diaudit                                           |
| Dependency audit      | `npm audit --audit-level=low`                                      | Lulus; 0 vulnerability                                               |
| ESLint                | `npm run lint`                                                     | Lulus; 0 error, 0 warning                                            |
| TypeScript            | `npm run type-check`                                               | Lulus                                                                |
| Unit test             | `npm test`                                                         | Lulus; 9 file, 36 test                                               |
| Production build      | `npm run build`                                                    | Lulus; compile, type validation, dan 16 static/dynamic route selesai |
| Playwright smoke test | `npm run test:e2e` (kasus dijalankan terpisah pada lingkungan ini) | Lulus; 13 skenario                                                   |
| Template Excel        | import/inspect dengan `artifact_tool` dan pemeriksaan tipe file    | Lulus; workbook Microsoft Excel 2007+, 1 sheet, 5 baris contoh       |

## Unit test yang dijalankan

- Resolver fallback: URL kosong, whitespace, string `null`/`undefined`, URL berbahaya, dan image fallback.
- Validasi RSVP: payload valid, batas jumlah tamu, honeypot, dan input tidak valid.
- Normalisasi WhatsApp Indonesia dan generator link.
- Parser Excel, validasi kolom, dan batas jumlah baris.
- Countdown sebelum hari H, sesudah hari H, dan tanggal invalid.
- Content service saat Supabase belum dikonfigurasi.
- Enam preset tema, validasi warna, fallback preset, dan preservasi custom override.
- Same-origin/CSRF check di balik host dan forwarded protocol proxy.

Hasil akhir Vitest:

```text
Test Files  9 passed (9)
Tests       36 passed (36)
```

## Playwright smoke test

Skenario berikut benar-benar dijalankan menggunakan Chromium sistem. Kebijakan `URLBlocklist` milik container dinonaktifkan hanya selama proses pengujian localhost, kemudian dikembalikan setelah tes selesai:

1. Halaman personal `/invite/nathan-dan-aulia?to=...` terbuka.
2. Nama tamu tampil pada cover.
3. Tombol **Buka Undangan** membuka splash dan menampilkan hero.
4. Tidak ada page error fatal pada alur pembukaan.
5. `/admin` tanpa session dialihkan ke `/admin/login`.
6. Login admin menggunakan `ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan session server berhasil.
7. Dashboard admin dapat dibuka setelah login.
8. RSVP tersimpan ke localStorage pada mode demo tanpa Supabase.
9. Tidak ada horizontal overflow pada 360×800, 390×844, 412×915, dan 768×1024.
10. Admin dapat memilih tema, melihat preview langsung, menyimpan, reload, dan mempertahankan pilihan tema.
11. Tema draft mode demo diterapkan pada halaman publik; seluruh viewport 1024×768, 1366×768, dan 1440×900 tetap bebas horizontal overflow.
12. Admin dapat mengubah foto chapter Our Story, menyimpan draft, lalu halaman publik merender empat chapter beserta foto yang dipilih.
13. Admin dapat memilih satu dari lima UI/UX layout, menyimpan, lalu halaman publik merender cover, navigasi, galeri, dan Our Story sesuai preset.

Seluruh 13 kasus dijalankan dengan satu worker dan lulus. Enam smoke test selesai sekitar 21 detik dan tujuh responsive test sekitar 13 detik. Media eksternal diblokir selama smoke test agar hasil tidak bergantung pada koneksi Unsplash/OpenStreetMap; fallback lokal dan struktur layout tetap dirender. Di mesin pengembangan normal, jalankan:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

## Validasi Theme Manager premium v1.2

- Cover cinematic curtain dan personalisasi nama tamu ter-render.
- Floating dock dapat berpindah ke Home, Mempelai, Acara, Galeri, dan RSVP.
- Web Share API memiliki fallback clipboard.
- Hero, profil, event, galeri, dan RSVP tidak menimbulkan horizontal overflow pada tujuh viewport.
- Fallback gambar lokal `luxury-placeholder.svg` aktif ketika media eksternal gagal.
- Preview aktual tersimpan di `docs/screenshots/`.
- Enam preset memiliki ID unik, warna valid, dan konfigurasi lengkap.
- Kustomisasi pengguna dipertahankan di atas konfigurasi preset.
- Data theme_config lama dinormalisasi otomatis.
- Pemilihan Romantic Blush diuji dari admin hingga halaman publik.
- Theme Manager memiliki preview mobile langsung dan reset preset.

## Validasi Our Story v1.3

- Empat chapter demo memiliki foto sendiri dan fallback terpusat.
- Foto kosong, string `null`, atau URL tidak valid diganti secara otomatis.
- Admin dapat upload foto, memakai URL Cloudinary, atau memilih foto dari galeri.
- Urutan chapter dapat diubah tanpa mengubah kode.
- Halaman publik merender parallax, polaroid pendamping, reveal bergantian, dan progress timeline.
- Animasi menghormati `prefers-reduced-motion`.
- Browser test memastikan empat chapter tampil dan perubahan foto dari admin diterapkan ke halaman publik.
- Seluruh tujuh viewport tetap bebas horizontal overflow setelah section baru ditambahkan.

## Validasi UI/UX Layout Builder v1.4

- Lima preset layout memiliki ID unik dan konfigurasi cover, navigasi, galeri, serta Our Story yang berbeda.
- Tema visual dapat diganti tanpa mengubah layout UI/UX yang sedang aktif.
- Layout dapat diganti tanpa menghapus konten atau data tamu.
- Cinematic Editorial memakai curtain, masonry, cinematic story, dan floating dock.
- Classic Invitation memakai paper cover, classic grid, vertical timeline, dan top bar.
- Storytelling Journey memakai envelope, filmstrip, zig-zag story, dan side dots.
- Modern Minimal memakai door reveal, slideshow, polaroid story, dan compact menu.
- Cultural Heritage memakai floral reveal, polaroid gallery, scrapbook story, dan minimal navigation.
- Browser test memverifikasi pemilihan Modern Minimal dari admin hingga atribut runtime serta komponen publik.
- Tujuh viewport tetap bebas horizontal overflow setelah sistem layout ditambahkan.

## Production build

Build terakhir selesai dengan exit code 0. Route yang terdeteksi:

```text
/                       static
/_not-found             static
/admin                  dynamic
/admin/login            dynamic
/api/admin/content      dynamic
/api/auth/login         dynamic
/api/auth/logout        dynamic
/api/auth/session       dynamic
/api/cloudinary/delete  dynamic
/api/cloudinary/upload  dynamic
/api/guests/import      dynamic
/api/rsvp               dynamic
/api/visitor            dynamic
/invite/[slug]          dynamic
/robots.txt             static
/sitemap.xml            static
```

Jumlah worker build dibatasi menjadi dua melalui konfigurasi Next.js agar build konsisten pada CI/container dengan resource terbatas. Pengaturan ini tidak mengubah fungsi aplikasi.

## Masalah yang ditemukan dan diperbaiki selama pengujian

- Transform AOS sempat memperlebar scroll area pada layar 360–390 px; root invitation sekarang memotong overflow horizontal.
- Gambar remote yang gagal dapat menahan image optimizer; gambar remote sekarang dimuat langsung dan memiliki fallback lokal final tanpa loop.
- Halaman login sempat ter-prerender menggunakan env saat build; halaman sekarang dipaksa dynamic agar membaca kredensial pada runtime.
- Secure cookie production tidak dapat dipakai pada HTTP localhost; cookie tetap `Secure` pada domain production HTTPS, dengan pengecualian eksplisit untuk `localhost`/`127.0.0.1` agar local production smoke test berfungsi.
- Same-origin check sekarang membaca `Host`/`X-Forwarded-Host` dan `X-Forwarded-Proto`, sehingga aman sekaligus kompatibel dengan reverse proxy.

## Batas pengujian

- Supabase dan Cloudinary tidak diberi kredensial nyata pada lingkungan pengujian. Mode fallback, validasi, server routes, lint, type-check, dan build telah diuji, tetapi operasi database live, signed upload Cloudinary live, serta delete media live harus diuji kembali setelah pengguna mengisi environment variables.
- Deployment Vercel dan custom domain belum dijalankan dari container ini.
- Koneksi internet eksternal dibatasi; kegagalan media remote diuji melalui fallback lokal.

Tidak ada klaim bahwa aplikasi bebas bug secara absolut. Status di atas hanya berdasarkan pemeriksaan yang benar-benar dijalankan.

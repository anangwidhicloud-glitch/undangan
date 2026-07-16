# Our Story Sinematik

Section **Our Story** menampilkan perjalanan hubungan dalam format chapter editorial dengan foto utama dan foto polaroid pendamping.

## Efek visual

- Parallax foto utama mengikuti posisi scroll.
- Reveal chapter bergantian dari kiri dan kanan.
- Foto polaroid muncul dengan rotasi dan hover lembut.
- Garis timeline terisi sesuai progres scroll.
- Floating ornament dan glow mengikuti tema aktif.
- Bentuk frame foto menyesuaikan preset tema.
- Seluruh gerakan otomatis dikurangi saat `prefers-reduced-motion` aktif.

## Pengelolaan melalui admin

Buka `/admin?tab=story`, kemudian untuk setiap chapter:

1. Isi judul, tanggal, dan cerita.
2. Upload foto melalui Cloudinary, tempel URL HTTPS, atau pilih foto dari galeri.
3. Gunakan tombol naik/turun untuk mengatur urutan.
4. Tambahkan atau hapus chapter sesuai kebutuhan.
5. Klik **Simpan** dan periksa hasilnya melalui Preview.

Foto disimpan dalam `loveStories[].imageUrl` pada content snapshot. Ketika snapshot belum tersedia, kolom `love_stories.image_url` dari Supabase digunakan. URL kosong, `null`, atau tidak valid otomatis diganti dengan fallback.

## File utama

- Komponen publik: `src/components/invitation/OurStory.tsx`
- Pengelolaan admin: `src/components/admin/AdminDashboard.tsx`
- Fallback foto: `src/config/fallback-content.ts`
- Resolver media: `src/lib/content-resolver.ts`
- Seed Supabase: `supabase/seed.sql`

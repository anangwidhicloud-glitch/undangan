# Panduan Admin

## Login

Buka `/admin/login`, masukkan email dan password dari environment. Session berlaku delapan jam. Logout menghapus cookie session.

## Menyimpan perubahan

Label di header menunjukkan bila ada perubahan belum disimpan. Tombol **Simpan**:

- mode Supabase: menyimpan wedding dan content snapshot melalui server route
- mode demo: menyimpan draft di localStorage browser

Mode demo bukan penyimpanan lintas perangkat.

## Menu

- **Dashboard**: ringkasan tamu, RSVP, status, media.
- **Profil pengantin**: nama, panggilan, orang tua, foto, Instagram, deskripsi.
- **Informasi acara**: tambah, edit, hapus, tanggal, waktu, tempat, Maps, dress code.
- **Our Story**: tambah, hapus, ubah urutan, upload foto per chapter, pilih foto dari galeri, dan preview foto utama.
- **Galeri**: upload, progress, caption, alt text, urutan, delete.
- **Video/Musik**: URL media dan preview player.
- **Lokasi dan peta**: latitude, longitude, link Maps.
- **Buku tamu**: tampilkan/sembunyikan dan hapus ucapan.
- **RSVP**: distribusi status dan daftar tamu.
- **Daftar tamu**: tambah/edit/hapus, cari/filter, link personal, WhatsApp, export.
- **Import Excel**: template, preview, skip/overwrite, failure report.
- **Rekening dan hadiah**: bank, QRIS, alamat pengiriman.
- **Tema & UI/UX Layout**: enam tema visual dan lima layout pengalaman. Admin dapat mengatur warna, font, cover, navigasi, galeri, Our Story, hero, surface, corner, mode, serta preview langsung.
- **Pengaturan**: slug, status, tanggal, copy, SEO, Open Graph, WhatsApp template.
- **Preview**: mobile/tablet/desktop iframe.
- **Statistik**: visitor trend dan RSVP conversion.

## Link personal

Format publik:

```text
https://domain.id/invite/nathan-dan-aulia?to=Bapak%20Andi%20dan%20Keluarga
```

Nama tamu tidak dimasukkan ke metadata publik sehingga tidak bocor pada Open Graph/canonical URL.

## Upload media

Alt text wajib diisi secara bermakna. Jangan memakai nama file seperti `IMG_1234` sebagai alt text. Untuk LCP terbaik, gunakan image Cloudinary yang sudah dikompresi dan tidak lebih besar dari kebutuhan display.

## Publish

Ubah status menjadi `published`, simpan, buka preview tab baru, dan cek desktop/mobile sebelum membagikan link.

## Mengganti tema

1. Buka **Tema & UI/UX Layout**.
2. Pilih satu dari lima layout UI/UX. Konten undangan tidak berubah.
3. Pilih salah satu dari enam tema visual. Layout yang sudah dipilih tetap dipertahankan.
4. Sesuaikan cover, navigasi, galeri, Our Story, warna, tipografi, ornamen, gaya hero, permukaan, bentuk sudut, mode, atau intensitas animasi.
5. Periksa **Preview langsung** di sisi kanan.
6. Klik **Simpan**. Pada Supabase aktif, konfigurasi disimpan ke `weddings.theme_config`; pada mode demo, draft disimpan di browser dan langsung digunakan pada halaman undangan di browser yang sama.
7. Gunakan **Full preview** untuk membuka undangan pada tab baru.

## Mengelola Our Story

1. Buka menu **Our Story**.
2. Tambahkan chapter atau ubah judul, tanggal, dan isi cerita.
3. Upload foto chapter melalui Cloudinary, tempel URL gambar, atau pilih gambar yang sudah ada di galeri.
4. Atur urutan dengan tombol naik/turun.
5. Klik **Simpan**, lalu cek hasilnya pada Preview.

Halaman publik otomatis memberikan efek parallax lembut, foto polaroid pendamping, reveal bergantian, dan garis timeline progres. Efek berkurang otomatis ketika perangkat menggunakan `prefers-reduced-motion`.

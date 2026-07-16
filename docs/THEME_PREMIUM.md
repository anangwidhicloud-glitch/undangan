# Theme & UI/UX Layout Builder v1.4

Versi 1.4 memisahkan mesin tema visual dari mesin UI/UX layout di admin panel. Perubahan tema tidak membuat salinan halaman dan tidak mengubah isi undangan; seluruh preset menggunakan komponen, data Supabase, media, RSVP, dan navigasi yang sama.

## Enam preset

1. **Luxury Gold** — olive gelap, ivory, emas, editorial sinematik.
2. **Modern Botanical** — hijau sage, bentuk organik, hero split.
3. **Elegant Nusantara** — marun, tembaga, motif batik lembut, royal heritage.
4. **Romantic Blush** — dusty blush, rosewood, floral lembut.
5. **Midnight Silver** — biru malam, perak, detail geometris dan gala modern.
6. **Ivory Minimal** — ivory, charcoal, champagne, komposisi minimal.

## Pengaturan yang dapat diubah

- Primary, secondary, accent, text, surface, dan muted color.
- Font heading dan font body.
- Layout: editorial, botanical, heritage, classic, atau minimal.
- Ornamen: gold lines, botanical, batik, floral, geometric, atau minimal.
- Hero: cinematic, split editorial, royal, atau soft romantic.
- Surface: glass, paper, atau clean.
- Corner: soft, round, atau classic.
- Mode light/dark dan intensitas animasi.

## Preview dan penyimpanan

Theme Manager menampilkan preview mobile secara langsung sebelum disimpan. Pada Supabase aktif, konfigurasi disimpan sebagai JSONB pada `weddings.theme_config`. Pada mode demo, konfigurasi disimpan ke localStorage dan dibaca oleh halaman publik pada browser yang sama.

## Arsitektur

- Definisi preset: `src/config/theme-presets.ts`
- Tipe tema: `src/types/wedding.ts`
- Admin Theme Manager: `src/components/admin/AdminDashboard.tsx`
- Runtime tema publik: `src/components/invitation/InvitationExperience.tsx`
- Styling preset: `src/app/globals.css`
- Normalisasi data lama: `src/lib/content-resolver.ts`

## Kompatibilitas data lama

Konfigurasi lama yang hanya memiliki empat warna tetap dapat digunakan. Resolver menggabungkan data lama dengan default preset yang sesuai, sehingga field baru tidak menyebabkan halaman atau admin crash.

## Preview

Lihat:

- `docs/screenshots/06-theme-manager-admin.png`
- `docs/screenshots/07-romantic-blush-mobile.png`
- `docs/screenshots/08-modern-botanical-mobile.png`

## Lima preset UI/UX

- `cinematic-editorial`: curtain, cinematic hero, masonry, cinematic story, floating dock.
- `classic-invitation`: paper cover, soft hero, classic grid, vertical timeline, top bar.
- `storytelling-journey`: envelope, split hero, filmstrip, zig-zag story, side dots.
- `modern-minimal`: door reveal, split hero, slideshow, polaroid story, compact menu.
- `cultural-heritage`: floral reveal, royal hero, polaroid gallery, scrapbook story, minimal navigation.

Definisi layout berada di `src/config/layout-presets.ts`. Runtime publik menggunakan data attributes agar setiap layout dapat mengubah struktur interaksi tanpa menduplikasi seluruh halaman.

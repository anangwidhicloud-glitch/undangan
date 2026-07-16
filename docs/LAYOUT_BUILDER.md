# UI/UX Layout Builder

## Tujuan

Layout Builder memungkinkan admin mengubah pengalaman undangan tanpa mengubah data. Tema mengatur warna dan karakter visual; layout mengatur cover, hero, navigasi, galeri, dan Our Story.

## Preset

1. Cinematic Editorial
2. Classic Invitation
3. Storytelling Journey
4. Modern Minimal
5. Cultural Heritage

## Penyimpanan

Konfigurasi disimpan sebagai JSONB pada `weddings.theme_config`. Field utama: `layoutPreset`, `coverStyle`, `navigationStyle`, `galleryStyle`, dan `storyStyle`. Mode demo menyimpan konfigurasi yang sama ke localStorage.

## Menambahkan layout baru

1. Tambahkan ID ke `LayoutPresetId` pada `src/types/wedding.ts`.
2. Tambahkan definisi di `src/config/layout-presets.ts`.
3. Tambahkan styling khusus pada `src/app/globals.css` jika diperlukan.
4. Pastikan komponen navigasi, galeri, dan Our Story mendukung variant baru.
5. Tambahkan unit test dan smoke test.

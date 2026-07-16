# Import Daftar Tamu

## Template

Unduh dari admin atau buka:

`public/templates/template-daftar-tamu.xlsx`

Kolom:

| Kolom              | Aturan                                           |
| ------------------ | ------------------------------------------------ |
| `name`             | wajib, minimal 2 karakter                        |
| `greeting`         | sapaan, contoh Bapak/Ibu                         |
| `phone`            | opsional; 08, 8, +62, dan 62 dinormalisasi ke 62 |
| `group`            | kategori tamu                                    |
| `invitation_quota` | integer 1–20                                     |
| `notes`            | catatan opsional                                 |

## Proses

1. Pilih file `.xlsx` atau `.xls`, maksimal 5 MB.
2. Parser membaca sheet pertama dan maksimal 1.000 baris.
3. Preview memisahkan data valid dan bermasalah.
4. Duplikat dalam file ditandai berdasarkan kombinasi lowercase name + phone.
5. Pilih **Lewati duplikat** atau **Timpa duplikat**.
6. Import data valid.
7. Download laporan gagal bila tersedia.

## Keamanan

Proyek menggunakan API SheetJS 0.20.3 melalui npm alias `@e965/xlsx`, bukan paket registry `xlsx@0.18.5` yang memiliki advisory lama. File tetap dibatasi ukuran dan jumlah baris untuk mengurangi risiko resource exhaustion.

## Format WhatsApp

- `081234567890` → `6281234567890`
- `81234567890` → `6281234567890`
- `+62 812-3456-7890` → `6281234567890`

Nomor selain pola Indonesia dibiarkan sebagai digit dan dapat ditandai invalid oleh schema bila panjang/prefix tidak sesuai.

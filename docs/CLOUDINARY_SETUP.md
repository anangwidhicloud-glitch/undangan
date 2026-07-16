# Setup Cloudinary

## Environment

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=cloud-name
CLOUDINARY_API_KEY=api-key
CLOUDINARY_API_SECRET=api-secret
CLOUDINARY_UPLOAD_FOLDER=wedding-invitation
```

API secret tidak boleh memakai prefix `NEXT_PUBLIC_`.

## Alur upload

1. Admin yang memiliki session mengirim multipart file ke `/api/cloudinary/upload`.
2. Server memeriksa same-origin, session, rate limit, MIME type, dan ukuran.
3. Buffer dikirim ke Cloudinary Node SDK dengan authenticated upload.
4. Client hanya menerima `secure_url`, `public_id`, resource type, dan thumbnail.
5. Metadata media disimpan saat admin menekan **Simpan**.

Batas default:

- JPEG, PNG, WebP, AVIF: 8 MB
- MP4, WebM, QuickTime/MOV: 50 MB

Validasi memakai MIME type dari browser dan pembatasan ukuran. Untuk sistem dengan ancaman lebih tinggi, tambahkan magic-byte inspection dan antivirus scanning sebelum upload.

## Hapus media

Endpoint `/api/cloudinary/delete` menerima `publicId` yang dibatasi regex dan `resourceType`. Endpoint memerlukan admin session dan same-origin request.

## Optimasi

`src/lib/cloudinary/index.ts` menyediakan:

- optimized image URL dengan `f_auto`, `q_auto`, dan width
- video thumbnail dari frame awal
- upload image/video
- delete + CDN invalidation

## Production checklist

- Restrict API key pada akun Cloudinary bila fitur tersedia.
- Gunakan folder berbeda per wedding/tenant.
- Aktifkan backup Cloudinary.
- Terapkan moderation bila admin diberikan kepada pihak eksternal.
- Jangan log request body atau credential.

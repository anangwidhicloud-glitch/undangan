import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth/session';
import { uploadBuffer, videoThumbnailUrl } from '@/lib/cloudinary';
import { checkRateLimit, getRequestFingerprint } from '@/lib/rate-limit';
import { assertSameOrigin } from '@/lib/security';

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/wav',
  'audio/ogg',
]);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!assertSameOrigin(request))
    return NextResponse.json(
      { message: 'Origin tidak valid.' },
      { status: 403 },
    );
  if (
    !checkRateLimit(`upload:${getRequestFingerprint(request)}`, 15, 60 * 60_000)
      .allowed
  )
    return NextResponse.json(
      { message: 'Batas upload tercapai.' },
      { status: 429 },
    );
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File))
    return NextResponse.json(
      { message: 'File tidak ditemukan.' },
      { status: 400 },
    );
  const mediaKind = IMAGE_TYPES.has(file.type)
    ? 'image'
    : VIDEO_TYPES.has(file.type)
      ? 'video'
      : AUDIO_TYPES.has(file.type)
        ? 'audio'
        : null;
  const resourceType =
    mediaKind === 'image' ? 'image' : mediaKind ? 'video' : null;
  if (!resourceType)
    return NextResponse.json(
      { message: 'Tipe file tidak didukung.' },
      { status: 415 },
    );
  const maxSize =
    mediaKind === 'image'
      ? 8 * 1024 * 1024
      : mediaKind === 'audio'
        ? 20 * 1024 * 1024
        : 50 * 1024 * 1024;
  if (file.size > maxSize)
    return NextResponse.json(
      {
        message: `Ukuran maksimum ${mediaKind === 'image' ? '8 MB' : mediaKind === 'audio' ? '20 MB' : '50 MB'}.`,
      },
      { status: 413 },
    );
  try {
    const result = await uploadBuffer(
      Buffer.from(await file.arrayBuffer()),
      resourceType,
    );
    return NextResponse.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType,
      mediaKind,
      thumbnailUrl:
        mediaKind === 'video'
          ? videoThumbnailUrl(result.secure_url)
          : result.secure_url,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Upload gagal.' },
      { status: 503 },
    );
  }
}

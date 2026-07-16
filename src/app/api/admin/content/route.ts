import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminAuthenticated } from '@/lib/auth/session';
import { assertSameOrigin } from '@/lib/security';
import { resolveWeddingContent } from '@/lib/content-resolver';
import {
  getWeddingContent,
  saveWeddingSnapshot,
} from '@/services/content-service';

const snapshotSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string().regex(/^[a-z0-9-]{3,100}$/),
    title: z.string().min(3).max(160),
    status: z.enum(['draft', 'published']),
    eventDate: z.string().min(10),
  })
  .passthrough();

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const slug =
    new URL(request.url).searchParams.get('slug') ||
    process.env.NEXT_PUBLIC_DEFAULT_WEDDING_SLUG ||
    'nathan-dan-aulia';
  const result = await getWeddingContent(slug);
  return NextResponse.json(result);
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!assertSameOrigin(request))
    return NextResponse.json(
      { message: 'Origin tidak valid.' },
      { status: 403 },
    );
  const parsed = snapshotSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || 'Konten tidak valid.' },
      { status: 400 },
    );
  try {
    const content = resolveWeddingContent(parsed.data);
    const result = await saveWeddingSnapshot(content);
    return NextResponse.json({ ok: true, ...result, content });
  } catch {
    return NextResponse.json(
      { message: 'Konten belum dapat disimpan ke database.' },
      { status: 500 },
    );
  }
}

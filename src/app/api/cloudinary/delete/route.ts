import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminAuthenticated } from '@/lib/auth/session';
import { deleteCloudinaryAsset } from '@/lib/cloudinary';
import { assertSameOrigin } from '@/lib/security';
const schema = z.object({
  publicId: z
    .string()
    .min(1)
    .max(300)
    .regex(/^[a-zA-Z0-9/_-]+$/),
  resourceType: z.enum(['image', 'video']),
});
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated()))
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!assertSameOrigin(request))
    return NextResponse.json(
      { message: 'Origin tidak valid.' },
      { status: 403 },
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { message: 'Data media tidak valid.' },
      { status: 400 },
    );
  try {
    await deleteCloudinaryAsset(parsed.data.publicId, parsed.data.resourceType);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Gagal menghapus media.',
      },
      { status: 503 },
    );
  }
}

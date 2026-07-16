import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  adminCookieOptions,
  ADMIN_SESSION_COOKIE,
  createAdminSession,
} from '@/lib/auth/session';
import { verifyAdminCredentials } from '@/lib/auth/credentials';
import { getAdminConfigurationError } from '@/lib/env';
import { checkRateLimit, getRequestFingerprint } from '@/lib/rate-limit';
import { assertSameOrigin } from '@/lib/security';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  if (!assertSameOrigin(request))
    return NextResponse.json(
      { message: 'Origin tidak valid.' },
      { status: 403 },
    );
  const configError = getAdminConfigurationError();
  if (configError)
    return NextResponse.json({ message: configError }, { status: 503 });
  const limit = checkRateLimit(
    `login:${getRequestFingerprint(request)}`,
    5,
    15 * 60_000,
  );
  if (!limit.allowed)
    return NextResponse.json(
      { message: 'Terlalu banyak percobaan. Coba lagi beberapa saat.' },
      { status: 429 },
    );

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { message: 'Email atau password tidak valid.' },
      { status: 400 },
    );
  const valid = await verifyAdminCredentials(
    parsed.data.email,
    parsed.data.password,
  );
  if (!valid)
    return NextResponse.json(
      { message: 'Email atau password salah.' },
      { status: 401 },
    );

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    await createAdminSession(parsed.data.email),
    adminCookieOptions,
  );
  return response;
}

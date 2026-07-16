import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/session';
import { assertSameOrigin } from '@/lib/security';
export async function POST(request: Request) {
  if (!assertSameOrigin(request))
    return NextResponse.json(
      { message: 'Origin tidak valid.' },
      { status: 403 },
    );
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });
  return response;
}

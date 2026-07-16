import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/auth/session';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/admin/login' || path.startsWith('/api/auth/'))
    return NextResponse.next();

  const valid = await verifyAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (path.startsWith('/admin') && !valid) {
    const login = request.nextUrl.clone();
    login.pathname = '/admin/login';
    login.searchParams.set('next', path);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

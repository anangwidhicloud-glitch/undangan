import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/lib/env';

export const ADMIN_SESSION_COOKIE = 'wedding_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 8;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(
    env.ADMIN_SESSION_SECRET ?? 'missing-session-secret-change-this-value-now',
  );
}

export async function createAdminSession(email: string): Promise<string> {
  return new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .setIssuer('wedding-invitation')
    .setAudience('admin')
    .sign(secretKey());
}

export async function verifyAdminSession(
  token?: string | null,
): Promise<boolean> {
  if (!token || !env.ADMIN_SESSION_SECRET) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: 'wedding-invitation',
      audience: 'admin',
    });
    return payload.role === 'admin' && payload.email === env.ADMIN_EMAIL;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value);
}

const localHttpApp = /^http:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i.test(
  env.NEXT_PUBLIC_APP_URL ?? '',
);

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' && !localHttpApp,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
};

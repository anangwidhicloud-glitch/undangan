import { timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '@/lib/env';

function safeStringEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  if (
    !env.ADMIN_EMAIL ||
    !safeStringEqual(email.toLowerCase(), env.ADMIN_EMAIL.toLowerCase())
  )
    return false;
  if (env.ADMIN_PASSWORD_HASH)
    return bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
  return env.ADMIN_PASSWORD
    ? safeStringEqual(password, env.ADMIN_PASSWORD)
    : false;
}

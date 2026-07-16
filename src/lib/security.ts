import { createHash } from 'node:crypto';

function firstHeaderValue(value: string | null): string | null {
  return value?.split(',')[0]?.trim() || null;
}

export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    if (!['http:', 'https:'].includes(originUrl.protocol)) return false;

    const forwardedHost = firstHeaderValue(
      request.headers.get('x-forwarded-host'),
    );
    const requestHost =
      forwardedHost || request.headers.get('host') || new URL(request.url).host;
    if (originUrl.host !== requestHost) return false;

    const forwardedProto = firstHeaderValue(
      request.headers.get('x-forwarded-proto'),
    );
    return !forwardedProto || originUrl.protocol === `${forwardedProto}:`;
  } catch {
    return false;
  }
}

export function hashIp(value: string): string {
  const salt = process.env.ADMIN_SESSION_SECRET ?? 'demo-ip-salt';
  return createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

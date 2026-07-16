import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { checkRateLimit, getRequestFingerprint } from '@/lib/rate-limit';
import { hashIp } from '@/lib/security';

const schema = z.object({
  weddingId: z.string().uuid(),
  pagePath: z.string().max(200),
});
export async function POST(request: Request) {
  const fingerprint = getRequestFingerprint(request);
  if (!checkRateLimit(`visitor:${fingerprint}`, 10, 60_000).allowed)
    return NextResponse.json({ ok: true });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  const supabase = getSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });
  const userAgent = request.headers.get('user-agent') || '';
  const deviceType = /mobile|android|iphone/i.test(userAgent)
    ? 'mobile'
    : /tablet|ipad/i.test(userAgent)
      ? 'tablet'
      : 'desktop';
  const forwarded =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  await supabase.from('visitor_logs').insert({
    wedding_id: parsed.data.weddingId,
    session_id: crypto.randomUUID(),
    page_path: parsed.data.pagePath,
    referrer: request.headers.get('referer'),
    device_type: deviceType,
    browser: userAgent.slice(0, 120),
    ip_hash: hashIp(forwarded),
  });
  return NextResponse.json({ ok: true, mode: 'supabase' });
}

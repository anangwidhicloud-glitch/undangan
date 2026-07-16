import { NextResponse } from 'next/server';
import sanitizeHtml from 'sanitize-html';
import { rsvpSchema } from '@/lib/validations/rsvp';
import { checkRateLimit, getRequestFingerprint } from '@/lib/rate-limit';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { hashIp } from '@/lib/security';

export async function POST(request: Request) {
  const fingerprint = getRequestFingerprint(request);
  const limit = checkRateLimit(`rsvp:${fingerprint}`, 4, 10 * 60_000);
  if (!limit.allowed)
    return NextResponse.json(
      { message: 'Terlalu banyak pengiriman RSVP.' },
      { status: 429 },
    );
  const parsed = rsvpSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || 'Data RSVP tidak valid.' },
      { status: 400 },
    );
  const cleanMessage = sanitizeHtml(parsed.data.message, {
    allowedTags: [],
    allowedAttributes: {},
  });
  const cleanName = sanitizeHtml(parsed.data.guestName, {
    allowedTags: [],
    allowedAttributes: {},
  });
  const supabase = getSupabaseServiceClient();
  if (!supabase) return NextResponse.json({ ok: true, mode: 'demo' });

  const forwarded =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const row = {
    wedding_id: parsed.data.weddingId,
    guest_id: parsed.data.guestId || null,
    guest_name: cleanName,
    attendance_status: parsed.data.attendanceStatus,
    guest_count: parsed.data.guestCount,
    phone: parsed.data.phone || null,
    message: cleanMessage,
    ip_hash: hashIp(forwarded),
    user_agent: (request.headers.get('user-agent') || '').slice(0, 500),
  };
  const { error } = await supabase.from('rsvps').insert(row);
  if (error)
    return NextResponse.json(
      { message: 'RSVP belum dapat disimpan.' },
      { status: 500 },
    );
  await supabase.from('guest_messages').insert({
    wedding_id: parsed.data.weddingId,
    guest_id: parsed.data.guestId || null,
    guest_name: cleanName,
    message: cleanMessage,
    attendance_status: parsed.data.attendanceStatus,
    is_approved: true,
  });
  return NextResponse.json({ ok: true, mode: 'supabase' });
}

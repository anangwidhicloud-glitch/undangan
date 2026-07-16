import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminAuthenticated } from '@/lib/auth/session';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { assertSameOrigin } from '@/lib/security';

const guestSchema = z.object({
  name: z.string().min(2).max(120),
  greeting: z.string().max(60),
  phone: z.string().max(20),
  group: z.string().max(60),
  invitation_quota: z.number().int().min(1).max(20),
  notes: z.string().max(500),
  slug: z.string().max(140),
});

const schema = z.object({
  weddingId: z.string().uuid(),
  mode: z.enum(['skip', 'overwrite']),
  guests: z.array(guestSchema).max(1000),
});

type ExistingGuest = {
  id: string;
  name: string;
  greeting: string;
  phone: string | null;
  guest_group: string;
  invitation_quota: number;
  slug: string;
  token: string;
  invitation_status: string;
  rsvp_status: string;
  notes: string | null;
};

function normalizeText(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizePhone(value: string | null | undefined) {
  return (value ?? '').replace(/\D/g, '');
}

function findDuplicate(
  existing: ExistingGuest[],
  incoming: z.infer<typeof guestSchema>,
) {
  const incomingSlug = normalizeText(incoming.slug);
  const incomingPhone = normalizePhone(incoming.phone);
  const incomingName = normalizeText(incoming.name);

  return existing.find((guest) => {
    const sameSlug =
      incomingSlug.length > 0 && normalizeText(guest.slug) === incomingSlug;
    const samePhone =
      incomingPhone.length > 0 && normalizePhone(guest.phone) === incomingPhone;
    const sameName = normalizeText(guest.name) === incomingName;
    return sameSlug || samePhone || sameName;
  });
}

function toClientGuest(guest: ExistingGuest) {
  return {
    id: guest.id,
    name: guest.name,
    greeting: guest.greeting,
    phone: guest.phone ?? '',
    group: guest.guest_group,
    invitationQuota: guest.invitation_quota,
    slug: guest.slug,
    token: guest.token,
    invitationStatus: guest.invitation_status,
    rsvpStatus: guest.rsvp_status,
    notes: guest.notes ?? undefined,
  };
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { message: 'Origin tidak valid.' },
      { status: 403 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Data import tidak valid.' },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      mode: 'demo',
      imported: parsed.data.guests.length,
      updated: 0,
      skipped: 0,
    });
  }

  const { data: existingData, error: existingError } = await supabase
    .from('guests')
    .select(
      'id,name,greeting,phone,guest_group,invitation_quota,slug,token,invitation_status,rsvp_status,notes',
    )
    .eq('wedding_id', parsed.data.weddingId);

  if (existingError) {
    return NextResponse.json(
      { message: existingError.message },
      { status: 500 },
    );
  }

  const existing = (existingData ?? []) as ExistingGuest[];
  const rowsToWrite: Array<Record<string, unknown>> = [];
  let skipped = 0;
  let updated = 0;
  let imported = 0;

  for (const guest of parsed.data.guests) {
    const duplicate = findDuplicate(existing, guest);

    if (duplicate && parsed.data.mode === 'skip') {
      skipped += 1;
      continue;
    }

    if (duplicate) {
      updated += 1;
      rowsToWrite.push({
        id: duplicate.id,
        wedding_id: parsed.data.weddingId,
        name: guest.name.trim(),
        greeting: guest.greeting.trim(),
        phone: guest.phone || null,
        guest_group: guest.group.trim(),
        invitation_quota: guest.invitation_quota,
        slug: guest.slug,
        token: duplicate.token,
        invitation_status: duplicate.invitation_status,
        rsvp_status: duplicate.rsvp_status,
        notes: guest.notes,
        updated_at: new Date().toISOString(),
      });
      continue;
    }

    imported += 1;
    const newRow = {
      id: crypto.randomUUID(),
      wedding_id: parsed.data.weddingId,
      name: guest.name.trim(),
      greeting: guest.greeting.trim(),
      phone: guest.phone || null,
      guest_group: guest.group.trim(),
      invitation_quota: guest.invitation_quota,
      slug: guest.slug,
      token: crypto.randomUUID(),
      invitation_status: 'belum_dikirim',
      rsvp_status: 'belum',
      notes: guest.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    rowsToWrite.push(newRow);
    existing.push(newRow as ExistingGuest);
  }

  if (rowsToWrite.length > 0) {
    const { error: writeError } = await supabase
      .from('guests')
      .upsert(rowsToWrite, { onConflict: 'id' });

    if (writeError) {
      return NextResponse.json(
        { message: writeError.message },
        { status: 409 },
      );
    }
  }

  const { data: finalData, error: finalError } = await supabase
    .from('guests')
    .select(
      'id,name,greeting,phone,guest_group,invitation_quota,slug,token,invitation_status,rsvp_status,notes',
    )
    .eq('wedding_id', parsed.data.weddingId)
    .order('created_at', { ascending: true });

  if (finalError) {
    return NextResponse.json(
      { message: finalError.message },
      { status: 500 },
    );
  }

  const finalGuests = ((finalData ?? []) as ExistingGuest[]).map(toClientGuest);

  const { data: snapshotRow } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('wedding_id', parsed.data.weddingId)
    .eq('setting_key', 'content_snapshot')
    .maybeSingle();

  if (
    snapshotRow?.setting_value &&
    typeof snapshotRow.setting_value === 'object' &&
    !Array.isArray(snapshotRow.setting_value)
  ) {
    const nextSnapshot = {
      ...(snapshotRow.setting_value as Record<string, unknown>),
      guests: finalGuests,
    };

    const { error: snapshotError } = await supabase
      .from('site_settings')
      .upsert(
        {
          wedding_id: parsed.data.weddingId,
          setting_key: 'content_snapshot',
          setting_value: nextSnapshot,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'wedding_id,setting_key' },
      );

    if (snapshotError) {
      return NextResponse.json(
        { message: snapshotError.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    mode: 'supabase',
    imported,
    updated,
    skipped,
    guests: finalGuests,
  });
}

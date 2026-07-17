import { FALLBACK_CONTENT } from '@/config/fallback-content';
import { resolveWeddingContent } from '@/lib/content-resolver';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import type { RsvpRecord, WeddingContent } from '@/types/wedding';

function mapRsvps(rows: Record<string, unknown>[]): RsvpRecord[] {
  return rows.map((item) => ({
    id: String(item.id),
    guestId: typeof item.guest_id === 'string' ? item.guest_id : undefined,
    guestName: String(item.guest_name ?? 'Tamu'),
    attendanceStatus: item.attendance_status as RsvpRecord['attendanceStatus'],
    guestCount: Number(item.guest_count ?? 0),
    phone: typeof item.phone === 'string' ? item.phone : undefined,
    message: typeof item.message === 'string' ? item.message : undefined,
    createdAt: String(item.created_at ?? ''),
    updatedAt: typeof item.updated_at === 'string' ? item.updated_at : undefined,
  }));
}

export async function getWeddingContent(
  slug: string,
): Promise<{ content: WeddingContent; source: 'supabase' | 'fallback' }> {
  const supabase = getSupabaseServiceClient();
  if (!supabase)
    return {
      content: resolveWeddingContent({ ...FALLBACK_CONTENT, slug }),
      source: 'fallback',
    };

  try {
    const { data: wedding, error } = await supabase
      .from('weddings')
      .select(
        'id, slug, title, groom_name, bride_name, event_date, timezone, status, theme_config, seo_config',
      )
      .eq('slug', slug)
      .maybeSingle();

    if (error || !wedding)
      return {
        content: resolveWeddingContent({ ...FALLBACK_CONTENT, slug }),
        source: 'fallback',
      };

    const [snapshotResult, rsvpsResult, freshMessagesResult] =
  await Promise.all([
  supabase
    .from('site_settings')
    .select('setting_value')
    .eq('wedding_id', wedding.id)
    .eq('setting_key', 'content_snapshot')
    .maybeSingle(),

  supabase
    .from('rsvps')
    .select(
      'id, guest_id, guest_name, attendance_status, guest_count, phone, message, created_at, updated_at',
    )
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })
    .limit(500),

  supabase
    .from('guest_messages')
    .select(
      'id, guest_name, message, attendance_status, is_approved, created_at',
    )
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })
    .limit(500),
]);

    const freshRsvps = mapRsvps(
      (rsvpsResult.data ?? []) as Record<string, unknown>[],
    );

    const freshMessages = (freshMessagesResult.data ?? []).map((item) => ({
  id: item.id,
  guestName: item.guest_name,
  message: item.message,
  attendanceStatus: item.attendance_status,
  approved: item.is_approved,
  createdAt: item.created_at,
}));

    const snapshot = snapshotResult.data?.setting_value;
    if (snapshot && typeof snapshot === 'object') {
      return {
content: resolveWeddingContent({
  ...(snapshot as Partial<WeddingContent>),
  rsvps: freshRsvps,
  messages: freshMessages,
}),
        source: 'supabase',
      };
    }

    const [
      couplesResult,
      eventsResult,
      storiesResult,
      mediaResult,
      giftsResult,
      guestsResult,
      messagesResult,
      settingsResult,
    ] = await Promise.all([
      supabase
        .from('couples')
        .select('*')
        .eq('wedding_id', wedding.id)
        .order('sort_order'),
      supabase
        .from('events')
        .select('*')
        .eq('wedding_id', wedding.id)
        .order('sort_order'),
      supabase
        .from('love_stories')
        .select('*')
        .eq('wedding_id', wedding.id)
        .order('sort_order'),
      supabase
        .from('media')
        .select('*')
        .eq('wedding_id', wedding.id)
        .order('sort_order'),
      supabase
        .from('gift_accounts')
        .select('*')
        .eq('wedding_id', wedding.id)
        .order('sort_order'),
      supabase
        .from('guests')
        .select('*')
        .eq('wedding_id', wedding.id)
        .order('created_at', { ascending: false })
        .limit(1000),
      supabase
        .from('guest_messages')
        .select('*')
        .eq('wedding_id', wedding.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('wedding_id', wedding.id),
    ]);

    const settings = Object.fromEntries(
      (settingsResult.data ?? []).map((item) => [
        item.setting_key,
        item.setting_value,
      ]),
    ) as Record<string, unknown>;
    const mediaRows = mediaResult.data ?? [];
    const video = mediaRows.find((item) => item.media_type === 'video');
    const audio = mediaRows.find((item) => item.media_type === 'audio');

    const partial: Partial<WeddingContent> = {
      id: wedding.id,
      slug: wedding.slug,
      title: wedding.title,
      groomName: wedding.groom_name,
      brideName: wedding.bride_name,
      eventDate: wedding.event_date,
      timezone: wedding.timezone,
      status: wedding.status,
      theme: wedding.theme_config,
      seo: wedding.seo_config,
      rsvps: freshRsvps,
      couples: couplesResult.data?.map((item) => ({
        id: item.id,
        role: item.role,
        fullName: item.full_name,
        nickname: item.nickname,
        parentNames: item.parent_names,
        photoUrl: item.photo_url,
        instagramUrl: item.instagram_url,
        description: item.description,
        sortOrder: item.sort_order,
      })),
      events: eventsResult.data?.map((item) => ({
        id: item.id,
        eventType: item.event_type,
        title: item.title,
        date: item.event_date,
        startTime: item.start_time,
        endTime: item.end_time,
        timezone: item.timezone,
        venueName: item.venue_name,
        address: item.address,
        latitude: item.latitude,
        longitude: item.longitude,
        googleMapsUrl: item.google_maps_url,
        dressCode: item.dress_code,
        notes: item.notes,
        sortOrder: item.sort_order,
      })),
      loveStories: storiesResult.data?.map((item) => ({
        id: item.id,
        title: item.title,
        story: item.story,
        date: item.story_date,
        imageUrl: item.image_url,
        sortOrder: item.sort_order,
      })),
      media: mediaResult.data?.map((item) => ({
        id: item.id,
        type: item.media_type,
        url: item.url,
        cloudinaryPublicId: item.cloudinary_public_id,
        thumbnailUrl: item.thumbnail_url,
        caption: item.caption,
        altText: item.alt_text,
        featured: item.is_featured,
        sortOrder: item.sort_order,
      })),
      gifts: giftsResult.data?.map((item) => ({
        id: item.id,
        giftType: item.gift_type,
        bankName: item.bank_name,
        accountNumber: item.account_number,
        accountHolder: item.account_holder,
        qrisUrl: item.qris_url,
        shippingAddress: item.shipping_address,
        sortOrder: item.sort_order,
      })),
      guests: guestsResult.data?.map((item) => ({
        id: item.id,
        name: item.name,
        greeting: item.greeting,
        phone: item.phone ?? '',
        group: item.guest_group ?? 'Umum',
        invitationQuota: item.invitation_quota ?? 1,
        slug: item.slug,
        token: item.token,
        invitationStatus: item.invitation_status,
        rsvpStatus: item.rsvp_status ?? 'belum',
        notes: item.notes,
        firstOpenedAt: item.first_opened_at,
        lastOpenedAt: item.last_opened_at,
      })),
      messages: messagesResult.data?.map((item) => ({
        id: item.id,
        guestName: item.guest_name,
        message: item.message,
        attendanceStatus: item.attendance_status,
        approved: item.is_approved,
        createdAt: item.created_at,
      })),
      quote: typeof settings.quote === 'string' ? settings.quote : undefined,
      thankYouMessage:
        typeof settings.thank_you_message === 'string'
          ? settings.thank_you_message
          : undefined,
      pastEventMessage:
        typeof settings.past_event_message === 'string'
          ? settings.past_event_message
          : undefined,
      heroImageUrl:
        typeof settings.hero_image_url === 'string'
          ? settings.hero_image_url
          : undefined,
      musicTitle:
        typeof settings.music_title === 'string'
          ? settings.music_title
          : undefined,
      whatsappTemplate:
        typeof settings.whatsapp_template === 'string'
          ? settings.whatsapp_template
          : undefined,
      videoUrl: video?.url,
      videoPosterUrl: video?.thumbnail_url,
      musicUrl: audio?.url,
    };

    return { content: resolveWeddingContent(partial), source: 'supabase' };
  } catch {
    return {
      content: resolveWeddingContent({ ...FALLBACK_CONTENT, slug }),
      source: 'fallback',
    };
  }
}

export async function saveWeddingSnapshot(
  content: WeddingContent,
): Promise<{ mode: 'supabase' | 'demo' }> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { mode: 'demo' };

  const { error: weddingError } = await supabase.from('weddings').upsert({
    id: content.id,
    slug: content.slug,
    title: content.title,
    groom_name: content.groomName,
    bride_name: content.brideName,
    event_date: content.eventDate,
    timezone: content.timezone,
    status: content.status,
    theme_config: content.theme,
    seo_config: content.seo,
    updated_at: new Date().toISOString(),
  });
  if (weddingError) throw weddingError;

  // RSVP selalu dibaca langsung dari tabel rsvps agar data dashboard tidak basi.
  const { rsvps: _rsvps, ...snapshotContent } = content;
  const { error: settingError } = await supabase.from('site_settings').upsert(
    {
      wedding_id: content.id,
      setting_key: 'content_snapshot',
      setting_value: snapshotContent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'wedding_id,setting_key' },
  );
  if (settingError) throw settingError;
  return { mode: 'supabase' };
}

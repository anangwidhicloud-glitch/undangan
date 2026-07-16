import { FALLBACK_CONTENT, FALLBACK_MEDIA } from '@/config/fallback-content';
import { resolveThemeConfig } from '@/config/theme-presets';
import type { WeddingContent } from '@/types/wedding';

export function isUsableValue(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return (
    Boolean(normalized) && !['null', 'undefined', 'nan'].includes(normalized)
  );
}

export function isUsableUrl(value: unknown): value is string {
  if (!isUsableValue(value)) return false;
  if (value.startsWith('/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function resolveMediaUrl(value: unknown, fallback: string): string {
  return isUsableUrl(value) ? value : fallback;
}

export function resolveWeddingContent(
  input?: Partial<WeddingContent> | null,
): WeddingContent {
  if (!input) return structuredClone(FALLBACK_CONTENT);
  const merged: WeddingContent = {
    ...structuredClone(FALLBACK_CONTENT),
    ...input,
    couples: input.couples?.length ? input.couples : FALLBACK_CONTENT.couples,
    events: input.events?.length ? input.events : FALLBACK_CONTENT.events,
    loveStories: input.loveStories?.length
      ? input.loveStories
      : FALLBACK_CONTENT.loveStories,
    media: input.media?.length ? input.media : FALLBACK_CONTENT.media,
    gifts: input.gifts?.length ? input.gifts : FALLBACK_CONTENT.gifts,
    guests: input.guests ?? FALLBACK_CONTENT.guests,
    messages: input.messages ?? FALLBACK_CONTENT.messages,
    theme: resolveThemeConfig(input.theme),
    seo: { ...FALLBACK_CONTENT.seo, ...(input.seo ?? {}) },
    heroImageUrl: resolveMediaUrl(input.heroImageUrl, FALLBACK_MEDIA.hero),
    videoUrl: resolveMediaUrl(input.videoUrl, FALLBACK_MEDIA.video),
    videoPosterUrl: resolveMediaUrl(
      input.videoPosterUrl,
      FALLBACK_MEDIA.videoPoster,
    ),
    musicUrl: resolveMediaUrl(input.musicUrl, FALLBACK_MEDIA.music),
  };

  merged.couples = merged.couples.map((couple, index) => ({
    ...couple,
    photoUrl: resolveMediaUrl(
      couple.photoUrl,
      index === 0 ? FALLBACK_MEDIA.groom : FALLBACK_MEDIA.bride,
    ),
  }));
  merged.loveStories = merged.loveStories.map((story, index) => ({
    ...story,
    imageUrl: resolveMediaUrl(
      story.imageUrl,
      FALLBACK_MEDIA.story[index % FALLBACK_MEDIA.story.length],
    ),
  }));
  merged.media = merged.media.map((media, index) => ({
    ...media,
    url: resolveMediaUrl(
      media.url,
      FALLBACK_MEDIA.gallery[index % FALLBACK_MEDIA.gallery.length],
    ),
    altText: isUsableValue(media.altText)
      ? media.altText
      : `Galeri pernikahan ${index + 1}`,
  }));
  return merged;
}

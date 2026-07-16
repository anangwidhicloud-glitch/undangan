import { describe, expect, it } from 'vitest';
import { FALLBACK_CONTENT, FALLBACK_MEDIA } from '@/config/fallback-content';
import {
  isUsableUrl,
  resolveMediaUrl,
  resolveWeddingContent,
} from '@/lib/content-resolver';

describe('content resolver', () => {
  it('menggunakan seluruh fallback ketika input kosong', () => {
    const result = resolveWeddingContent(null);
    expect(result.slug).toBe(FALLBACK_CONTENT.slug);
    expect(result.media).toHaveLength(6);
  });

  it.each([null, '', '   ', 'null', 'undefined', 'not a url'])(
    'mengganti URL media tidak valid: %s',
    (value) => {
      expect(resolveMediaUrl(value, FALLBACK_MEDIA.hero)).toBe(
        FALLBACK_MEDIA.hero,
      );
    },
  );

  it('mengganti gambar null serta alt text kosong tanpa loop fallback', () => {
    const result = resolveWeddingContent({
      heroImageUrl: 'null',
      couples: [{ ...FALLBACK_CONTENT.couples[0], photoUrl: 'undefined' }],
      media: [{ ...FALLBACK_CONTENT.media[0], url: ' ', altText: '' }],
    });
    expect(result.heroImageUrl).toBe(FALLBACK_MEDIA.hero);
    expect(result.couples[0].photoUrl).toBe(FALLBACK_MEDIA.groom);
    expect(result.media[0].url).toBe(FALLBACK_MEDIA.gallery[0]);
    expect(result.media[0].altText).toContain('Galeri pernikahan');
  });

  it('memberikan foto fallback untuk setiap chapter Our Story', () => {
    const result = resolveWeddingContent({
      loveStories: [
        { ...FALLBACK_CONTENT.loveStories[0], imageUrl: 'null' },
        { ...FALLBACK_CONTENT.loveStories[1], imageUrl: '' },
      ],
    });
    expect(result.loveStories[0].imageUrl).toBe(FALLBACK_MEDIA.story[0]);
    expect(result.loveStories[1].imageUrl).toBe(FALLBACK_MEDIA.story[1]);
  });

  it('menerima URL HTTPS dan path lokal', () => {
    expect(isUsableUrl('https://res.cloudinary.com/demo/image.jpg')).toBe(true);
    expect(isUsableUrl('/images/local.jpg')).toBe(true);
    expect(isUsableUrl('javascript:alert(1)')).toBe(false);
  });
});

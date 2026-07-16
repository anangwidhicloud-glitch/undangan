import { describe, expect, it } from 'vitest';
import { getWeddingContent } from '@/services/content-service';

describe('content service tanpa database', () => {
  it('tetap berjalan menggunakan fallback ketika Supabase belum dikonfigurasi', async () => {
    const result = await getWeddingContent('demo-tanpa-database');
    expect(result.source).toBe('fallback');
    expect(result.content.slug).toBe('demo-tanpa-database');
    expect(result.content.events.length).toBeGreaterThan(0);
  });
});

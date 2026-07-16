import { describe, expect, it } from 'vitest';
import {
  LAYOUT_PRESETS,
  getLayoutPreset,
  resolveLayoutConfig,
} from '@/config/layout-presets';

const navigationStyles = new Set([
  'floating-dock',
  'top-bar',
  'side-dots',
  'menu-button',
  'minimal',
]);

const galleryStyles = new Set([
  'masonry',
  'classic-grid',
  'polaroid',
  'filmstrip',
  'slideshow',
]);

const storyStyles = new Set([
  'cinematic',
  'vertical',
  'zigzag',
  'polaroid',
  'scrapbook',
]);

describe('UI/UX layout presets', () => {
  it('menyediakan lima layout unik dengan pengalaman yang berbeda', () => {
    expect(LAYOUT_PRESETS).toHaveLength(5);
    expect(new Set(LAYOUT_PRESETS.map((item) => item.id)).size).toBe(5);
    expect(
      new Set(LAYOUT_PRESETS.map((item) => item.config.coverStyle)).size,
    ).toBe(5);
    expect(
      new Set(LAYOUT_PRESETS.map((item) => item.config.navigationStyle)).size,
    ).toBe(5);
    expect(
      new Set(LAYOUT_PRESETS.map((item) => item.config.galleryStyle)).size,
    ).toBe(5);
    expect(
      new Set(LAYOUT_PRESETS.map((item) => item.config.storyStyle)).size,
    ).toBe(5);
  });

  it('setiap layout memakai konfigurasi UI yang valid', () => {
    for (const layout of LAYOUT_PRESETS) {
      expect(layout.config.layoutPreset).toBe(layout.id);
      expect(navigationStyles.has(layout.config.navigationStyle)).toBe(true);
      expect(galleryStyles.has(layout.config.galleryStyle)).toBe(true);
      expect(storyStyles.has(layout.config.storyStyle)).toBe(true);
      expect(layout.recommendedThemes.length).toBeGreaterThan(0);
    }
  });

  it('menggunakan cinematic editorial untuk data lama tanpa layoutPreset', () => {
    const result = resolveLayoutConfig({ preset: 'luxury-gold' });
    expect(result.layoutPreset).toBe('cinematic-editorial');
    expect(result.navigationStyle).toBe('floating-dock');
  });

  it('mempertahankan kustomisasi komponen di atas preset layout', () => {
    const result = resolveLayoutConfig({
      layoutPreset: 'classic-invitation',
      galleryStyle: 'slideshow',
    });
    expect(result.layoutPreset).toBe('classic-invitation');
    expect(result.coverStyle).toBe('paper');
    expect(result.galleryStyle).toBe('slideshow');
  });

  it('fallback layout tidak dikenal tetap aman', () => {
    expect(getLayoutPreset('layout-tidak-ada').id).toBe('cinematic-editorial');
  });
});

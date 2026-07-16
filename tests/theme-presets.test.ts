import { describe, expect, it } from 'vitest';
import {
  THEME_PRESETS,
  getThemePreset,
  resolveThemeConfig,
} from '@/config/theme-presets';

describe('theme presets', () => {
  it('menyediakan enam preset unik dan lengkap', () => {
    expect(THEME_PRESETS).toHaveLength(6);
    expect(new Set(THEME_PRESETS.map((item) => item.id)).size).toBe(6);
    for (const preset of THEME_PRESETS) {
      expect(preset.config.preset).toBe(preset.id);
      expect(preset.config.primary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.config.secondary).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.config.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(preset.config.surface).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('menggunakan luxury gold ketika preset tidak dikenal', () => {
    expect(getThemePreset('tidak-ada').id).toBe('luxury-gold');
  });

  it('mempertahankan kustomisasi pengguna di atas preset', () => {
    const result = resolveThemeConfig({
      preset: 'modern-botanical',
      accent: '#123456',
    });
    expect(result.preset).toBe('modern-botanical');
    expect(result.accent).toBe('#123456');
    expect(result.layoutStyle).toBe('botanical');
  });
});

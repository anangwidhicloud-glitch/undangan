import { resolveLayoutConfig } from '@/config/layout-presets';
import type { ThemeConfig, ThemePresetId } from '@/types/wedding';

export interface ThemePresetDefinition {
  id: ThemePresetId;
  name: string;
  category: string;
  description: string;
  recommendedFor: string;
  config: ThemeConfig;
}

export const THEME_PRESETS: ThemePresetDefinition[] = [
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    category: 'Luxury Editorial',
    description:
      'Olive gelap, ivory, dan emas dengan tampilan editorial sinematik.',
    recommendedFor: 'Ballroom, gedung, dan konsep malam',
    config: {
      preset: 'luxury-gold',
      layoutPreset: 'cinematic-editorial',
      coverStyle: 'curtain',
      navigationStyle: 'floating-dock',
      galleryStyle: 'masonry',
      storyStyle: 'cinematic',
      primary: '#1d1f19',
      secondary: '#f5f0e6',
      accent: '#c2a25b',
      text: '#292922',
      surface: '#fffaf0',
      muted: '#746c5d',
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Manrope',
      mode: 'light',
      animationIntensity: 'medium',
      layoutStyle: 'editorial',
      ornamentStyle: 'gold-lines',
      heroStyle: 'cinematic',
      surfaceStyle: 'glass',
      cornerStyle: 'soft',
    },
  },
  {
    id: 'modern-botanical',
    name: 'Modern Botanical',
    category: 'Natural Contemporary',
    description:
      'Hijau sage, putih hangat, dan bentuk organik yang segar serta modern.',
    recommendedFor: 'Garden party dan intimate wedding',
    config: {
      preset: 'modern-botanical',
      layoutPreset: 'storytelling-journey',
      coverStyle: 'envelope',
      navigationStyle: 'side-dots',
      galleryStyle: 'filmstrip',
      storyStyle: 'zigzag',
      primary: '#294238',
      secondary: '#edf3e9',
      accent: '#8da17b',
      text: '#213229',
      surface: '#fbfdf8',
      muted: '#66756d',
      headingFont: 'DM Serif Display',
      bodyFont: 'Manrope',
      mode: 'light',
      animationIntensity: 'medium',
      layoutStyle: 'botanical',
      ornamentStyle: 'botanical',
      heroStyle: 'split',
      surfaceStyle: 'clean',
      cornerStyle: 'round',
    },
  },
  {
    id: 'elegant-nusantara',
    name: 'Elegant Nusantara',
    category: 'Heritage Indonesia',
    description:
      'Marun, krem, tembaga, dan motif batik lembut dengan rasa tradisi modern.',
    recommendedFor: 'Akad, adat Jawa, dan resepsi tradisional',
    config: {
      preset: 'elegant-nusantara',
      layoutPreset: 'cultural-heritage',
      coverStyle: 'floral',
      navigationStyle: 'minimal',
      galleryStyle: 'polaroid',
      storyStyle: 'scrapbook',
      primary: '#59272b',
      secondary: '#f5e9da',
      accent: '#b87c43',
      text: '#392625',
      surface: '#fff8ed',
      muted: '#7c625c',
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Manrope',
      mode: 'light',
      animationIntensity: 'medium',
      layoutStyle: 'heritage',
      ornamentStyle: 'batik',
      heroStyle: 'royal',
      surfaceStyle: 'paper',
      cornerStyle: 'classic',
    },
  },
  {
    id: 'romantic-blush',
    name: 'Romantic Blush',
    category: 'Soft Romantic',
    description:
      'Blush dusty, rosewood, dan ivory dengan suasana lembut serta romantis.',
    recommendedFor: 'Outdoor, chapel, dan pernikahan pastel',
    config: {
      preset: 'romantic-blush',
      layoutPreset: 'classic-invitation',
      coverStyle: 'paper',
      navigationStyle: 'top-bar',
      galleryStyle: 'classic-grid',
      storyStyle: 'vertical',
      primary: '#704c57',
      secondary: '#fbf1f2',
      accent: '#c58e98',
      text: '#49343a',
      surface: '#fffafb',
      muted: '#8b7178',
      headingFont: 'Playfair Display',
      bodyFont: 'Manrope',
      mode: 'light',
      animationIntensity: 'low',
      layoutStyle: 'classic',
      ornamentStyle: 'floral',
      heroStyle: 'soft',
      surfaceStyle: 'paper',
      cornerStyle: 'round',
    },
  },
  {
    id: 'midnight-silver',
    name: 'Midnight Silver',
    category: 'Modern Evening',
    description:
      'Biru malam dan perak dengan detail geometris serta nuansa gala modern.',
    recommendedFor: 'Resepsi malam dan konsep black tie',
    config: {
      preset: 'midnight-silver',
      layoutPreset: 'cinematic-editorial',
      coverStyle: 'curtain',
      navigationStyle: 'floating-dock',
      galleryStyle: 'masonry',
      storyStyle: 'cinematic',
      primary: '#151d2a',
      secondary: '#edf1f6',
      accent: '#9eacbe',
      text: '#202936',
      surface: '#f9fbfd',
      muted: '#697586',
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Inter',
      mode: 'dark',
      animationIntensity: 'high',
      layoutStyle: 'editorial',
      ornamentStyle: 'geometric',
      heroStyle: 'cinematic',
      surfaceStyle: 'glass',
      cornerStyle: 'soft',
    },
  },
  {
    id: 'ivory-minimal',
    name: 'Ivory Minimal',
    category: 'Timeless Minimal',
    description:
      'Ivory bersih, charcoal, dan champagne dengan komposisi sederhana yang tenang.',
    recommendedFor: 'Civil wedding dan konsep minimalis',
    config: {
      preset: 'ivory-minimal',
      layoutPreset: 'modern-minimal',
      coverStyle: 'door',
      navigationStyle: 'menu-button',
      galleryStyle: 'slideshow',
      storyStyle: 'polaroid',
      primary: '#302d28',
      secondary: '#faf8f2',
      accent: '#a58b63',
      text: '#302d28',
      surface: '#ffffff',
      muted: '#77716a',
      headingFont: 'Libre Baskerville',
      bodyFont: 'Inter',
      mode: 'light',
      animationIntensity: 'low',
      layoutStyle: 'minimal',
      ornamentStyle: 'minimal',
      heroStyle: 'split',
      surfaceStyle: 'clean',
      cornerStyle: 'classic',
    },
  },
];

export function getThemePreset(id: ThemePresetId | string) {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS[0];
}

export function resolveThemeConfig(theme?: Partial<ThemeConfig> | null) {
  const preset = getThemePreset(theme?.preset ?? 'luxury-gold');
  const layout = resolveLayoutConfig({ ...preset.config, ...(theme ?? {}) });
  return {
    ...preset.config,
    ...layout,
    ...(theme ?? {}),
    preset: preset.id,
    layoutPreset: layout.layoutPreset,
  };
}

import type {
  CoverStyle,
  GalleryStyle,
  LayoutPresetId,
  NavigationStyle,
  StoryStyle,
  ThemeConfig,
} from '@/types/wedding';

export interface LayoutPresetDefinition {
  id: LayoutPresetId;
  name: string;
  category: string;
  description: string;
  experience: string;
  recommendedThemes: ThemeConfig['preset'][];
  config: {
    layoutPreset: LayoutPresetId;
    layoutStyle: ThemeConfig['layoutStyle'];
    heroStyle: ThemeConfig['heroStyle'];
    coverStyle: CoverStyle;
    navigationStyle: NavigationStyle;
    galleryStyle: GalleryStyle;
    storyStyle: StoryStyle;
    surfaceStyle: ThemeConfig['surfaceStyle'];
    cornerStyle: ThemeConfig['cornerStyle'];
    animationIntensity: ThemeConfig['animationIntensity'];
  };
}

export const LAYOUT_PRESETS: LayoutPresetDefinition[] = [
  {
    id: 'cinematic-editorial',
    name: 'Cinematic Editorial',
    category: 'Immersive Premium',
    description:
      'Foto full-screen, tipografi besar, transisi tirai, dan komposisi seperti editorial majalah premium.',
    experience: 'Hero sinematik · masonry gallery · floating dock',
    recommendedThemes: ['luxury-gold', 'midnight-silver', 'romantic-blush'],
    config: {
      layoutPreset: 'cinematic-editorial',
      layoutStyle: 'editorial',
      heroStyle: 'cinematic',
      coverStyle: 'curtain',
      navigationStyle: 'floating-dock',
      galleryStyle: 'masonry',
      storyStyle: 'cinematic',
      surfaceStyle: 'glass',
      cornerStyle: 'soft',
      animationIntensity: 'high',
    },
  },
  {
    id: 'classic-invitation',
    name: 'Classic Invitation',
    category: 'Formal & Timeless',
    description:
      'Susunan simetris seperti kartu undangan fisik, fokus pada keterbacaan, dan navigasi formal yang mudah digunakan semua usia.',
    experience: 'Paper cover · classic grid · top navigation',
    recommendedThemes: ['ivory-minimal', 'romantic-blush', 'luxury-gold'],
    config: {
      layoutPreset: 'classic-invitation',
      layoutStyle: 'classic',
      heroStyle: 'soft',
      coverStyle: 'paper',
      navigationStyle: 'top-bar',
      galleryStyle: 'classic-grid',
      storyStyle: 'vertical',
      surfaceStyle: 'paper',
      cornerStyle: 'classic',
      animationIntensity: 'low',
    },
  },
  {
    id: 'storytelling-journey',
    name: 'Storytelling Journey',
    category: 'Emotional Narrative',
    description:
      'Perjalanan hubungan menjadi pusat pengalaman dengan chapter foto, timeline progres, dan navigasi seperti perjalanan cerita.',
    experience: 'Envelope reveal · zigzag story · side dots',
    recommendedThemes: ['romantic-blush', 'modern-botanical', 'luxury-gold'],
    config: {
      layoutPreset: 'storytelling-journey',
      layoutStyle: 'botanical',
      heroStyle: 'split',
      coverStyle: 'envelope',
      navigationStyle: 'side-dots',
      galleryStyle: 'filmstrip',
      storyStyle: 'zigzag',
      surfaceStyle: 'paper',
      cornerStyle: 'round',
      animationIntensity: 'high',
    },
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'Clean Contemporary',
    description:
      'White space luas, komponen ringan, sedikit ornamen, dan interaksi sederhana untuk pengalaman cepat serta modern.',
    experience: 'Clean hero · slideshow · compact menu',
    recommendedThemes: ['ivory-minimal', 'modern-botanical', 'midnight-silver'],
    config: {
      layoutPreset: 'modern-minimal',
      layoutStyle: 'minimal',
      heroStyle: 'split',
      coverStyle: 'door',
      navigationStyle: 'menu-button',
      galleryStyle: 'slideshow',
      storyStyle: 'polaroid',
      surfaceStyle: 'clean',
      cornerStyle: 'classic',
      animationIntensity: 'medium',
    },
  },
  {
    id: 'cultural-heritage',
    name: 'Cultural Heritage',
    category: 'Indonesia Heritage',
    description:
      'Komposisi royal dengan aksen batik atau ukiran, pembuka floral, dan ritme visual yang cocok untuk prosesi adat Indonesia.',
    experience: 'Floral reveal · royal hero · scrapbook story',
    recommendedThemes: ['elegant-nusantara', 'luxury-gold'],
    config: {
      layoutPreset: 'cultural-heritage',
      layoutStyle: 'heritage',
      heroStyle: 'royal',
      coverStyle: 'floral',
      navigationStyle: 'minimal',
      galleryStyle: 'polaroid',
      storyStyle: 'scrapbook',
      surfaceStyle: 'paper',
      cornerStyle: 'classic',
      animationIntensity: 'medium',
    },
  },
];

export function getLayoutPreset(id: LayoutPresetId | string) {
  return LAYOUT_PRESETS.find((preset) => preset.id === id) ?? LAYOUT_PRESETS[0];
}

export function resolveLayoutConfig(
  layout?: Partial<ThemeConfig> | null,
): LayoutPresetDefinition['config'] {
  const preset = getLayoutPreset(layout?.layoutPreset ?? 'cinematic-editorial');
  return {
    ...preset.config,
    ...(layout?.layoutPreset ? { layoutPreset: layout.layoutPreset } : {}),
    ...(layout?.layoutStyle ? { layoutStyle: layout.layoutStyle } : {}),
    ...(layout?.heroStyle ? { heroStyle: layout.heroStyle } : {}),
    ...(layout?.coverStyle ? { coverStyle: layout.coverStyle } : {}),
    ...(layout?.navigationStyle
      ? { navigationStyle: layout.navigationStyle }
      : {}),
    ...(layout?.galleryStyle ? { galleryStyle: layout.galleryStyle } : {}),
    ...(layout?.storyStyle ? { storyStyle: layout.storyStyle } : {}),
    ...(layout?.surfaceStyle ? { surfaceStyle: layout.surfaceStyle } : {}),
    ...(layout?.cornerStyle ? { cornerStyle: layout.cornerStyle } : {}),
    ...(layout?.animationIntensity
      ? { animationIntensity: layout.animationIntensity }
      : {}),
  };
}

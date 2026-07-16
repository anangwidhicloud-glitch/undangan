import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const slug =
    process.env.NEXT_PUBLIC_DEFAULT_WEDDING_SLUG || 'nathan-dan-aulia';
  return [
    {
      url: `${base}/invite/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}

'use client';

import { PlayCircle } from 'lucide-react';

function getEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
    }
    if (url.hostname.includes('youtube.com')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const id =
        url.searchParams.get('v') ||
        (['shorts', 'embed', 'live'].includes(parts[0] || '')
          ? parts[1]
          : parts.at(-1));
      return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : null;
    }
    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname
        .split('/')
        .filter(Boolean)
        .find((part) => /^\d+$/.test(part));
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function ResponsiveVideo({
  src,
  poster,
  title = 'Video pernikahan',
  className = '',
}: {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}) {
  const embedUrl = getEmbedUrl(src);

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={`h-full w-full border-0 ${className}`}
      />
    );
  }

  if (!src) {
    return (
      <div
        className={`grid h-full w-full place-items-center bg-black text-white/70 ${className}`}
      >
        <div className="text-center">
          <PlayCircle className="mx-auto" size={44} />
          <p className="mt-3 text-sm">Video belum tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <video
      controls
      playsInline
      preload="metadata"
      poster={poster}
      className={`h-full w-full object-contain ${className}`}
    >
      <source src={src} />
      Browser Anda tidak mendukung video HTML5.
    </video>
  );
}

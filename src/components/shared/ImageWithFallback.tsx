'use client';

import Image, { type ImageProps } from 'next/image';
import { useMemo, useState } from 'react';

const FINAL_FALLBACK = '/images/luxury-placeholder.svg';

interface Props extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc: string;
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  unoptimized,
  ...props
}: Props) {
  const candidates = useMemo(
    () =>
      [src, fallbackSrc, FINAL_FALLBACK].filter(
        (value, index, items): value is string =>
          Boolean(value?.trim()) && items.indexOf(value) === index,
      ),
    [fallbackSrc, src],
  );
  const [failedSources, setFailedSources] = useState<Set<string>>(
    () => new Set(),
  );
  const current =
    candidates.find((candidate) => !failedSources.has(candidate)) ??
    FINAL_FALLBACK;

  return (
    <Image
      {...props}
      src={current}
      alt={alt}
      unoptimized={unoptimized ?? /^https?:\/\//i.test(current)}
      onError={() => setFailedSources((failed) => new Set(failed).add(current))}
    />
  );
}

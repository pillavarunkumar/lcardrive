'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAvatarFallback, getAvatarUrl, type AvatarInput } from '@/lib/avatar';

interface AvatarProps {
  instructor: AvatarInput;
  className?: string;
  size?: number;
  width?: number;
  height?: number;
  alt?: string;
  priority?: boolean;
}

/**
 * Instructor avatar with a guaranteed local fallback.
 *
 * Remote photos (Clerk/Google, Supabase storage, Gravatar) can fail or 404;
 * rather than showing a broken image or a random stock portrait, fall back to
 * a deterministic initials image generated in the browser.
 */
export default function Avatar({
  instructor,
  className,
  size = 200,
  width,
  height,
  alt = '',
  priority = false,
}: AvatarProps) {
  const src = useMemo(() => getAvatarUrl(instructor, size), [instructor, size]);
  const fallback = useMemo(() => getAvatarFallback(instructor, size), [instructor, size]);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
      className={className}
    />
  );
}

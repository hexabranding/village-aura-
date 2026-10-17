import { useEffect, useState } from 'react';
import { resolveUploadUrl } from './api';

/** True on phone-sized viewports (≤640px). Tracks resize/orientation changes. */
export function useIsMobile(query = '(max-width: 640px)'): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return isMobile;
}

/**
 * Build a responsive srcSet for remote banner images that support
 * width/height params (e.g. Pexels). Width AND height scale together so
 * every candidate keeps the exact same framing/crop as the source image —
 * mobile downloads a smaller file but shows what desktop shows.
 *
 * Returns undefined for same-origin uploads (single src is served).
 */
export function buildBannerSrcSet(src: string, ratioW = 14, ratioH = 5): string | undefined {
  const url = resolveUploadUrl(src);
  if (!/^https?:\/\//i.test(url) || !/[?&]w=\d+/.test(url)) return undefined;
  const hasHeight = /[?&]h=\d+/.test(url);
  return [700, 1100, 1600]
    .map((w) => {
      let sized = url.replace(/([?&])w=\d+/, `$1w=${w}`);
      if (hasHeight) sized = sized.replace(/([?&])h=\d+/, `$1h=${Math.round((w * ratioH) / ratioW)}`);
      return `${sized} ${w}w`;
    })
    .join(', ');
}

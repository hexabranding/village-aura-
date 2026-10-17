import { resolveUploadUrl } from './api';

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

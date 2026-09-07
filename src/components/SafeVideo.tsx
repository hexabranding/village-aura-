import { useState, useRef, useEffect } from 'react';
import { resolveUploadUrl } from '../lib/api';

const isUnreliableVideo = (url: string) => {
  if (!url) return true;
  return /videos\.pexels\.com/i.test(url) || /pexels\.com\/video-files/i.test(url);
};

interface SafeVideoProps {
  src: string;
  poster?: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  preload?: string;
  fallbackPoster?: string;
}

export default function SafeVideo({ src, poster, alt, style, className, muted = true, loop, controls, playsInline = true, preload = 'metadata', fallbackPoster }: SafeVideoProps) {
  const resolvedSrc = resolveUploadUrl(src || '');
  const resolvedPoster = poster ? resolveUploadUrl(poster) : undefined;
  const [hasError, setHasError] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreliable = isUnreliableVideo(src) || isUnreliableVideo(resolvedSrc);
  const shouldRenderVideo = !hasError && !unreliable && resolvedSrc && inView;

  useEffect(() => {
    if (unreliable) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { rootMargin: '200px', threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [unreliable]);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || unreliable || !resolvedSrc) {
    if (resolvedPoster || fallbackPoster) {
      return (
        <div ref={containerRef} style={style} className={className}>
          <img
            src={resolvedPoster || fallbackPoster}
            alt={alt || ''}
            style={{ width: '100%', height: '100%', objectFit: (style as any)?.objectFit || 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      );
    }
    return <div ref={containerRef} style={style} className={className} />;
  }

  return (
    <div ref={containerRef} style={style} className={className}>
      {shouldRenderVideo ? (
        <video
          ref={ref}
          src={resolvedSrc}
          poster={resolvedPoster}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline={playsInline}
          preload={preload as any}
          onError={() => setHasError(true)}
          style={{ width: '100%', height: '100%', objectFit: (style as any)?.objectFit || 'cover', display: 'block' }}
        />
      ) : resolvedPoster ? (
        <img
          src={resolvedPoster}
          alt={alt || ''}
          style={{ width: '100%', height: '100%', objectFit: (style as any)?.objectFit || 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : null}
    </div>
  );
}

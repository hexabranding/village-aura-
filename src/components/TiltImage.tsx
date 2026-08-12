import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TiltImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  expanded?: boolean;
  onHoverChange?: (hovering: boolean) => void;
}

export default function TiltImage({ src, alt, style, expanded = false, onHoverChange }: TiltImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isTouchDevice) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (0.5 - y) * 12;
      const tiltY = (x - 0.5) * 12;
      setTilt({ rotateX: tiltX, rotateY: tiltY });
    },
    [isTouchDevice],
  );

  const handleMouseEnter = () => {
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    onHoverChange?.(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: expanded ? tilt.rotateX : 0,
        rotateY: expanded ? tilt.rotateY : 0,
        scale: expanded ? 1.05 : 1,
        y: expanded ? -6 : 0,
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        boxShadow: expanded
          ? '0 25px 60px rgba(36, 27, 21, 0.22), 0 8px 24px rgba(36, 27, 21, 0.12), 0 0 0 1px rgba(201, 169, 110, 0.15)'
          : '0 4px 16px rgba(36, 27, 21, 0.08)',
        transition: 'box-shadow 0.5s ease',
        ...style,
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        animate={{
          scale: expanded ? 1.06 : 1,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
        }}
      />
      {/* Glow edge overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          boxShadow: expanded
            ? 'inset 0 0 0 1px rgba(201, 169, 110, 0.25), inset 0 0 30px rgba(201, 169, 110, 0.06)'
            : 'inset 0 0 0 0 transparent',
          transition: 'box-shadow 0.5s ease',
        }}
      />
    </motion.div>
  );
}

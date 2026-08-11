import { motion, useReducedMotion } from 'framer-motion';

interface ZariDividerProps {
  tone?: 'gold' | 'ivory';
}

/**
 * The site's signature element: a hand-embroidery style zari (gold-thread)
 * border that draws itself in as it scrolls into view, echoing the woven
 * borders on the sarees themselves. Used between sections instead of a
 * plain <hr> — it's decoration that comes from the product's own craft.
 */
export default function ZariDivider({ tone = 'gold' }: ZariDividerProps) {
  const reduceMotion = useReducedMotion();
  const stroke = tone === 'gold' ? 'var(--gold)' : 'var(--ivory-deep)';

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: reduceMotion ? 0 : 1.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div style={{ width: '100%', padding: '0.5rem 0' }} aria-hidden="true">
      <motion.svg
        viewBox="0 0 1200 40"
        width="100%"
        height="32"
        preserveAspectRatio="none"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
      >
        <motion.path
          d="M0 20 
             C 30 4, 60 4, 75 20 
             C 90 36, 105 36, 120 20
             L 1080 20
             C 1095 4, 1110 4, 1125 20
             C 1140 36, 1170 36, 1200 20"
          fill="none"
          stroke={stroke}
          strokeWidth="1.3"
          variants={draw}
        />
        {Array.from({ length: 21 }).map((_, i) => (
          <motion.circle
            key={i}
            cx={60 + i * 55}
            cy={20}
            r={2.1}
            fill={stroke}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              delay: reduceMotion ? 0 : 0.15 + i * 0.045,
              duration: 0.4,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.svg>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.title} style={{ borderBottom: '1px solid var(--line)' }}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.1rem 0',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
                color: 'var(--ink)',
              }}
              aria-expanded={open}
            >
              {item.title}
              <motion.span
                animate={{ rotate: open ? 45 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: '1.3rem', color: 'var(--gold)', lineHeight: 1 }}
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ paddingBottom: '1.1rem', color: 'var(--ink-soft)', fontSize: '0.88rem', lineHeight: 1.75 }}>
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

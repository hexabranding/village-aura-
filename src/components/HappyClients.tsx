import { motion } from 'framer-motion';

interface Client {
  name: string;
  location: string;
  quote: string;
  image: string;
}

const clients: Client[] = [
  {
    name: 'Priya Sharma',
    location: '',
    quote: 'The Kanjivaram silk is everything I hoped for — the zari work is breathtaking.',
    image: 'https://images.pexels.com/photos/5585346/pexels-photo-5585346.jpeg?w=800&h=1200&fit=crop',
  },
  {
    name: 'Ananya Iyer',
    location: '',
    quote: 'My bridal Banarasi was the star of the wedding. Thank you, Resham!',
    image: 'https://images.pexels.com/photos/2723623/pexels-photo-2723623.jpeg?w=600&h=400&fit=crop',
  },
  {
    name: 'Deepa Nair',
    location: '',
    quote: 'Wore the Chanderi to work — got more compliments than my presentation.',
    image: 'https://images.pexels.com/photos/27139278/pexels-photo-27139278.jpeg?w=600&h=900&fit=crop',
  },
  {
    name: 'Meera Joshi',
    location: '',
    quote: 'The Jamdani feels like wearing a piece of art. Truly one of a kind.',
    image: 'https://images.pexels.com/photos/11822308/pexels-photo-11822308.jpeg?w=600&h=400&fit=crop',
  },
  {
    name: 'Lakshmi Rao',
    location: '',
    quote: 'Ordered the Tant cotton — light, crisp, and perfect for summer weddings.',
    image: 'https://images.pexels.com/photos/11819173/pexels-photo-11819173.jpeg?w=600&h=400&fit=crop',
  },
  {
    name: 'Kavitha Menon',
    location: '',
    quote: 'The temple kemp necklace completes every silk saree look beautifully.',
    image: 'https://images.pexels.com/photos/10483857/pexels-photo-10483857.jpeg?w=600&h=400&fit=crop',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function ClientCard({ client, index }: { client: Client; index: number }) {
  const isLarge = index === 0;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`client-card client-card-${index}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
      }}
    >
      <img
        src={client.image}
        alt={client.name}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'transform 0.5s ease',
        }}
      />

      {/* Hover overlay */}
      <div
        className="client-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(36,27,21,0.1) 0%, rgba(36,27,21,0.65) 100%)',
          opacity: 0,
          transition: 'opacity 0.5s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: isLarge ? '2rem' : '1.25rem',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: isLarge ? '1.3rem' : '0.95rem',
            fontStyle: 'italic',
            lineHeight: 1.4,
            color: 'var(--rose-dust)',
            marginBottom: '0.6rem',
          }}
        >
          "{client.quote}"
        </div>
      </div>

      {/* Always-visible name label */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: isLarge ? '1.5rem' : '0.85rem',
          background: 'linear-gradient(0deg, rgba(36,27,21,0.55) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.72rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--ivory)',
            opacity: 0.9,
            fontWeight: 500,
          }}
        >
          {client.name}
        </div>
      </div>

      {/* Decorative quote mark on big cards */}
      {isLarge && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 24,
            fontSize: '4rem',
            fontFamily: 'var(--font-display)',
            color: 'var(--gold)',
            opacity: 0.25,
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          "
        </div>
      )}
    </motion.div>
  );
}

export default function HappyClients() {
  return (
    <section className="container" style={{ padding: '4.5rem 0' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Woven With Love
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: '2.2rem', marginTop: '0.4rem' }}
        >
          Gallery
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            width: 60,
            height: 2,
            background: 'linear-gradient(90deg, var(--gold), var(--gold-soft))',
            margin: '0.75rem auto 0',
            transformOrigin: 'left',
          }}
        />
      </div>

      <div className="clients-grid">
        {clients.map((client, i) => (
          <ClientCard key={client.name} client={client} index={i} />
        ))}
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const location = useLocation();

  const handleAddToBag = (name: string) => {
    setCartCount((c) => c + 1);
    setToast(name);
    window.clearTimeout((handleAddToBag as any)._t);
    (handleAddToBag as any)._t = window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header cartCount={cartCount} />

      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<Product onAddToBag={handleAddToBag} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: '1.75rem',
              left: '50%',
              background: 'var(--maroon-deep)',
              color: 'var(--ivory)',
              padding: '0.9rem 1.5rem',
              fontSize: '0.85rem',
              zIndex: 100,
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            }}
          >
            {toast} added to your bag
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

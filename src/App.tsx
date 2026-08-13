import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Login from './pages/Login';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import type { CartItem } from './data/products';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('reshamCart');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedProducts, setLikedProducts] = useState<string[]>(() => {
    const saved = localStorage.getItem('likedProducts');
    return saved ? JSON.parse(saved) : [];
  });
  const [toast, setToast] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('reshamCart', JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((a, i) => a + i.qty, 0);

  const toggleLike = useCallback((productId: string) => {
    setLikedProducts((prev) => {
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem('likedProducts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout((showToast as unknown as { _t?: number })._t);
    (showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const addToBag = useCallback(
    (productId: string, colorIndex = 0) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === productId && i.colorIndex === colorIndex);
        if (existing) {
          return prev.map((i) => (i === existing ? { ...i, qty: i.qty + 1 } : i));
        }
        return [...prev, { id: productId, colorIndex, qty: 1 }];
      });
      showToast('Added to bag');
    },
    [showToast]
  );

  const updateQty = useCallback((productId: string, colorIndex: number, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.id === productId && i.colorIndex === colorIndex))
        : prev.map((i) => (i.id === productId && i.colorIndex === colorIndex ? { ...i, qty } : i))
    );
  }, []);

  const removeFromCart = useCallback((productId: string, colorIndex: number) => {
    setCart((prev) => prev.filter((i) => !(i.id === productId && i.colorIndex === colorIndex)));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header cartCount={cartCount} likedCount={likedProducts.length} likedProducts={likedProducts} onToggleLike={toggleLike} />

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
              <Route path="/" element={<Home likedProducts={likedProducts} onToggleLike={toggleLike} />} />
              <Route path="/shop" element={<Shop likedProducts={likedProducts} onToggleLike={toggleLike} />} />
              <Route path="/product/:id" element={<Product onAddToBag={addToBag} likedProducts={likedProducts} onToggleLike={toggleLike} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} />} />
              <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
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
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
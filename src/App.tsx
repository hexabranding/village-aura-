import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import GalleryPage from './pages/GalleryPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTrackingPage from './pages/OrderTracking';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminProtected from './components/AdminProtected';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminOrders from './pages/AdminOrders';
import AdminSales from './pages/AdminSales';
import AdminAds from './pages/AdminAds';
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
  const [toastColor, setToastColor] = useState<string>('var(--maroon-deep)');
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

  const showToast = useCallback((message: string, color?: string) => {
    setToast(message);
    setToastColor(color || 'var(--maroon-deep)');
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
      showToast('Added to bag', '#16a34a');
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdminRoute && (
        <Header cartCount={cartCount} likedCount={likedProducts.length} likedProducts={likedProducts} onToggleLike={toggleLike} />
      )}

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
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/product/:id" element={<Product onAddToBag={addToBag} likedProducts={likedProducts} onToggleLike={toggleLike} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cart" element={<Cart cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} />} />
              <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
              <Route path="/track-order" element={<OrderTrackingPage />} />
              <Route path="/track-order/:orderId" element={<OrderTrackingPage />} />
              <Route path="/account" element={<Account />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminProtected><AdminLayout /></AdminProtected>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="sales" element={<AdminSales />} />
                <Route path="ads" element={<AdminAds />} />
              </Route>
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {!isAdminRoute && <Footer />}

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
              background: toastColor,
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

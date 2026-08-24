import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import logo from '../assets/images/logo.png';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: '📊' },
  { label: 'Products', to: '/admin/products', icon: '📦' },
  { label: 'Categories', to: '/admin/categories', icon: '📁' },
  { label: 'Orders', to: '/admin/orders', icon: '🛒' },
  { label: 'Sales', to: '/admin/sales', icon: '📈' },
  { label: 'Advertisements', to: '/admin/ads', icon: '📢' },
  { label: 'Gallery', to: '/admin/gallery', icon: '🖼️' },
  { label: 'Watch & Shop', to: '/admin/watch-shop', icon: '🎬' },
  { label: 'Testimonials', to: '/admin/testimonials', icon: '💬' },
  { label: 'Home Content', to: '/admin/home-content', icon: '🏠' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    api.auth.logout();
    navigate('/admin/login');
  };

  const isActive = (to: string) =>
    to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);

  const currentLabel = navItems.find((n) => n.to === location.pathname || (n.to !== '/admin' && location.pathname.startsWith(n.to)))?.label || 'Admin';

  return (
    <div className="admin-layout">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" onClick={() => setSidebarOpen(false)} className="admin-sidebar-brand">
            <img src={logo} alt="Village Aura" />
          </Link>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`admin-nav-item ${active ? 'active' : ''}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="admin-nav-active"
                    className="admin-nav-active-bg"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-divider" />
          <Link to="/" className="admin-nav-item admin-nav-footer" onClick={() => setSidebarOpen(false)}>
            <span className="admin-nav-icon">🏪</span>
            <span className="admin-nav-label">View Store</span>
          </Link>
          <button className="admin-nav-item admin-nav-footer admin-logout-btn" onClick={handleLogout}>
            <span className="admin-nav-icon">🚪</span>
            <span className="admin-nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="admin-header-left">
            <h2 className="admin-page-title">{currentLabel}</h2>
          </div>
          <div className="admin-header-right">
            <div className="admin-header-time">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
            <div className="admin-header-avatar">
              <span>A</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

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
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    api.auth.logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
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

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" onClick={() => setSidebarOpen(false)}>
            <img src={logo} alt="Resham" style={{ height: 50, width: 'auto' }} />
          </Link>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const isActive = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item" onClick={handleLogout}>
            <span className="admin-nav-icon">🏪</span>
            <span>View Store</span>
          </Link>
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <span className="admin-nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <h2 className="admin-page-title">
            {navItems.find((n) => n.to === location.pathname || (n.to !== '/admin' && location.pathname.startsWith(n.to)))?.label || 'Admin'}
          </h2>
          <div className="admin-header-right">
            <span className="admin-badge">Admin</span>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

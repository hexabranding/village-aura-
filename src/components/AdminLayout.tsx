import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type Notification } from '../lib/api';
import logo from '../assets/images/logo.png';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: '📊' },
  { label: 'Products', to: '/admin/products', icon: '📦' },
  { label: 'Categories', to: '/admin/categories', icon: '📁' },
  { label: 'Orders', to: '/admin/orders', icon: '🛒' },
  { label: 'Returns', to: '/admin/returns', icon: '↩️' },
  { label: 'Return Settings', to: '/admin/return-settings', icon: '⚙️' },
  { label: 'Sales', to: '/admin/sales', icon: '📈' },
  { label: 'Advertisements', to: '/admin/ads', icon: '📢' },
  { label: 'Gallery', to: '/admin/gallery', icon: '🖼️' },
  { label: 'Watch & Shop', to: '/admin/watch-shop', icon: '🎬' },
  { label: 'Testimonials', to: '/admin/testimonials', icon: '💬' },
  { label: 'Home Content', to: '/admin/home-content', icon: '🏠' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const loadNotifs = async () => {
    try {
      const data = await api.notifications.getUnread();
      setNotifCount(data.count);
      setNotifications(data.notifications);
    } catch (_) {}
  };

  useEffect(() => {
    loadNotifs();
    const id = setInterval(loadNotifs, 8000);
    const onFocus = () => loadNotifs();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, []);

  const markAllRead = async () => {
    try { await api.notifications.markAllRead(); setNotifCount(0); setNotifications([]); } catch (_) {}
  };

  const handleLogout = () => { api.auth.logout(); navigate('/admin/login'); };
  const isActive = (to: string) => to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to);
  const currentLabel = navItems.find((n) => n.to === location.pathname || (n.to !== '/admin' && location.pathname.startsWith(n.to)))?.label || 'Admin';

  return (
    <div className="admin-layout">
      <AnimatePresence>
        {sidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-overlay" onClick={() => setSidebarOpen(false)} />}
      </AnimatePresence>

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" onClick={() => setSidebarOpen(false)} className="admin-sidebar-brand"><img src={logo} alt="Village Allure" /></Link>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={`admin-nav-item ${active ? 'active' : ''}`}>
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
                {item.to === '/admin/orders' && notifCount > 0 && <span style={{ marginLeft:'auto', background:'#ef4444', color:'white', fontSize:'0.6rem', padding:'1px 5px', borderRadius:10, fontWeight:700 }}>{notifCount}</span>}
                {active && <motion.div layoutId="admin-nav-active" className="admin-nav-active-bg" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-divider" />
          <Link to="/" className="admin-nav-item admin-nav-footer" onClick={() => setSidebarOpen(false)}><span className="admin-nav-icon">🏪</span><span className="admin-nav-label">View Store</span></Link>
          <button className="admin-nav-item admin-nav-footer admin-logout-btn" onClick={handleLogout}><span className="admin-nav-icon">🚪</span><span className="admin-nav-label">Logout</span></button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="admin-header-left"><h2 className="admin-page-title">{currentLabel}</h2></div>
          <div className="admin-header-right">
            <div className="admin-header-time">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
            <div style={{ position:'relative' }}>
              <button onClick={() => setShowNotif(!showNotif)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.2rem', padding:'0.3rem', position:'relative' }}>
                🔔
                {notifCount > 0 && <span style={{ position:'absolute', top:0, right:0, background:'#ef4444', color:'white', fontSize:'0.55rem', width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{notifCount}</span>}
              </button>
              <AnimatePresence>
                {showNotif && (
                  <motion.div initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.95 }} style={{ position:'absolute', top:'100%', right:0, width:340, maxHeight:400, overflowY:'auto', background:'white', border:'1px solid var(--line)', borderRadius:12, boxShadow:'0 12px 40px rgba(0,0,0,0.15)', zIndex:1000, marginTop:8 }}>
                    <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontWeight:700, fontSize:'0.85rem' }}>Notifications</span>
                      {notifications.length > 0 && <button onClick={markAllRead} style={{ background:'none', border:'none', color:'var(--maroon)', fontSize:'0.72rem', fontWeight:600, cursor:'pointer' }}>Mark all read</button>}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding:'2rem', textAlign:'center', color:'var(--ink-soft)', fontSize:'0.82rem' }}>No new notifications</div>
                    ) : notifications.map((n) => (
                      <div key={n.id} onClick={() => { setShowNotif(false); if(n.orderId) navigate('/admin/orders'); }} style={{ padding:'0.65rem 1rem', borderBottom:'1px solid var(--line)', background: n.type==='cancellation' ? '#fff5f5' : n.type==='return' ? '#fffbeb' : 'white', cursor:'pointer' }}>
                        <div style={{ fontSize:'0.78rem', fontWeight:700, color: n.type==='cancellation' ? '#991b1b' : n.type==='return' ? '#92400e' : 'var(--ink)' }}>{n.type==='cancellation' ? '❌' : n.type==='return' ? '↩️' : '🔔'} {n.title}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--ink-soft)', marginTop:2 }}>{n.message}</div>
                        <div style={{ fontSize:'0.65rem', color:'#9ca3af', marginTop:3 }}>{new Date(n.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="admin-header-avatar"><span>A</span></div>
          </div>
        </header>
        <main className="admin-content">
          <motion.div key={location.pathname} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3, ease:'easeOut' }}><Outlet /></motion.div>
        </main>
      </div>
    </div>
  );
}

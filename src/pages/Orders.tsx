import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ZariDivider from '../components/ZariDivider';
import { api, type Order, type OrderTracking, type Review, type ReturnRequest } from '../lib/api';
import { getProduct } from '../lib/productStore';

interface LocalOrder {
  orderId: string;
  total: number;
  name: string;
  phone: string;
  payment: string;
  date: string;
  status: string;
  items: { id: string; colorIndex: number; qty: number }[];
  tracking?: OrderTracking[];
  estimatedDelivery?: string;
}

const statusColors: Record<string, string> = {
  Pending: '#f59e0b',
  Processing: '#3b82f6',
  Shipped: '#8b5cf6',
  'Out for Delivery': '#f97316',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

const statusIcons: Record<string, string> = {
  Pending: '⏳',
  Processing: '⚙️',
  Shipped: '🚚',
  'Out for Delivery': '🛵',
  Delivered: '✅',
  Cancelled: '❌',
};

const returnReasons = [
  'Wrong size/fit',
  'Color mismatch',
  'Damaged/defective product',
  'Product not as described',
  'Quality issue',
  'Changed my mind',
  'Other',
];

export default function Orders() {
  const [user, setUser] = useState<{ email: string; name: string; phone?: string } | null>(null);
  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([]);
  const [apiOrders, setApiOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [showReviewForm, setShowReviewForm] = useState<string | null>(null);
  const [showReturnForm, setShowReturnForm] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('reshamUser');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      if (parsed.phone) {
        setPhoneInput(parsed.phone);
        fetchApiOrders(parsed.phone);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    const local = JSON.parse(localStorage.getItem('reshamOrders') || '[]');
    setLocalOrders(local);
  }, [navigate]);

  const fetchApiOrders = async (phone: string) => {
    setSearching(true);
    setLoading(true);
    try {
      const data = await api.orders.getByPhone(phone);
      setApiOrders(data);
      await fetchReviewsAndReturns(phone);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const fetchReviewsAndReturns = async (phone: string) => {
    try {
      const [reviewsData, returnsData] = await Promise.all([
        api.reviews.getByPhone(phone).catch(() => []),
        api.returns.getByPhone(phone).catch(() => []),
      ]);
      setReviews(reviewsData);
      setReturns(returnsData);
    } catch (err) {
      console.error('Failed to fetch reviews/returns:', err);
    }
  };

  const handleSubmitReview = async (orderId: string, productId: string) => {
    if (!user?.phone || !reviewComment.trim()) return;
    setSubmitting(true);
    try {
      await api.reviews.create({
        orderId,
        productId,
        phone: user.phone,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      await fetchReviewsAndReturns(user.phone);
      setShowReviewForm(null);
      setReviewRating(5);
      setReviewComment('');
      setSubmitSuccess('review');
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReturn = async (orderId: string, productId: string) => {
    if (!user?.phone || !returnReason) return;
    setSubmitting(true);
    try {
      await api.returns.create({
        orderId,
        productId,
        phone: user.phone,
        reason: returnReason,
        description: returnDescription.trim(),
      });
      await fetchReviewsAndReturns(user.phone);
      setShowReturnForm(null);
      setReturnReason('');
      setReturnDescription('');
      setSubmitSuccess('return');
      setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to submit return:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const hasReviewed = (orderId: string, productId: string) => {
    return reviews.some((r) => r.orderId === orderId && r.productId === productId);
  };

  const hasReturnRequest = (orderId: string, productId: string) => {
    return returns.some((r) => r.orderId === orderId && r.productId === productId);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length >= 10) {
      fetchApiOrders(phoneInput);
    }
  };

  const allOrders = [
    ...localOrders.map((o) => ({ ...o, source: 'local' as const })),
    ...apiOrders.map((o) => ({
      orderId: o.orderId,
      total: o.total,
      name: o.name,
      phone: o.phone,
      payment: o.payment,
      date: o.date,
      status: o.status,
      items: o.items,
      tracking: o.tracking,
      estimatedDelivery: o.estimatedDelivery,
      source: 'api' as const,
    })),
  ];

  const uniqueOrders = allOrders.filter(
    (order, index, self) => index === self.findIndex((o) => o.orderId === order.orderId)
  );

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 1rem',
    border: '1px solid var(--line)',
    borderBottom: '2px solid var(--gold-soft)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--ivory-deep)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.92rem',
    color: 'var(--ink)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ minHeight: '72vh', padding: '4rem 1.5rem' }}
    >
      <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your purchases
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            style={{ fontSize: '2rem', marginTop: '0.5rem', fontStyle: 'italic' }}
          >
            My Orders
          </motion.h1>
          <ZariDivider />
        </div>

        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                background: submitSuccess === 'review' ? '#dcfce7' : '#fef3c7',
                color: submitSuccess === 'review' ? '#166534' : '#92400e',
                border: `1px solid ${submitSuccess === 'review' ? '#bbf7d0' : '#fde68a'}`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {submitSuccess === 'review' ? 'Thank you! Your review has been submitted.' : 'Return request submitted. We will get back to you soon.'}
            </motion.div>
          )}
        </AnimatePresence>

        {!user && (
          <form onSubmit={handleSearch} style={{ marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: '0.75rem', textAlign: 'center' }}>
              Enter your phone number to find your orders
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                maxLength={10}
                required
                style={inputStyle}
              />
              <button type="submit" className="btn btn-solid" style={{ padding: '0.85rem 1.5rem', flexShrink: 0 }}>
                {searching ? '...' : 'Find'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--ink-soft)' }}>Loading orders...</p>
          </div>
        ) : uniqueOrders.length === 0 ? (
          <div
            style={{
              background: 'var(--ivory)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', display: 'block' }}>
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', marginBottom: '0.5rem' }}>No orders yet</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--gold)', marginBottom: '1.5rem' }}>Start shopping to see your orders here.</p>
            <Link to="/shop" className="btn btn-solid" style={{ padding: '0.8rem 2rem', fontSize: '0.82rem', textDecoration: 'none' }}>
              Browse Collection
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {uniqueOrders.map((order) => (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--ivory)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{ padding: '1.5rem', cursor: 'pointer' }}
                  onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--maroon)' }}>{order.orderId}</p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>{order.date}</p>
                    </div>
                    <span
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        background: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                        color: order.status === 'Delivered' ? '#166534' : order.status === 'Cancelled' ? '#991b1b' : '#92400e',
                      }}
                    >
                      {statusIcons[order.status] || '📋'} {order.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {order.items.map((item, idx) => {
                      const product = getProduct(item.id);
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          {product ? (
                            <img
                              src={product.variants[item.colorIndex]?.images[0] ?? product.variants[0].images[0]}
                              alt={product.name}
                              style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                            />
                          ) : (
                            <div style={{ width: 40, height: 50, background: 'var(--ivory-deep)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--ink-soft)' }}>
                              IMG
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.85rem' }}>{product?.name || item.id}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Qty: {item.qty}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Total: <strong style={{ color: 'var(--maroon)' }}>₹{order.total.toLocaleString('en-IN')}</strong></p>
                    <span style={{ fontSize: '0.78rem', color: 'var(--maroon)' }}>
                      {expandedOrder === order.orderId ? 'Hide Details ▲' : 'View Details ▼'}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedOrder === order.orderId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--line)' }}>
                        {order.estimatedDelivery && (
                          <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius-sm)', marginTop: '1rem', fontSize: '0.85rem', color: '#92400e' }}>
                            <strong>Estimated Delivery:</strong> {order.estimatedDelivery}
                          </div>
                        )}

                        {order.tracking && order.tracking.length > 0 ? (
                          <div style={{ marginTop: '1.25rem' }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '1rem' }}>Tracking Timeline</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                              {order.tracking.map((entry: OrderTracking, i: number) => (
                                <div
                                  key={i}
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '48px 1fr',
                                    gap: '1rem',
                                    alignItems: 'start',
                                    paddingBottom: i === order.tracking!.length - 1 ? 0 : '1.5rem',
                                    position: 'relative',
                                  }}
                                >
                                  {i !== order.tracking!.length - 1 && (
                                    <div style={{
                                      position: 'absolute',
                                      left: 23,
                                      top: 36,
                                      bottom: 0,
                                      width: 2,
                                      background: 'linear-gradient(180deg, var(--line) 0%, transparent 100%)',
                                    }} />
                                  )}
                                  <div
                                    style={{
                                      width: 48,
                                      height: 48,
                                      borderRadius: '50%',
                                      background: `linear-gradient(135deg, ${statusColors[entry.status] || '#6b7280'} 0%, ${statusColors[entry.status] || '#6b7280'}dd 100%)`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '1.2rem',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                      flexShrink: 0,
                                      position: 'relative',
                                      zIndex: 1,
                                    }}
                                  >
                                    {statusIcons[entry.status] || '📋'}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingTop: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)', letterSpacing: '0.02em' }}>
                                      {entry.status}
                                    </p>
                                    {entry.message && (
                                      <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', lineHeight: 1.6, padding: '0.5rem 0.75rem', background: 'var(--ivory)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--gold)' }}>
                                        {entry.message}
                                      </p>
                                    )}
                                    <p style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontWeight: 500, letterSpacing: '0.03em', marginTop: '0.3rem' }}>
                                      {new Date(entry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginTop: '1.25rem', padding: '1.5rem', textAlign: 'center', background: 'var(--ivory-deep)', borderRadius: 'var(--radius-sm)' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>Tracking info will appear once the order is processed.</p>
                          </div>
                        )}

                        {order.status === 'Delivered' && (
                          <div style={{ marginTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '1rem' }}>Order Items</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              {order.items.map((item, idx) => {
                                const product = getProduct(item.id);
                                const reviewed = hasReviewed(order.orderId, item.id);
                                const returnReq = hasReturnRequest(order.orderId, item.id);
                                return (
                                  <div key={idx} style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--line)' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                                      {product ? (
                                        <img
                                          src={product.variants[item.colorIndex]?.images[0] ?? product.variants[0].images[0]}
                                          alt={product.name}
                                          style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                        />
                                      ) : (
                                        <div style={{ width: 48, height: 60, background: 'var(--ivory-deep)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--ink-soft)' }}>
                                          IMG
                                        </div>
                                      )}
                                      <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>{product?.name || item.id}</p>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Qty: {item.qty}</p>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      {!reviewed && !returnReq && (
                                        <>
                                          <button
                                            onClick={() => setShowReviewForm(`${order.orderId}-${item.id}`)}
                                            style={{
                                              flex: 1,
                                              minWidth: 120,
                                              padding: '0.6rem 1rem',
                                              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                              color: '#78350f',
                                              border: 'none',
                                              borderRadius: 'var(--radius-sm)',
                                              fontSize: '0.78rem',
                                              fontWeight: 600,
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '0.4rem',
                                            }}
                                          >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                            Write Review
                                          </button>
                                          <button
                                            onClick={() => setShowReturnForm(`${order.orderId}-${item.id}`)}
                                            style={{
                                              flex: 1,
                                              minWidth: 120,
                                              padding: '0.6rem 1rem',
                                              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                                              color: '#991b1b',
                                              border: 'none',
                                              borderRadius: 'var(--radius-sm)',
                                              fontSize: '0.78rem',
                                              fontWeight: 600,
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '0.4rem',
                                            }}
                                          >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                                            Return
                                          </button>
                                        </>
                                      )}
                                      {reviewed && (
                                        <span style={{ fontSize: '0.75rem', color: '#166534', background: '#dcfce7', padding: '0.4rem 0.75rem', borderRadius: '20px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                          Reviewed
                                        </span>
                                      )}
                                      {returnReq && (
                                        <span style={{ fontSize: '0.75rem', color: '#92400e', background: '#fef3c7', padding: '0.4rem 0.75rem', borderRadius: '20px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                          Return Requested
                                        </span>
                                      )}
                                    </div>

                                    <AnimatePresence>
                                      {showReviewForm === `${order.orderId}-${item.id}` && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          style={{ overflow: 'hidden', marginTop: '0.75rem' }}
                                        >
                                          <div style={{ background: 'var(--ivory-deep)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Rate this product</p>
                                            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                  key={star}
                                                  onClick={() => setReviewRating(star)}
                                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                                                >
                                                  <svg width="24" height="24" viewBox="0 0 24 24" fill={star <= reviewRating ? '#fbbf24' : 'none'} stroke={star <= reviewRating ? '#f59e0b' : '#d1d5db'} strokeWidth="2">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                  </svg>
                                                </button>
                                              ))}
                                            </div>
                                            <textarea
                                              value={reviewComment}
                                              onChange={(e) => setReviewComment(e.target.value)}
                                              placeholder="Share your experience with this product..."
                                              style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid var(--line)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontFamily: 'var(--font-body)',
                                                fontSize: '0.85rem',
                                                resize: 'vertical',
                                                minHeight: 80,
                                                background: 'white',
                                              }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                                              <button
                                                onClick={() => { setShowReviewForm(null); setReviewComment(''); setReviewRating(5); }}
                                                style={{
                                                  padding: '0.5rem 1rem',
                                                  background: 'white',
                                                  border: '1px solid var(--line)',
                                                  borderRadius: 'var(--radius-sm)',
                                                  fontSize: '0.82rem',
                                                  cursor: 'pointer',
                                                }}
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                onClick={() => handleSubmitReview(order.orderId, item.id)}
                                                disabled={submitting || !reviewComment.trim()}
                                                style={{
                                                  padding: '0.5rem 1.25rem',
                                                  background: reviewComment.trim() ? 'linear-gradient(135deg, var(--maroon) 0%, var(--maroon-deep) 100%)' : '#d1d5db',
                                                  color: 'white',
                                                  border: 'none',
                                                  borderRadius: 'var(--radius-sm)',
                                                  fontSize: '0.82rem',
                                                  fontWeight: 600,
                                                  cursor: reviewComment.trim() ? 'pointer' : 'not-allowed',
                                                }}
                                              >
                                                {submitting ? 'Submitting...' : 'Submit Review'}
                                              </button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    <AnimatePresence>
                                      {showReturnForm === `${order.orderId}-${item.id}` && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          style={{ overflow: 'hidden', marginTop: '0.75rem' }}
                                        >
                                          <div style={{ background: '#fff5f5', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid #fecaca' }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: '#991b1b' }}>Request Return</p>
                                            <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.75rem' }}>Please select a reason for your return request:</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                              {returnReasons.map((reason) => (
                                                <label
                                                  key={reason}
                                                  style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 0.75rem',
                                                    background: returnReason === reason ? '#fee2e2' : 'white',
                                                    border: `1px solid ${returnReason === reason ? '#fca5a5' : 'var(--line)'}`,
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.82rem',
                                                  }}
                                                >
                                                  <input
                                                    type="radio"
                                                    name={`return-${order.orderId}-${item.id}`}
                                                    value={reason}
                                                    checked={returnReason === reason}
                                                    onChange={() => setReturnReason(reason)}
                                                    style={{ accentColor: '#dc2626' }}
                                                  />
                                                  {reason}
                                                </label>
                                              ))}
                                            </div>
                                            <textarea
                                              value={returnDescription}
                                              onChange={(e) => setReturnDescription(e.target.value)}
                                              placeholder="Additional details (optional)..."
                                              style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid var(--line)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontFamily: 'var(--font-body)',
                                                fontSize: '0.85rem',
                                                resize: 'vertical',
                                                minHeight: 60,
                                                background: 'white',
                                              }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                                              <button
                                                onClick={() => { setShowReturnForm(null); setReturnReason(''); setReturnDescription(''); }}
                                                style={{
                                                  padding: '0.5rem 1rem',
                                                  background: 'white',
                                                  border: '1px solid var(--line)',
                                                  borderRadius: 'var(--radius-sm)',
                                                  fontSize: '0.82rem',
                                                  cursor: 'pointer',
                                                }}
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                onClick={() => handleSubmitReturn(order.orderId, item.id)}
                                                disabled={submitting || !returnReason}
                                                style={{
                                                  padding: '0.5rem 1.25rem',
                                                  background: returnReason ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : '#d1d5db',
                                                  color: 'white',
                                                  border: 'none',
                                                  borderRadius: 'var(--radius-sm)',
                                                  fontSize: '0.82rem',
                                                  fontWeight: 600,
                                                  cursor: returnReason ? 'pointer' : 'not-allowed',
                                                }}
                                              >
                                                {submitting ? 'Submitting...' : 'Submit Return Request'}
                                              </button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

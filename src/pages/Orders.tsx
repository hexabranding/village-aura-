import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ZariDivider from '../components/ZariDivider';
import { api, type Order, type OrderTracking, type Review, type ReturnRequest, resolveUploadUrl } from '../lib/api';
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
  'Product damaged','Product broken','Product defective/not working','Wrong product received',
  'Wrong size/colour/variant','Missing item','Missing accessories/parts','Product quality issue',
  'Product does not match description','Product looks different from images','Packaging damaged',
  'Expired product','Product received used/opened','Other',
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
  const [returnOtherReason, setReturnOtherReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [returnVideo, setReturnVideo] = useState('');
  const [returnResolution, setReturnResolution] = useState('Refund');
  const [returnSettings, setReturnSettings] = useState<any>(null);
  const [eligibility, setEligibility] = useState<Record<string, any>>({});
  const [showOrderReturnForm, setShowOrderReturnForm] = useState<string | null>(null);
  const [showFullTimeline, setShowFullTimeline] = useState<Record<string,boolean>>({});
  const [uploadingReturn, setUploadingReturn] = useState(false);
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
    api.returnSettings.get().then(setReturnSettings).catch(()=>{});
  }, [navigate]);

  useEffect(()=>{
    if(apiOrders.length===0) return;
    apiOrders.filter(o=>o.status==='Delivered').forEach(order=>{
      order.items.forEach(item=>{
        const key=`${order.orderId}-${item.id}`;
        if(eligibility[key]) return;
        api.returns.getEligibility(order.orderId, item.id).then(data=> setEligibility(prev=>({...prev,[key]:data}))).catch(()=>{});
      });
    });
  }, [apiOrders]);

  useEffect(()=>{
    const phone = user?.phone || phoneInput;
    if(!phone || phone.length<10) return;
    const id=setInterval(()=>{ api.orders.getByPhone(phone).then(setApiOrders).catch(()=>{}); api.returns.getByPhone(phone).then(setReturns).catch(()=>{}); }, 10000);
    const onFocus=()=>{ api.orders.getByPhone(phone).then(setApiOrders).catch(()=>{}); };
    window.addEventListener('focus', onFocus);
    return()=>{ clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, [user?.phone, phoneInput]);

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

  const handleReturnMedia = async (files: FileList | null, isVideo: boolean) => {
    if(!files || !files.length) return;
    setUploadingReturn(true);
    try{
      const urls = await api.returns.uploadEvidence(files);
      if(isVideo) setReturnVideo(urls[0]||'');
      else setReturnImages(prev=> [...prev, ...urls].slice(0, returnSettings?.maxImages || 5));
    }catch(e:any){ alert(e.message||'Upload failed'); } finally{ setUploadingReturn(false); }
  };
  const handleSubmitReturn = async (orderId: string, productId: string) => {
    if (!user?.phone || !returnReason) { alert('Select return reason'); return; }
    if(returnReason==='Other' && !returnOtherReason.trim()){ alert('Please specify other reason'); return; }
    const order = allOrders.find(o=>o.orderId===orderId);
    const item = order?.items.find((i:any)=>i.id===productId);
    if(!item) return;
    if(returnQty<1 || returnQty>item.qty){ alert(`Qty must be 1-${item.qty}`); return; }
    const product = getProduct(productId);
    const elig = eligibility[`${orderId}-${productId}`];
    if(elig && elig.eligible===false){ alert(elig.reason); return; }
    setSubmitting(true);
    try {
      const productPrice = product?.price || 0;
      await api.returns.create({
        orderId, productId, phone: user.phone, reason: returnReason, otherReason: returnOtherReason, description: returnDescription.trim(),
        qty: returnQty, images: returnImages, video: returnVideo, resolution: returnResolution, productPrice,
      });
      await fetchReviewsAndReturns(user.phone);
      setShowReturnForm(null); setReturnReason(''); setReturnOtherReason(''); setReturnDescription(''); setReturnQty(1); setReturnImages([]); setReturnVideo(''); setReturnResolution('Refund');
      setSubmitSuccess('return'); setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (err:any) { alert(err.message||'Return failed'); } finally { setSubmitting(false); }
  };

  const hasReviewed = (orderId: string, productId: string) => {
    return reviews.some((r) => r.orderId === orderId && r.productId === productId);
  };

  const hasReturnRequest = (orderId: string, productId: string) => {
    return returns.some((r) => r.orderId === orderId && r.productId === productId);
  };
  const getReturn = (orderId: string, productId: string) => returns.find((r) => r.orderId === orderId && r.productId === productId);
  const hasOrderReturn = (orderId: string) => returns.some((r) => r.orderId === orderId);
  const handleSubmitOrderReturn = async (orderId: string) => {
    if (!user?.phone || !returnReason) return;
    const order = allOrders.find((o) => o.orderId === orderId);
    if (!order) return;
    setSubmitting(true);
    try {
      for (const item of order.items) {
        if (hasReturnRequest(orderId, item.id)) continue;
        await api.returns.create({ orderId, productId: item.id, phone: user.phone, reason: returnReason, description: returnDescription.trim() });
      }
      await fetchReviewsAndReturns(user.phone);
      setShowOrderReturnForm(null); setReturnReason(''); setReturnDescription('');
      setSubmitSuccess('return'); setTimeout(() => setSubmitSuccess(null), 3000);
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length >= 10) {
      fetchApiOrders(phoneInput);
    }
  };

  const allOrders = [
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
      deliveredAt: (o as any).deliveredAt,
      returnDeadline: (o as any).returnDeadline,
      source: 'api' as const,
    })),
    ...localOrders.map((o) => ({ ...o, source: 'local' as const })),
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
                              src={resolveUploadUrl(product.variants[item.colorIndex]?.images[0] ?? product.variants[0].images[0])}
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

                        {(() => {
                          const fallback = (!order.tracking || order.tracking.length === 0) ? [{ status: order.status, timestamp: new Date().toISOString(), message: order.status === 'Pending' ? 'Order placed — awaiting processing' : order.status }] : order.tracking;
                          const isFull = !!showFullTimeline[order.orderId];
                          const displayTracking = isFull ? fallback : fallback.slice(-1);
                          const orderRoadmap = ['Pending','Processing','Shipped','Out for Delivery','Delivered'];
                          const oCol: Record<string,string> = { Pending:'#f59e0b', Processing:'#3b82f6', Shipped:'#8b5cf6', 'Out for Delivery':'#f97316', Delivered:'#10b981', Cancelled:'#ef4444' };
                          const oIco: Record<string,string> = { Pending:'⏳', Processing:'⚙️', Shipped:'🚚', 'Out for Delivery':'🛵', Delivered:'✅', Cancelled:'❌' };
                          const oIdx = orderRoadmap.indexOf(order.status);
                          return (
                          <div style={{ marginTop: '1.25rem' }}>
                            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:'0.75rem' }}>{orderRoadmap.map(s=> <span key={s} style={{ fontSize:'0.62rem', padding:'3px 7px', borderRadius:20, background: oIdx >= orderRoadmap.indexOf(s) ? oCol[s]+'22' : '#f3f4f6', border:`1px solid ${oIdx >= orderRoadmap.indexOf(s) ? oCol[s]+'50' : '#e5e7eb'}`, fontWeight: oIdx >= orderRoadmap.indexOf(s) ? 700 : 400 }}>{oIco[s]} {s}</span> )}{order.status==='Cancelled' && <span style={{ fontSize:'0.62rem', background:'#fee2e2', color:'#991b1b', padding:'3px 7px', borderRadius:20, border:'1px solid #fecaca', fontWeight:700 }}>❌ Cancelled</span>}</div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '1rem' }}>Tracking Timeline</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                              {displayTracking.map((entry: OrderTracking, i: number) => (
                                <div
                                  key={i}
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '48px 1fr',
                                    gap: '1rem',
                                    alignItems: 'start',
                                    paddingBottom: i === displayTracking.length - 1 ? 0 : '1.5rem',
                                    position: 'relative',
                                  }}
                                >
                                  {i !== displayTracking.length - 1 && (
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
                                      background: entry.status==='Cancelled' ? '#ef4444' : `linear-gradient(135deg, ${statusColors[entry.status] || '#6b7280'} 0%, ${statusColors[entry.status] || '#6b7280'}dd 100%)`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: entry.status==='Cancelled' ? '1.4rem' : '1.2rem',
                                      color: '#fff',
                                      boxShadow: entry.status==='Cancelled' ? '0 0 0 3px #fee2e2, 0 4px 12px rgba(239,68,68,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
                                      border: entry.status==='Cancelled' ? '2px solid #fff' : 'none',
                                      flexShrink: 0,
                                      position: 'relative',
                                      zIndex: 1,
                                      lineHeight: 1,
                                    }}
                                  >
                                    {entry.status==='Cancelled' ? '✕' : (statusIcons[entry.status] || '📋')}
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
                            {fallback.length > 1 && (
                              <button onClick={() => setShowFullTimeline(p=>({ ...p, [order.orderId]: !p[order.orderId] }))} style={{ marginTop:'0.75rem', fontSize:'0.75rem', color:'var(--maroon)', background:'white', border:'1px solid var(--line)', padding:'0.35rem 0.7rem', borderRadius:20, cursor:'pointer' }}>
                                {isFull ? 'Show latest only ▲' : `Show full timeline (${fallback.length} steps) ▼`}
                              </button>
                            )}
                          </div>
                        );})()}

                        {order.status==='Cancelled' && <div style={{ marginTop:'1rem', padding:'0.9rem 1rem', background:'#fee2e2', border:'1px solid #fecaca', borderRadius:8, color:'#991b1b', fontSize:'0.82rem', textAlign:'center', fontWeight:600 }}>❌ Cancelled</div>}

                        {order.status === 'Delivered' && (
                          <div style={{ marginTop: '1.5rem' }}>
                            {(() => {
                              const eligKeys = order.items.map(it=>eligibility[`${order.orderId}-${it.id}`]).filter(Boolean);
                              const anyEligible = eligKeys.some(e=>e.eligible);
                              const first = eligKeys.find(e=>e.deliveredOn);
                              const fmt=(d:any)=> new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
                              if(!first) return null;
                              return (
                                <div style={{ background: anyEligible ? '#f0fdf4' : '#fef2f2', border:`1px solid ${anyEligible?'#bbf7d0':'#fecaca'}`, borderRadius:12, padding:'0.85rem 1rem', marginBottom:'1rem' }}>
                                  <div style={{ fontSize:'0.85rem', fontWeight:700, color: anyEligible?'#166534':'#991b1b', display:'flex', alignItems:'center', gap:'0.4rem' }}>{anyEligible?'✅':'❌'} 7-Day Return {anyEligible?`Available`:`Closed`}</div>
                                  <div style={{ fontSize:'0.78rem', color:'#4b5563', marginTop:'0.3rem' }}>Delivered on: <strong>{fmt(first.deliveredOn)}</strong> • Return until: <strong>{fmt(first.returnDeadline)}</strong> • {anyEligible? <span style={{color:'#166534',fontWeight:700}}>{first.daysRemaining} days left</span> : <span style={{color:'#991b1b',fontWeight:700}}>Expired</span>}</div>
                                  {anyEligible && <div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:8, padding:'0.6rem 0.8rem', fontSize:'0.75rem', color:'#92400e', marginTop:'0.6rem', lineHeight:1.5 }}><strong>📹 Important — Record Unboxing Video Now:</strong> {returnSettings?.instructions || 'Please record a clear unboxing/opening video showing package, shipping label, product and issue. This video is required for damage/wrong/missing returns and helps us verify quickly. Keep video until return is completed.'}<br/><span style={{fontSize:'0.7rem'}}>Tip: Open package in front of camera, show label, then product.</span></div>}
                                  {!anyEligible && <div style={{ fontSize:'0.72rem', color:'#991b1b', marginTop:'0.4rem' }}>Return option is hidden after 7 days as per policy.</div>}
                                </div>
                              );
                            })()}
                            <div style={{ background: 'white', border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                              {hasOrderReturn(order.orderId) ? (
                                <div>
                                  {(() => {
                                    const ros = returns.filter((r) => r.orderId === order.orderId);
                                    const ro = ros[0];
                                    const roadmap = ['Pending','Approved','Pickup Scheduled','Picked Up','Completed'];
                                    const col: Record<string,string> = { Pending:'#f59e0b', Approved:'#3b82f6', 'Pickup Scheduled':'#8b5cf6', 'Picked Up':'#f97316', Completed:'#10b981', Rejected:'#ef4444' };
                                    const ico: Record<string,string> = { Pending:'📋', Approved:'✅', Rejected:'❌', 'Pickup Scheduled':'📦', 'Picked Up':'🚚', Completed:'🏁' };
                                    return (
                                      <div>
                                        <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#92400e' }}>↩️ Return Requested — {ros.length} item(s) • <span style={{ color:'#fff', background: col[ro.status]||'#92400e', padding:'2px 8px', borderRadius:12 }}>{ico[ro.status]||''} {ro.status}{ro.pickupDate?` • ${ro.pickupDate}`:''}</span></div>
                                        {ro.adminMessage && <div style={{ fontSize:'0.75rem', background:'#eff6ff', border:'1px solid #bfdbfe', padding:'0.4rem 0.6rem', borderRadius:6, color:'#1e40af', marginTop:6 }}>Admin: {ro.adminMessage}</div>}
                                        <div style={{ display:'flex', gap:3, flexWrap:'wrap', marginTop:6 }}>{roadmap.map(s=> <span key={s} style={{ fontSize:'0.58rem', padding:'2px 5px', borderRadius:20, background: roadmap.indexOf(s) <= roadmap.indexOf(ro.status) ? col[s]+'22' : '#f3f4f6', border:`1px solid ${roadmap.indexOf(s) <= roadmap.indexOf(ro.status) ? col[s]+'50' : '#e5e7eb'}` }}>{ico[s]} {s}</span>)}{ro.status==='Rejected' && <span style={{ fontSize:'0.58rem', background:'#fee2e2', color:'#991b1b', padding:'2px 5px', borderRadius:20 }}>Rejected</span>}</div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : showOrderReturnForm === order.orderId ? (
                                <div>
                                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>Return Entire Order</p>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
                                    {returnReasons.map((r) => (
                                      <label key={r} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.45rem 0.6rem', background: returnReason === r ? '#fee2e2' : 'white', border: `1px solid ${returnReason === r ? '#fca5a5' : 'var(--line)'}`, borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', cursor: 'pointer' }}>
                                        <input type="radio" name={`order-return-${order.orderId}`} checked={returnReason === r} onChange={() => setReturnReason(r)} style={{ accentColor: '#dc2626' }} />{r}
                                      </label>
                                    ))}
                                  </div>
                                  <textarea value={returnDescription} onChange={(e) => setReturnDescription(e.target.value)} placeholder="Details (optional)" style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', minHeight: 60 }} />
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.6rem' }}>
                                    <button onClick={() => { setShowOrderReturnForm(null); setReturnReason(''); setReturnDescription(''); }} style={{ padding: '0.45rem 0.9rem', border: '1px solid var(--line)', background: 'white', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={() => handleSubmitOrderReturn(order.orderId)} disabled={!returnReason || submitting} style={{ padding: '0.45rem 1rem', background: returnReason ? '#dc2626' : '#d1d5db', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600, cursor: returnReason ? 'pointer' : 'not-allowed' }}>{submitting ? 'Submitting...' : 'Submit Return'}</button>
                                  </div>
                                </div>
                              ) : (() => {
                                const anyElig = order.items.some(it=>{ const e=eligibility[`${order.orderId}-${it.id}`]; return !e || e.eligible; });
                                if(!anyElig) return <div style={{ textAlign:'center', fontSize:'0.78rem', color:'#9ca3af', background:'#f9fafb', padding:'0.7rem', borderRadius:8, border:'1px solid #e5e7eb' }}>Return window closed (7 days expired) — no returns available.</div>;
                                return <button onClick={() => setShowOrderReturnForm(order.orderId)} style={{ width: '100%', padding: '0.7rem 1rem', background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>↩️ Return Entire Order - Found Issue?</button>;
                              })()}
                            </div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '1rem' }}>Order Items <span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--ink-soft)' }}>(or return individual items)</span></p>
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
                                          src={resolveUploadUrl(product.variants[item.colorIndex]?.images[0] ?? product.variants[0].images[0])}
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
                                    {(() => {
                                      const elig = eligibility[`${order.orderId}-${item.id}`];
                                      if(!elig) return null;
                                      const fmt = (d:any)=> new Date(d).toLocaleDateString('en-IN');
                                      return (
                                        <div style={{ background: elig.eligible ? '#f0fdf4' : '#fef2f2', border: `1px solid ${elig.eligible ? '#bbf7d0' : '#fecaca'}`, borderRadius:8, padding:'0.5rem 0.7rem', fontSize:'0.72rem', color: elig.eligible ? '#166534' : '#991b1b', marginBottom:'0.6rem' }}>
                                          {elig.eligible ? (
                                            <span>✓ Return eligible • Delivered: {fmt(elig.deliveredOn)} • Until: {fmt(elig.returnDeadline)} • <strong>{elig.daysRemaining} days left</strong></span>
                                          ) : (
                                            <span>✕ {elig.reason} {elig.returnDeadline && `• Deadline: ${fmt(elig.returnDeadline)}`}</span>
                                          )}
                                        </div>
                                      );
                                    })()}
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
                                          {(() => {
                                            const elig = eligibility[`${order.orderId}-${item.id}`];
                                            const canReturn = !elig || elig.eligible;
                                            if(!canReturn) return <span style={{ fontSize:'0.7rem', color:'#9ca3af', background:'#f3f4f6', padding:'0.4rem 0.7rem', borderRadius:20, border:'1px solid #e5e7eb' }}>Return expired</span>;
                                            return (
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
                                                Return Product
                                              </button>
                                            );
                                          })()}
                                        </>
                                      )}
                                      {reviewed && (
                                        <span style={{ fontSize: '0.75rem', color: '#166534', background: '#dcfce7', padding: '0.4rem 0.75rem', borderRadius: '20px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                          Reviewed
                                        </span>
                                      )}
                                      {returnReq && (
                                        <div style={{ flex: 1, minWidth: 220 }}>
                                          {(() => {
                                            const ro = getReturn(order.orderId, item.id);
                                            if (!ro) return <span style={{ fontSize: '0.7rem', color: '#92400e', background: '#fef3c7', padding: '0.3rem 0.6rem', borderRadius: 20, fontWeight: 700 }}>Return Requested</span>;
                                             const roadmap = ['Return Requested','Under Review','Approved','Pickup Scheduled','Picked Up','Product Received','Quality Check','Refund Processing','Completed'];
                                             const col: Record<string,string> = { 'Return Requested':'#f59e0b','Under Review':'#3b82f6', Approved:'#3b82f6','Pickup Scheduled':'#8b5cf6','Picked Up':'#f97316','Product Received':'#06b6d4','Quality Check':'#eab308','Refund Processing':'#10b981', Completed:'#10b981', Rejected:'#ef4444', Cancelled:'#6b7280' };
                                             const ico: Record<string,string> = { 'Return Requested':'📋','Under Review':'👀', Approved:'✅', Rejected:'❌','Pickup Scheduled':'📦','Picked Up':'🚚','Product Received':'📥','Quality Check':'🔍','Refund Processing':'💸', Completed:'🏁', Cancelled:'✕' };
                                             return (
                                               <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                                 <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'center' }}>
                                                   <span style={{ fontSize:'0.7rem', color:'#fff', background: col[ro.status]||'#92400e', padding:'0.3rem 0.6rem', borderRadius:20, fontWeight:700 }}>{ico[ro.status]||''} {ro.status}</span>
                                                   {ro.returnId && <span style={{ fontSize:'0.65rem', background:'#f3f4f6', padding:'0.2rem 0.5rem', borderRadius:12, border:'1px solid #e5e7eb' }}>{ro.returnId}</span>}
                                                   {ro.pickup?.trackingNo && <span style={{ fontSize:'0.65rem', color:'#1e40af' }}>Pickup: {ro.pickup.trackingNo}</span>}
                                                    {(ro.refund?.amount||0)>0 && <span style={{ fontSize:'0.65rem', color:'#166534', background:'#dcfce7', padding:'0.2rem 0.5rem', borderRadius:12 }}>Refund ₹{ro.refund!.amount}</span>}
                                                  </div>
                                                  {ro.adminMessage && <span style={{ fontSize:'0.72rem', background:'#eff6ff', border:'1px solid #bfdbfe', color:'#1e40af', padding:'0.3rem 0.6rem', borderRadius:6 }}>{ro.adminMessage}</span>}
                                                  <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>{roadmap.map(s=> <span key={s} style={{ fontSize:'0.52rem', padding:'2px 4px', borderRadius:20, background: roadmap.indexOf(s) <= roadmap.indexOf(ro.status) ? col[s]+'22' : '#f3f4f6', border:`1px solid ${roadmap.indexOf(s) <= roadmap.indexOf(ro.status) ? col[s]+'50' : '#e5e7eb'}` }}>{ico[s]} {s}</span>)}{ro.status==='Rejected' && <span style={{ fontSize:'0.55rem', background:'#fee2e2', color:'#991b1b', padding:'2px 5px', borderRadius:20, border:'1px solid #fecaca' }}>Rejected</span>}</div>
                                                  {(ro.images?.length||0)>0 && <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>{ro.images!.slice(0,3).map((img:string,i:number)=><img key={i} src={resolveUploadUrl(img)} alt="evidence" style={{ width:36, height:36, objectFit:'cover', borderRadius:6, border:'1px solid var(--line)' }} />)}{ro.video && <span style={{ fontSize:'0.6rem', background:'#000', color:'white', padding:'0.2rem 0.4rem', borderRadius:6 }}>▶ Video</span>}</div>}
                                                  {ro.tracking && ro.tracking.length>0 && <div style={{ display:'flex', flexDirection:'column', gap:2 }}>{ro.tracking.slice(-4).map((t:any,i:number)=>(<span key={i} style={{ fontSize:'0.62rem', color:'#6b7280' }}>{ico[t.status]||'•'} {t.status}: {t.message} • {new Date(t.timestamp).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>))}</div>}
                                                  {['Return Requested','Under Review'].includes(ro.status) && <button onClick={async()=>{ if(!confirm('Cancel this return request?')) return; try{ await api.returns.cancel((ro as any).id||(ro as any)._id, user?.phone||phoneInput); await fetchReviewsAndReturns(user?.phone||phoneInput); }catch(e:any){ alert(e.message); } }} style={{ alignSelf:'flex-start', marginTop:4, padding:'0.3rem 0.7rem', background:'white', border:'1px solid #fecaca', color:'#991b1b', borderRadius:12, fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>Cancel Return</button>}
                                               </div>
                                             );
                                          })()}
                                        </div>
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
                                          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '1.2rem', border: '1px solid #fecaca', boxShadow: '0 4px 20px rgba(239,68,68,0.08)' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.6rem' }}><span style={{ background:'linear-gradient(135deg,#dc2626,#991b1b)', color:'white', width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, boxShadow:'0 2px 8px rgba(220,38,38,0.3)' }}>↩</span><p style={{ fontSize:'0.9rem', fontWeight:700, color:'#991b1b' }}>Return Request — {product?.name?.slice(0,38)}</p></div>
                                            <div style={{ display:'flex', alignItems:'center', gap:'0.3rem', marginBottom:'0.75rem', background:'#f9fafb', border:'1px solid #f3f4f6', borderRadius:20, padding:'0.4rem 0.6rem' }}>
                                              {['Reason','Evidence','Submit'].map((s,idx)=>(
                                                <div key={s} style={{ display:'flex', alignItems:'center', gap:'0.3rem', flex:1 }}>
                                                  <span style={{ width:22, height:22, borderRadius:'50%', background: idx===0 ? '#dc2626' : '#e5e7eb', color: idx===0 ? 'white' : '#9ca3af', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:700 }}>{idx+1}</span>
                                                  <span style={{ fontSize:'0.68rem', fontWeight:600, color: idx===0 ? '#991b1b' : '#9ca3af' }}>{s}</span>
                                                  {idx<2 && <div style={{ flex:1, height:2, background:'#e5e7eb', borderRadius:1, marginLeft:'0.3rem' }} />}
                                                </div>
                                              ))}
                                            </div>
                                            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10, padding:'0.65rem 0.8rem', fontSize:'0.73rem', color:'#92400e', marginBottom:'0.75rem', display:'flex', gap:'0.5rem' }}><span style={{ fontSize:'1rem' }}>💡</span><span>Upload clear <strong>unboxing video</strong> showing package + label + product + issue. Required for damage/wrong/missing claims.</span></div>
                                            {item.qty>1 && <div style={{ marginBottom:'0.75rem' }}><label style={{ fontSize:'0.75rem', fontWeight:600 }}>Quantity to return</label><div style={{ display:'flex', gap:'0.5rem', marginTop:'0.3rem' }}>{Array.from({length:item.qty},(_,i)=>i+1).map(n=> <button key={n} onClick={()=>setReturnQty(n)} style={{ width:36, height:36, borderRadius:8, border: returnQty===n?'2px solid #dc2626':'1px solid var(--line)', background: returnQty===n?'#fee2e2':'white', fontWeight:600, cursor:'pointer' }}>{n}</button>)}<span style={{ fontSize:'0.72rem', color:'#6b7280', alignSelf:'center', marginLeft:'0.3rem' }}>of {item.qty}</span></div></div>}
                                            <label style={{ fontSize:'0.75rem', fontWeight:600 }}>Return Reason *</label>
                                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem', margin:'0.4rem 0 0.6rem' }}>
                                              {returnReasons.map((reason) => (
                                                <label key={reason} style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.45rem 0.6rem', background: returnReason === reason ? '#fee2e2' : 'white', border: `1px solid ${returnReason === reason ? '#fca5a5' : 'var(--line)'}`, borderRadius:8, cursor:'pointer', fontSize:'0.72rem' }}>
                                                  <input type="radio" name={`return-${order.orderId}-${item.id}`} value={reason} checked={returnReason === reason} onChange={() => setReturnReason(reason)} style={{ accentColor: '#dc2626' }} />{reason}
                                                </label>
                                              ))}
                                            </div>
                                            {returnReason==='Other' && <input value={returnOtherReason} onChange={e=>setReturnOtherReason(e.target.value)} placeholder="Please specify reason *" style={{ width:'100%', padding:'0.6rem', border:'1px solid #fca5a5', borderRadius:8, fontSize:'0.82rem', marginBottom:'0.6rem' }} />}
                                            <label style={{ fontSize:'0.75rem', fontWeight:600 }}>Description</label>
                                            <textarea value={returnDescription} onChange={(e) => setReturnDescription(e.target.value)} placeholder="Additional details..." style={{ width:'100%', padding:'0.6rem', border:'1px solid var(--line)', borderRadius:8, fontSize:'0.82rem', minHeight:60, marginTop:'0.3rem' }} />
                                            <div style={{ marginTop:'0.75rem' }}>
                                              <label style={{ fontSize:'0.75rem', fontWeight:600 }}>Upload Photos {returnSettings?.imagesRequired?'*':''} <span style={{ fontWeight:400, color:'#6b7280' }}>(JPG/PNG/WebP, max {returnSettings?.maxImageSizeMB||5}MB, up to {returnSettings?.maxImages||5})</span></label>
                                              <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginTop:'0.4rem' }}>
                                                {returnImages.map((url,i)=> <div key={i} style={{ position:'relative', width:70, height:70, borderRadius:8, overflow:'hidden', border:'1px solid var(--line)' }}><img src={resolveUploadUrl(url)} alt="evidence" style={{ width:'100%', height:'100%', objectFit:'cover' }} /><button onClick={()=>setReturnImages(prev=>prev.filter((_,idx)=>idx!==i))} style={{ position:'absolute', top:2, right:2, width:18, height:18, borderRadius:'50%', background:'#ef4444', color:'white', border:'none', fontSize:'0.6rem', cursor:'pointer' }}>✕</button></div>)}
                                                {returnImages.length < (returnSettings?.maxImages||5) && <label style={{ width:70, height:70, border:'2px dashed #d1d5db', borderRadius:8, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'0.65rem', color:'#6b7280' }}><input type="file" accept="image/jpeg,image/png,image/webp" multiple style={{display:'none'}} onChange={e=>handleReturnMedia(e.target.files,false)} />+ Photo</label>}
                                              </div>
                                            </div>
                                            <div style={{ marginTop:'0.75rem' }}>
                                              <label style={{ fontSize:'0.75rem', fontWeight:600 }}>Unboxing Video {returnSettings?.videoRequired?'*':''} <span style={{ fontWeight:400, color:'#6b7280' }}>(MP4/MOV, max {returnSettings?.maxVideoSizeMB||50}MB)</span></label>
                                              {returnVideo ? <div style={{ position:'relative', marginTop:'0.4rem', borderRadius:8, overflow:'hidden', background:'#000' }}><video src={resolveUploadUrl(returnVideo)} controls playsInline style={{ width:'100%', maxHeight:200, display:'block' }} /><div style={{ position:'absolute', top:6, right:6, display:'flex', gap:'0.4rem' }}><label style={{ background:'white', color:'#111', border:'none', padding:'0.35rem 0.7rem', borderRadius:12, fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}><input type="file" accept="video/mp4,video/quicktime,video/*" style={{display:'none'}} onChange={e=>{ handleReturnMedia(e.target.files,true); }} />Replace</label><button onClick={()=>setReturnVideo('')} style={{ background:'#ef4444', color:'white', border:'none', padding:'0.35rem 0.7rem', borderRadius:12, fontSize:'0.7rem', fontWeight:600, cursor:'pointer' }}>Remove</button></div></div> : <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.4rem' }}><label style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem', padding:'0.7rem 0.5rem', border:'2px dashed #d1d5db', borderRadius:8, cursor:'pointer', fontSize:'0.72rem', color:'#6b7280', background:'#fafafa' }}><input type="file" accept="video/mp4,video/quicktime,video/*" capture="environment" style={{display:'none'}} onChange={e=>handleReturnMedia(e.target.files,true)} /><span style={{fontSize:'1.1rem'}}>📹</span>Record Video<span style={{fontSize:'0.6rem'}}>Camera</span></label><label style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem', padding:'0.7rem 0.5rem', border:'2px dashed #d1d5db', borderRadius:8, cursor:'pointer', fontSize:'0.72rem', color:'#6b7280', background:'#fafafa' }}><input type="file" accept="video/mp4,video/quicktime,video/*" style={{display:'none'}} onChange={e=>handleReturnMedia(e.target.files,true)} /><span style={{fontSize:'1.1rem'}}>📁</span>Upload Video<span style={{fontSize:'0.6rem'}}>MP4/MOV</span></label></div>}
                                              {uploadingReturn && <div style={{ fontSize:'0.7rem', color:'#3b82f6', marginTop:'0.3rem' }}>Uploading...</div>}
                                            </div>
                                            <div style={{ marginTop:'0.75rem' }}>
                                              <label style={{ fontSize:'0.75rem', fontWeight:600 }}>Preferred Resolution</label>
                                              <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.3rem' }}>
                                                {['Refund','Replacement','Exchange'].map(r=>{
                                                  const enabled = r==='Refund'? (returnSettings?.refundEnabled!==false) : r==='Replacement'? returnSettings?.replacementEnabled : returnSettings?.exchangeEnabled;
                                                  if(!enabled) return null;
                                                  return <button key={r} onClick={()=>setReturnResolution(r)} style={{ flex:1, padding:'0.5rem', borderRadius:8, border: returnResolution===r?'2px solid #dc2626':'1px solid var(--line)', background: returnResolution===r?'#fee2e2':'white', fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>{r}</button>
                                                })}
                                              </div>
                                            </div>
                                            {returnSettings?.returnConditions && <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8, padding:'0.6rem', fontSize:'0.7rem', color:'#4b5563', marginTop:'0.75rem' }}><strong>Conditions:</strong> {returnSettings.returnConditions}</div>}
                                            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'0.7rem', marginTop:'0.75rem' }}>
                                              <p style={{ fontSize:'0.78rem', fontWeight:700, color:'#166534' }}>Summary</p>
                                              <div style={{ fontSize:'0.75rem', color:'#4b5563', lineHeight:1.6, marginTop:'0.3rem' }}>
                                                Product: {product?.name}<br/>Qty: {returnQty} • Reason: {returnReason}{returnReason==='Other' && returnOtherReason?` (${returnOtherReason})`:''}<br/>Resolution: {returnResolution} • Refund: ₹{((product?.price||0)*returnQty).toLocaleString('en-IN')}<br/>Photos: {returnImages.length} • Video: {returnVideo?'Yes':'No'}
                                              </div>
                                            </div>
                                            <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.9rem', justifyContent:'flex-end' }}>
                                              <button onClick={() => { setShowReturnForm(null); setReturnReason(''); setReturnOtherReason(''); setReturnDescription(''); setReturnQty(1); setReturnImages([]); setReturnVideo(''); }} style={{ padding:'0.55rem 1rem', background:'white', border:'1px solid var(--line)', borderRadius:8, fontSize:'0.82rem', cursor:'pointer' }}>Cancel</button>
                                              <button onClick={() => handleSubmitReturn(order.orderId, item.id)} disabled={submitting || !returnReason || (returnReason==='Other'&&!returnOtherReason.trim()) || uploadingReturn} style={{ padding:'0.55rem 1.3rem', background: returnReason ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : '#d1d5db', color:'white', border:'none', borderRadius:8, fontSize:'0.82rem', fontWeight:700, cursor: returnReason?'pointer':'not-allowed' }}>{submitting ? 'Submitting...' : 'Submit Return Request'}</button>
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

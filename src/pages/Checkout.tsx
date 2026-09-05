import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProduct } from '../lib/productStore';
import type { CartItem } from '../data/products';
import ZariDivider from '../components/ZariDivider';
import { api, resolveUploadUrl } from '../lib/api';

interface CheckoutProps {
  cart: CartItem[];
  clearCart: () => void;
}

interface PlacedOrder {
  orderId: string;
  total: number;
  name: string;
  phone: string;
  payment: string;
  date: string;
}

export default function Checkout({ cart, clearCart }: CheckoutProps) {
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: 'Delhi', pincode: '' });
  const [payment, setPayment] = useState('UPI / Pay on App');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = cart
    .map((ci) => ({ ci, product: getProduct(ci.id) }))
    .filter((row) => row.product !== undefined);
  const subtotal = items.reduce((sum, { ci, product }) => sum + product!.price * ci.qty, 0);
  const shipping = subtotal >= 2999 || items.length === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const orderItems = cart.map((ci) => ({ id: ci.id, colorIndex: ci.colorIndex, qty: ci.qty }));
      const result = await api.orders.create({
        total,
        name: form.name,
        phone: form.phone,
        payment,
        items: orderItems,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      });
      clearCart();
      const savedUser = localStorage.getItem('reshamUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        localStorage.setItem('reshamUser', JSON.stringify({ ...user, phone: form.phone, name: form.name || user.name }));
      } else {
        localStorage.setItem('reshamUser', JSON.stringify({ email: '', name: form.name, phone: form.phone }));
      }
      const localOrder = {
        orderId: result.orderId,
        total,
        name: form.name,
        phone: form.phone,
        payment,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'Pending',
        items: cart.map((ci) => ({ id: ci.id, colorIndex: ci.colorIndex, qty: ci.qty })),
      };
      const existingOrders = JSON.parse(localStorage.getItem('reshamOrders') || '[]');
      existingOrders.unshift(localOrder);
      localStorage.setItem('reshamOrders', JSON.stringify(existingOrders));
      setPlaced({
        orderId: result.orderId,
        total,
        name: form.name,
        phone: form.phone,
        payment,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      });
      window.scrollTo(0, 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="container"
        style={{ maxWidth: 620, textAlign: 'center', padding: '5rem 1rem' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          style={{
            width: 84,
            height: 84,
            margin: '0 auto',
            borderRadius: '50%',
            background: 'var(--teal)',
            color: 'var(--ivory)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.4rem',
          }}
        >
          ✓
        </motion.div>
        <span className="eyebrow" style={{ display: 'block', marginTop: '2rem' }}>Order Confirmed</span>
        <h1 style={{ fontSize: '2rem', marginTop: '0.5rem', fontStyle: 'italic' }}>Thank you, {placed.name.split(' ')[0]}!</h1>
        <p style={{ color: 'var(--ink-soft)', marginTop: '0.75rem', lineHeight: 1.8 }}>
          Your order <strong style={{ color: 'var(--maroon)' }}>{placed.orderId}</strong> has been placed.
          <br />
          We&apos;ll call you on <strong>{placed.phone}</strong> to confirm your {placed.payment} payment and handwoven
          delivery details.
        </p>
        <ZariDivider />
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-solid">Back to Home</Link>
          <Link to="/shop" className="btn">Continue Shopping →</Link>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ maxWidth: 620, textAlign: 'center', padding: '5rem 1rem' }}>
        <h2 style={{ fontSize: '1.6rem' }}>Nothing to check out yet</h2>
        <p style={{ color: 'var(--ink-soft)', marginTop: '0.5rem' }}>Your bag is empty — add a few weaves first.</p>
        <Link to="/shop" className="btn btn-solid" style={{ marginTop: '1.5rem' }}>Shop Now</Link>
      </div>
    );
  }

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="container"
      style={{ padding: '3rem 0 5rem', maxWidth: 1080 }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="eyebrow">Almost There</span>
        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', marginTop: '0.4rem', fontStyle: 'italic' }}>Checkout</h1>
      </div>
      <ZariDivider />

      <form
        onSubmit={placeOrder}
        className="checkout-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: '2rem',
          marginTop: '2rem',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Shipping Details</h2>
            <div className="checkout-name-phone" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label className="eyebrow" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>Full Name</label>
                <input required value={form.name} onChange={set('name')} placeholder="Your name" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label className="eyebrow" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>Phone Number</label>
                <input required value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" pattern="[0-9]{10}" maxLength={10} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1rem' }}>
              <label className="eyebrow" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>Full Address</label>
              <input required value={form.address} onChange={set('address')} placeholder="House, street, landmark" style={inputStyle} />
            </div>
            <div className="checkout-address" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label className="eyebrow" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>City</label>
                <input required value={form.city} onChange={set('city')} placeholder="City" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label className="eyebrow" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>State</label>
                <select value={form.state} onChange={set('state')} style={inputStyle}>
                  <option>Delhi</option>
                  <option>Maharashtra</option>
                  <option>Karnataka</option>
                  <option>West Bengal</option>
                  <option>Uttar Pradesh</option>
                  <option>Rajasthan</option>
                  <option>Gujarat</option>
                  <option>Tamil Nadu</option>
                  <option>Telangana</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label className="eyebrow" style={{ color: 'var(--ink-soft)', fontSize: '0.68rem' }}>PIN Code</label>
                <input required value={form.pincode} onChange={set('pincode')} placeholder="6-digit" pattern="[0-9]{6}" maxLength={6} style={inputStyle} />
              </div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Payment Method</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['UPI / Pay on App', 'Credit / Debit Card'].map((m) => (
                <label
                  key={m}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.9rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: payment === m ? '1px solid var(--maroon)' : '1px solid var(--line)',
                    background: payment === m ? 'rgba(107,30,35,0.04)' : 'var(--ivory-deep)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === m}
                    onChange={() => setPayment(m)}
                    style={{ accentColor: 'var(--maroon)', width: 16, height: 16 }}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--ivory-deep)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem', position: 'sticky', top: '120px' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Your Order</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1rem' }}>
            {items.map(({ ci, product }) => (
              <div key={`${ci.id}-${ci.colorIndex}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img
                  src={resolveUploadUrl(product!.variants[ci.colorIndex]?.images[0] ?? product!.variants[0].images[0])}
                  alt={product!.name}
                  style={{ width: 46, height: 58, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0, fontSize: '0.82rem', lineHeight: 1.3 }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product!.name}</div>
                  <div style={{ color: 'var(--ink-soft)' }}>Qty {ci.qty}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', color: 'var(--maroon)', fontSize: '0.9rem' }}>
                  ₹{(product!.price * ci.qty).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ink-soft)' }}>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ink-soft)' }}>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.25rem' }}>
              <span>Total</span>
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--maroon)' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '0.9rem', lineHeight: 1.6 }}>
            Made-to-order pieces ship in 10–14 days; ready stock in 3–5 days. Free returns within 7 days for unworn, tag-intact sarees.
          </p>
          {error && (
            <p style={{ color: '#c0392b', fontSize: '0.82rem', textAlign: 'center', marginTop: '0.75rem' }}>{error}</p>
          )}
          <button type="submit" disabled={loading} className="btn btn-solid" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Placing Order...' : `Place Order — ₹${total.toLocaleString('en-IN')}`}
          </button>
          <Link to="/cart" className="eyebrow" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: 'var(--maroon)' }}>
            ← Back to Bag
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import type { OrderTracking } from '../lib/api';

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
  Processing: '⚙',
  Shipped: '🚚',
  'Out for Delivery': '🛵',
  Delivered: '✅',
  Cancelled: '❌',
};

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<{
    orderId: string;
    status: string;
    tracking: OrderTracking[];
    estimatedDelivery: string;
    lastUpdated: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const data = await api.orders.track(orderId.trim());
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '70vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <h1 style={{ fontSize: '1.8rem', fontStyle: 'italic', color: 'var(--maroon-deep)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            Track Your Order
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
            Enter your order ID to see the latest status and tracking details
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onSubmit={handleSearch}
          style={{
            background: 'var(--ivory)',
            padding: '2rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)',
            boxShadow: '0 4px 20px rgba(36,27,21,0.06)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID (e.g. RSM-XXXXX)"
              autoFocus
              style={{
                flex: 1,
                padding: '0.85rem 1rem',
                border: '1px solid var(--line)',
                borderBottom: '2px solid var(--gold-soft)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--ivory-deep)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.92rem',
                color: 'var(--ink)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-solid"
              disabled={loading}
              style={{ padding: '0.85rem 1.5rem', whiteSpace: 'nowrap' }}
            >
              {loading ? '...' : 'Track →'}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: '0.75rem', color: '#dc2626', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}
        </motion.form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              background: 'var(--ivory)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--line)',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(36,27,21,0.06)',
            }}>
              {/* Status Header */}
              <div style={{
                padding: '1.5rem 2rem',
                background: `${statusColors[result.status]}10`,
                borderBottom: `2px solid ${statusColors[result.status]}30`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  background: statusColors[result.status],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0,
                }}>
                  {statusIcons[result.status] || '📋'}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Order {result.orderId}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, color: statusColors[result.status] }}>
                    {result.status}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {result.tracking && result.tracking.length > 0 && (
                <div style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                    <div style={{
                      position: 'absolute',
                      left: '0.6rem',
                      top: '0.3rem',
                      bottom: '0.3rem',
                      width: '2px',
                      background: 'var(--line)',
                    }} />
                    {result.tracking.map((entry: OrderTracking, i: number) => (
                      <div key={i} style={{ position: 'relative', marginBottom: i < result.tracking.length - 1 ? '1.25rem' : 0 }}>
                        <div style={{
                          position: 'absolute',
                          left: '-1.4rem',
                          top: '0.15rem',
                          width: '0.85rem',
                          height: '0.85rem',
                          borderRadius: '50%',
                          background: statusColors[entry.status] || 'var(--ink-soft)',
                          border: '2px solid var(--ivory)',
                          zIndex: 1,
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>{statusIcons[entry.status] || '📋'}</span>
                              {entry.status}
                            </div>
                            {entry.message && (
                              <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginTop: '0.2rem' }}>
                                {entry.message}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {new Date(entry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: '1rem 2rem', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                {result.estimatedDelivery && (
                  <div><strong>Est. Delivery:</strong> {result.estimatedDelivery}</div>
                )}
                <div>Last updated: {new Date(result.lastUpdated).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

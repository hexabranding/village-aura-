import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { Order, OrderTracking } from '../lib/api';

const allStatuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusModal, setStatusModal] = useState<{ orderId: string; currentStatus: string } | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const loadOrders = async () => {
    try {
      const data = await api.orders.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchesSearch = o.orderId.toLowerCase().includes(search.toLowerCase()) || o.name.toLowerCase().includes(search.toLowerCase()) || o.phone.includes(search);
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openStatusModal = (order: Order) => {
    setNewStatus(order.status);
    setStatusMessage('');
    setEstimatedDelivery(order.estimatedDelivery || '');
    setOrderNotes(order.notes || '');
    setStatusModal({ orderId: order.orderId, currentStatus: order.status });
  };

  const handleStatusUpdate = async () => {
    if (!statusModal) return;
    try {
      await api.orders.updateStatus(statusModal.orderId, {
        status: newStatus,
        message: statusMessage || `Status updated to ${newStatus}`,
        estimatedDelivery,
        notes: orderNotes,
      });
      await loadOrders();
      setStatusModal(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    processing: orders.filter((o) => o.status === 'Processing').length,
    shipped: orders.filter((o) => o.status === 'Shipped').length,
    outForDelivery: orders.filter((o) => o.status === 'Out for Delivery').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
    cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  };

  if (loading) return <div className="admin-empty">Loading orders...</div>;

  return (
    <div>
      <div className="admin-order-stats">
        {allStatuses.slice(0, 5).map((s) => (
          <div key={s} className="admin-order-stat" style={{ borderLeftColor: statusColors[s] }}>
            <div className="admin-order-stat-value">{stats[s.toLowerCase().replace(/\s+/g, '') as keyof typeof stats]}</div>
            <div className="admin-order-stat-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            type="text"
            placeholder="Search by ID, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-select">
            <option value="All">All Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.orderId} onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)} style={{ cursor: 'pointer' }}>
                  <td><code style={{ fontSize: '0.75rem' }}>{order.orderId}</code></td>
                  <td style={{ fontWeight: 500 }}>{order.name}</td>
                  <td>{order.phone}</td>
                  <td>{order.items?.length || 0}</td>
                  <td style={{ fontWeight: 600, color: 'var(--maroon)' }}>₹{order.total.toLocaleString('en-IN')}</td>
                  <td><span style={{ fontSize: '0.78rem' }}>{order.payment}</span></td>
                  <td>
                    <span className={`admin-status-badge ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{order.date}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openStatusModal(order)} className="admin-btn-sm edit">Update</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="admin-empty">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Order Detail */}
      <AnimatePresence>
        {expandedOrder && (() => {
          const order = orders.find((o) => o.orderId === expandedOrder);
          if (!order) return null;
          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                background: 'var(--ivory)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: '1.5rem',
                marginTop: '0.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Order Details — {order.orderId}</h3>
                  <button onClick={() => setExpandedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--ink-soft)' }}>✕</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.82rem' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)' }}>Customer</strong>
                    <div style={{ fontWeight: 500 }}>{order.name}</div>
                    <div>{order.phone}</div>
                    {order.email && <div style={{ color: 'var(--ink-soft)' }}>{order.email}</div>}
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)' }}>Shipping Address</strong>
                    <div>{order.address || 'N/A'}</div>
                    <div>{order.city || ''}, {order.state || ''} {order.pincode || ''}</div>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)' }}>Items</strong>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ marginBottom: '0.15rem' }}>
                        {item.id} × {item.qty}
                      </div>
                    )) || 'N/A'}
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)' }}>Payment & Total</strong>
                    <div>{order.payment}</div>
                    <div style={{ fontWeight: 600, color: 'var(--maroon)', fontSize: '1rem' }}>₹{order.total.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                {order.notes && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--ivory-deep)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                    <strong style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)' }}>Notes: </strong>
                    {order.notes}
                  </div>
                )}

                {/* Tracking Timeline */}
                {order.tracking && order.tracking.length > 0 && (
                  <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
                    <strong style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink-soft)' }}>Tracking Timeline</strong>
                    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                      {/* Vertical line */}
                      <div style={{
                        position: 'absolute',
                        left: '0.55rem',
                        top: '0.3rem',
                        bottom: '0.3rem',
                        width: '2px',
                        background: 'var(--line)',
                      }} />
                      {order.tracking.map((entry: OrderTracking, i: number) => (
                        <div key={i} style={{ position: 'relative', marginBottom: i < order.tracking!.length - 1 ? '1rem' : 0 }}>
                          <div style={{
                            position: 'absolute',
                            left: '-1.55rem',
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
                              <div style={{ fontWeight: 500, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span>{statusIcons[entry.status] || '📋'}</span>
                                {entry.status}
                              </div>
                              {entry.message && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--ink-soft)', marginTop: '0.15rem' }}>
                                  {entry.message}
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {new Date(entry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.estimatedDelivery && (
                  <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                    <strong>Estimated Delivery:</strong> {order.estimatedDelivery}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Status Update Modal */}
      <AnimatePresence>
        {statusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-modal-overlay"
            onClick={() => setStatusModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="admin-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>Update Order Status</h3>
                <button onClick={() => setStatusModal(null)} className="admin-modal-close">✕</button>
              </div>

              <div className="admin-modal-body">
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginBottom: '1rem' }}>
                  Order: <strong>{statusModal.orderId}</strong> | Current: <strong style={{ color: statusColors[statusModal.currentStatus] }}>{statusModal.currentStatus}</strong>
                </div>

                <div className="admin-form-group">
                  <label>New Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    {allStatuses.map((s) => (
                      <option key={s} value={s}>{statusIcons[s]} {s}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Status Message</label>
                  <input value={statusMessage} onChange={(e) => setStatusMessage(e.target.value)} placeholder={`e.g. Order has been ${newStatus.toLowerCase()}`} />
                </div>

                <div className="admin-form-group">
                  <label>Estimated Delivery</label>
                  <input value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} placeholder="e.g. 20 Aug 2026" />
                </div>

                <div className="admin-form-group">
                  <label>Order Notes</label>
                  <textarea rows={2} value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="Internal notes about this order..." />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button onClick={() => setStatusModal(null)} className="admin-btn admin-btn-outline">Cancel</button>
                <button onClick={handleStatusUpdate} className="admin-btn admin-btn-primary">
                  Update Status
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

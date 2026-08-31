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

const statusGradients: Record<string, string> = {
  Pending: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  Processing: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  Shipped: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
  'Out for Delivery': 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
  Delivered: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
  Cancelled: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
};

const statusTextColors: Record<string, string> = {
  Pending: '#92400e',
  Processing: '#1e40af',
  Shipped: '#5b21b6',
  'Out for Delivery': '#9a3412',
  Delivered: '#065f46',
  Cancelled: '#991b1b',
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
    setStatusModal({ orderId: order.id, currentStatus: order.status });
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

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="admin-products-spinner" />
        <span>Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-products-stats">
        {allStatuses.slice(0, 5).map((s) => {
          const key = s.toLowerCase().replace(/\s+/g, '') as keyof typeof stats;
          return (
            <div key={s} className="admin-products-stat">
              <div className="admin-stat-icon" style={{ background: statusGradients[s], color: statusTextColors[s] }}>
                {statusIcons[s]}
              </div>
              <div className="admin-products-stat-text">
                <span className="admin-products-stat-value">{stats[key]}</span>
                <span className="admin-products-stat-label">{s}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-products-toolbar">
        <div className="admin-products-toolbar-left">
          <div className="admin-products-search-wrap">
            <span className="admin-products-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by ID, name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-products-search"
            />
            {search && (
              <button className="admin-products-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-products-filter">
            <option value="All">All Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
          {filtered.length} order{filtered.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <div className="admin-orders-list">
        {filtered.map((order, index) => (
          <motion.div
            key={order.orderId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`admin-order-card ${expandedOrder === order.orderId ? 'expanded' : ''}`}
          >
            <div className="admin-order-card-main" onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}>
              <div className="admin-order-card-status-bar" style={{ background: statusColors[order.status] }} />

              <div className="admin-order-card-info">
                <div className="admin-order-card-header">
                  <div>
                    <span className="admin-order-card-id">{order.orderId}</span>
                    <h4 className="admin-order-card-name">{order.name}</h4>
                  </div>
                  <span
                    className="admin-order-card-badge"
                    style={{
                      background: statusGradients[order.status],
                      color: statusTextColors[order.status],
                    }}
                  >
                    {statusIcons[order.status]} {order.status}
                  </span>
                </div>

                <div className="admin-order-card-details">
                  <div className="admin-order-card-detail">
                    <span className="admin-order-card-detail-label">Phone</span>
                    <span className="admin-order-card-detail-value">{order.phone}</span>
                  </div>
                  <div className="admin-order-card-detail">
                    <span className="admin-order-card-detail-label">Items</span>
                    <span className="admin-order-card-detail-value">{order.items?.length || 0}</span>
                  </div>
                  <div className="admin-order-card-detail">
                    <span className="admin-order-card-detail-label">Payment</span>
                    <span className="admin-order-card-detail-value">{order.payment}</span>
                  </div>
                  <div className="admin-order-card-detail">
                    <span className="admin-order-card-detail-label">Date</span>
                    <span className="admin-order-card-detail-value">{order.date}</span>
                  </div>
                </div>
              </div>

              <div className="admin-order-card-price">
                <span className="admin-order-card-total">₹{order.total.toLocaleString('en-IN')}</span>
              </div>

              <div className="admin-order-card-actions" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => openStatusModal(order)} className="admin-order-card-update">
                  <span>✏️</span> Update
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedOrder === order.orderId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="admin-order-card-detail-panel"
                >
                  <div className="admin-order-card-detail-grid">
                    <div className="admin-order-card-detail-section">
                      <span className="admin-order-card-detail-title">Customer</span>
                      <div className="admin-order-card-detail-text">{order.name}</div>
                      <div className="admin-order-card-detail-text">{order.phone}</div>
                      {order.email && <div className="admin-order-card-detail-text muted">{order.email}</div>}
                    </div>
                    <div className="admin-order-card-detail-section">
                      <span className="admin-order-card-detail-title">Shipping Address</span>
                      <div className="admin-order-card-detail-text">{order.address || 'N/A'}</div>
                      <div className="admin-order-card-detail-text">{order.city || ''}, {order.state || ''} {order.pincode || ''}</div>
                    </div>
                    <div className="admin-order-card-detail-section">
                      <span className="admin-order-card-detail-title">Items</span>
                      {order.items?.map((item, i) => (
                        <div key={i} className="admin-order-card-detail-text">{item.id} × {item.qty}</div>
                      )) || <div className="admin-order-card-detail-text muted">N/A</div>}
                    </div>
                    <div className="admin-order-card-detail-section">
                      <span className="admin-order-card-detail-title">Payment & Total</span>
                      <div className="admin-order-card-detail-text">{order.payment}</div>
                      <div className="admin-order-card-detail-total">₹{order.total.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="admin-order-card-notes">
                      <strong>Notes:</strong> {order.notes}
                    </div>
                  )}

                  {order.tracking && order.tracking.length > 0 && (
                    <div className="admin-order-card-timeline">
                      <span className="admin-order-card-detail-title">Tracking Timeline</span>
                      <div className="admin-timeline">
                        {order.tracking.map((entry: OrderTracking, i: number) => (
                          <div key={i} className="admin-timeline-item">
                            <div
                              className="admin-timeline-dot"
                              style={{
                                background: `linear-gradient(135deg, ${statusColors[entry.status] || '#6b7280'} 0%, ${statusColors[entry.status] || '#6b7280'}dd 100%)`,
                              }}
                            >
                              {statusIcons[entry.status] || '📋'}
                            </div>
                            <div className="admin-timeline-content">
                              <div className="admin-timeline-status">{entry.status}</div>
                              {entry.message && <div className="admin-timeline-message">{entry.message}</div>}
                              <div className="admin-timeline-date">
                                {new Date(entry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.estimatedDelivery && (
                    <div className="admin-order-card-eta">
                      <strong>Estimated Delivery:</strong> {order.estimatedDelivery}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="admin-products-empty">
            <span className="admin-products-empty-icon">📦</span>
            <h3>No orders found</h3>
            <p>{search ? 'Try a different search term' : 'Orders will appear here when customers place them'}</p>
          </div>
        )}
      </div>

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
                <div className="admin-order-modal-info">
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
                <button onClick={handleStatusUpdate} className="admin-btn admin-btn-primary">Update Status</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

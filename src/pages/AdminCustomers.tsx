import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      const data = await api.customers.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.customers.delete(id);
      await loadCustomers();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="admin-products-spinner" />
        <span>Loading customers...</span>
      </div>
    );
  }

  return (
    <div className="admin-products-page">
      <div className="admin-products-stats">
        <div className="admin-products-stat">
          <div className="admin-products-stat-icon-box" style={{ background: 'linear-gradient(135deg, rgba(107,30,35,0.08) 0%, rgba(107,30,35,0.04) 100%)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--maroon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{customers.length}</span>
            <span className="admin-products-stat-label">Total Customers</span>
          </div>
        </div>
      </div>

      <div className="admin-products-toolbar">
        <div className="admin-products-toolbar-left">
          <div className="admin-products-search-wrap">
            <svg className="admin-products-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-products-search"
            />
            {search && (
              <button className="admin-products-search-clear" onClick={() => setSearch('')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Joined</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <div className="admin-product-cell">
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--maroon)', color: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}>
                        {customer.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="admin-product-info">
                        <span className="admin-product-name">{customer.name}</span>
                        <span className="admin-product-id">{customer._id.slice(-8)}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{customer.email}</td>
                  <td style={{ fontSize: '0.82rem' }}>{customer.phone || '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {[customer.city, customer.state].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
                    {new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      {deleteConfirm === customer._id ? (
                        <div className="admin-delete-confirm">
                          <button onClick={() => handleDelete(customer._id)} className="admin-action-btn confirm-delete" title="Confirm delete">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="admin-action-btn cancel-delete" title="Cancel">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(customer._id)}
                          className="admin-action-btn delete"
                          title="Delete customer"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--ink-soft)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 12 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No customers found</div>
                    <div style={{ fontSize: '0.82rem', marginTop: 6, opacity: 0.7 }}>{search ? 'Try a different search term' : 'No registered customers yet'}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

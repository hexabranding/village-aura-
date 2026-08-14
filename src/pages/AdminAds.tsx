import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { Ad } from '../lib/api';

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    type: 'carousel' as 'fixed' | 'carousel',
    position: 'homepage' as 'homepage' | 'sidebar' | 'banner',
    active: true,
    order: 1,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAds = async () => {
    try {
      const data = await api.ads.getAll();
      setAds(data);
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', description: '', image: '', link: '', type: 'carousel', position: 'homepage', active: true, order: 1 });
    setShowModal(true);
  };

  const openEdit = (ad: Ad) => {
    setEditing(ad);
    setForm({
      title: ad.title,
      description: ad.description,
      image: ad.image,
      link: ad.link,
      type: ad.type || 'carousel',
      position: ad.position || 'homepage',
      active: ad.active,
      order: ad.order || 1,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title) return;
    try {
      if (editing) {
        await api.ads.update(editing.id, form);
      } else {
        await api.ads.create(form);
      }
      await loadAds();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save ad:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.ads.delete(id);
      await loadAds();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete ad:', error);
    }
  };

  const toggleActive = async (ad: Ad) => {
    try {
      await api.ads.update(ad.id, { active: !ad.active });
      await loadAds();
    } catch (error) {
      console.error('Failed to toggle ad:', error);
    }
  };

  const typeLabels = { carousel: 'Carousel', fixed: 'Fixed' };
  const positionLabels = { homepage: 'Homepage', sidebar: 'Sidebar', banner: 'Banner' };
  const positionColors: Record<string, string> = { homepage: '#3b82f6', sidebar: '#10b981', banner: '#f59e0b' };

  if (loading) return <div className="admin-empty">Loading advertisements...</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <span style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
            {ads.length} advertisement{ads.length !== 1 ? 's' : ''} total,{' '}
            {ads.filter((a) => a.active).length} active
          </span>
        </div>
        <button onClick={openAdd} className="admin-btn admin-btn-primary">+ Add Advertisement</button>
      </div>

      <div className="admin-ads-grid">
        {ads.map((ad) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`admin-ad-card ${!ad.active ? 'inactive' : ''}`}
          >
            {ad.image ? (
              <div className="admin-ad-image">
                <img src={ad.image} alt={ad.title} />
                {!ad.active && <div className="admin-ad-overlay">Inactive</div>}
              </div>
            ) : (
              <div className="admin-ad-placeholder">📢</div>
            )}
            <div className="admin-ad-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{ad.title}</h4>
                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                  <span className={`admin-tag ${ad.active ? 'new' : ''}`} style={{ fontSize: '0.65rem' }}>
                    {ad.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem',
                  background: 'var(--ivory-deep)',
                  border: '1px solid var(--line)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--ink-soft)',
                }}>
                  {typeLabels[ad.type] || ad.type}
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  background: `${positionColors[ad.position]}15`,
                  border: `1px solid ${positionColors[ad.position]}40`,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  color: positionColors[ad.position],
                  fontWeight: 500,
                }}>
                  {positionLabels[ad.position] || ad.position}
                </span>
                {ad.order > 0 && (
                  <span style={{
                    fontSize: '0.68rem',
                    background: 'var(--ivory-deep)',
                    border: '1px solid var(--line)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--ink-soft)',
                  }}>
                    Order: {ad.order}
                  </span>
                )}
              </div>
              {ad.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', margin: '0.5rem 0', lineHeight: 1.5 }}>
                  {ad.description}
                </p>
              )}
              {ad.link && (
                <div style={{ fontSize: '0.72rem', color: 'var(--teal)', wordBreak: 'break-all' }}>
                  🔗 {ad.link}
                </div>
              )}
            </div>
            <div className="admin-ad-actions">
              <button onClick={() => toggleActive(ad)} className="admin-btn-sm edit">
                {ad.active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => openEdit(ad)} className="admin-btn-sm edit">Edit</button>
              {deleteConfirm === ad.id ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleDelete(ad.id)} className="admin-btn-sm delete-confirm">Yes</button>
                  <button onClick={() => setDeleteConfirm(null)} className="admin-btn-sm cancel">No</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(ad.id)} className="admin-btn-sm delete">Delete</button>
              )}
            </div>
          </motion.div>
        ))}

        {ads.length === 0 && (
          <div className="admin-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📢</div>
            <h3 style={{ margin: '0 0 0.5rem' }}>No Advertisements Yet</h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Create your first advertisement to promote products on your store.
            </p>
            <button onClick={openAdd} className="admin-btn admin-btn-primary">+ Create First Ad</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="admin-modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="admin-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>{editing ? 'Edit Advertisement' : 'Add New Advertisement'}</h3>
                <button onClick={() => setShowModal(false)} className="admin-modal-close">✕</button>
              </div>

              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Title *</label>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Summer Collection Sale" />
                </div>

                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe your advertisement..." />
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Type</label>
                    <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'fixed' | 'carousel' }))}>
                      <option value="carousel">Carousel (Homepage Slider)</option>
                      <option value="fixed">Fixed (Static Banner)</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Position</label>
                    <select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as 'homepage' | 'sidebar' | 'banner' }))}>
                      <option value="homepage">Homepage</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="banner">Banner (Top)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Display Order</label>
                  <input type="number" min={1} value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '0.25rem', display: 'block' }}>
                    Lower numbers appear first
                  </span>
                </div>

                <div className="admin-form-group">
                  <label>Image URL</label>
                  <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://example.com/ad-image.jpg" />
                  {form.image && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <img src={form.image} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    </div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label>Link URL</label>
                  <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="/shop?category=Sarees" />
                </div>

                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                    Active (visible on store)
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button onClick={() => setShowModal(false)} className="admin-btn admin-btn-outline">Cancel</button>
                <button onClick={handleSave} className="admin-btn admin-btn-primary">
                  {editing ? 'Save Changes' : 'Add Advertisement'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

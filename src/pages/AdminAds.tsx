import { useState, useEffect, useRef } from 'react';
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
    offer: '',
    type: 'carousel' as 'fixed' | 'carousel',
    position: 'homepage' as 'homepage' | 'sidebar' | 'banner',
    active: true,
    order: 1,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('reshamAdminToken');
      if (!token) {
        setAdminChecked(false);
        return;
      }
      try {
        await api.auth.verify();
        setAdminChecked(true);
        await loadAds();
      } catch {
        localStorage.removeItem('reshamAdminToken');
        setAdminChecked(false);
      }
    };
    checkAdmin();
  }, []);

  const loadAds = async () => {
    try {
      const data = await api.ads.getAll();
      setAds(data);
    } catch (error) {
      console.error('Failed to load ads:', error);
      setAdminChecked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const urls = await api.upload.images(files);
      setForm((f) => ({ ...f, image: urls[0] }));
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', description: '', image: '', link: '', offer: '', type: 'carousel', position: 'homepage', active: true, order: 1 });
    setSaveError(null); setSaving(false);
    setShowModal(true);
  };

  const openEdit = (ad: Ad) => {
    setEditing(ad);
    setForm({
      title: ad.title,
      description: ad.description,
      image: ad.image,
      link: ad.link,
      offer: (ad as any).offer || '',
      type: ad.type || 'carousel',
      position: ad.position || 'homepage',
      active: ad.active,
      order: ad.order || 1,
    });
    setSaveError(null); setSaving(false);
    setShowModal(true);
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const handleSave = async () => {
    if (!form.title.trim()) { setSaveError('Title is required'); return; }
    if (!form.image) { setSaveError('Image is required'); return; }
    setSaving(true); setSaveError(null);
    try {
      const payload = { ...form, title: form.title.trim() };
      if (editing) {
        await api.ads.update(editing.id, payload);
      } else {
        await api.ads.create(payload as any);
      }
      await loadAds();
      setShowModal(false);
    } catch (error: any) {
      console.error('Failed to save ad:', error);
      setSaveError(error?.message || 'Failed to save — check login and try again');
    } finally { setSaving(false); }
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
  const positionLabels = { homepage: 'Homepage', sidebar: 'Sidebar (hidden)', banner: 'Banner (Top)' };
  const positionColors: Record<string, string> = { homepage: '#3b82f6', sidebar: '#10b981', banner: '#f59e0b' };

  if (!adminChecked) {
    return (
      <div className="admin-products-loading">
        <div className="admin-products-spinner" />
        <span>Verifying admin access...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="admin-products-spinner" />
        <span>Loading advertisements...</span>
      </div>
    );
  }

  const stats = {
    total: ads.length,
    active: ads.filter((a) => a.active).length,
    homepage: ads.filter((a) => a.position === 'homepage').length,
    banner: ads.filter((a) => a.position === 'banner').length,
  };

  return (
    <div className="admin-ads-page">
      <div className="admin-products-stats">
        <div className="admin-products-stat">
          <div className="admin-stat-icon maroon">📢</div>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{stats.total}</span>
            <span className="admin-products-stat-label">Total Ads</span>
          </div>
        </div>
        <div className="admin-products-stat green">
          <div className="admin-stat-icon green">✅</div>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{stats.active}</span>
            <span className="admin-products-stat-label">Active</span>
          </div>
        </div>
        <div className="admin-products-stat">
          <div className="admin-stat-icon gold">🏠</div>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{stats.homepage}</span>
            <span className="admin-products-stat-label">Homepage</span>
          </div>
        </div>
        <div className="admin-products-stat">
          <div className="admin-stat-icon teal">📋</div>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{stats.banner}</span>
            <span className="admin-products-stat-label">Banner</span>
          </div>
        </div>
      </div>

      <div className="admin-products-toolbar">
        <div className="admin-products-toolbar-left">
          <button onClick={openAdd} className="admin-products-add-btn">
            <span>+</span> Add Advertisement
          </button>
        </div>
      </div>

      <div className="admin-ads-grid">
        {ads.map((ad, index) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`admin-ad-card ${!ad.active ? 'inactive' : ''}`}
          >
            {ad.image ? (
              <div className="admin-ad-card-image">
                <img src={ad.image} alt={ad.title} />
                {!ad.active && <div className="admin-ad-card-overlay">Inactive</div>}
              </div>
            ) : (
              <div className="admin-ad-card-placeholder">
                <span>📢</span>
              </div>
            )}

            <div className="admin-ad-card-content">
              <div className="admin-ad-card-header">
                <h4 className="admin-ad-card-title">{ad.title}</h4>
                <div className="admin-ad-card-badges">
                  <span className={`admin-tag ${ad.active ? 'new' : ''}`}>
                    {ad.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="admin-ad-card-tags">
                <span className="admin-ad-tag type">{typeLabels[ad.type] || ad.type}</span>
                <span className="admin-ad-tag position" style={{ color: positionColors[ad.position], background: `${positionColors[ad.position]}15`, borderColor: `${positionColors[ad.position]}40` }}>
                  {positionLabels[ad.position] || ad.position}
                </span>
                {(ad as any).offer && <span className="admin-ad-tag" style={{ color: '#c08a3e', background: '#c08a3e15', borderColor: '#c08a3e40' }}>Offer: {(ad as any).offer}</span>}
                {ad.order > 0 && <span className="admin-ad-tag order">Order: {ad.order}</span>}
              </div>

              {ad.description && (
                <p className="admin-ad-card-desc">{ad.description}</p>
              )}

              {ad.link && (
                <div className="admin-ad-card-link">🔗 {ad.link}</div>
              )}
            </div>

            <div className="admin-ad-card-actions">
              <button onClick={() => toggleActive(ad)} className={`admin-ad-card-action ${ad.active ? 'deactivate' : 'activate'}`}>
                {ad.active ? '⏸ Deactivate' : '▶ Activate'}
              </button>
              <button onClick={() => openEdit(ad)} className="admin-ad-card-action edit">✏️ Edit</button>
              {deleteConfirm === ad.id ? (
                <div className="admin-ad-card-confirm">
                  <button onClick={() => handleDelete(ad.id)} className="admin-btn-sm delete-confirm">Yes</button>
                  <button onClick={() => setDeleteConfirm(null)} className="admin-btn-sm cancel">No</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(ad.id)} className="admin-ad-card-action delete">🗑 Delete</button>
              )}
            </div>
          </motion.div>
        ))}

        {ads.length === 0 && (
          <div className="admin-products-empty" style={{ gridColumn: '1 / -1' }}>
            <span className="admin-products-empty-icon">📢</span>
            <h3>No Advertisements Yet</h3>
            <p>Create your first advertisement to promote products on your store.</p>
            <button onClick={openAdd} className="admin-products-add-btn" style={{ marginTop: '1rem' }}>
              <span>+</span> Create First Ad
            </button>
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

                <div className="admin-form-group">
                  <label>Offer Badge — Fixed Banner Only</label>
                  <input value={form.offer} onChange={(e) => setForm((f) => ({ ...f, offer: e.target.value }))} placeholder="e.g. 50% OFF · Festive Offer" />
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '0.25rem', display: 'block' }}>
                    Shown as overlay on the fixed banner image (gradient section) — leave empty to hide
                  </span>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Type — where it shows on Home</label>
                    <select
                      value={form.type}
                      onChange={(e) => {
                        const type = e.target.value as 'fixed' | 'carousel';
                        setForm((f) => ({
                          ...f,
                          type,
                          position: type === 'fixed' ? 'banner' : 'homepage',
                        }));
                      }}
                    >
                      <option value="carousel">Carousel — slider (mid-page)</option>
                      <option value="fixed">Fixed — top banner (after hero)</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '0.25rem', display: 'block' }}>
                      {form.type === 'fixed'
                        ? 'Shows as a static banner right after the hero, at the top of the home page'
                        : 'Shows as a slide inside the homepage carousel (mid-page)'}
                    </span>
                  </div>
                  <div className="admin-form-group">
                    <label>Position</label>
                    <select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as 'homepage' | 'sidebar' | 'banner' }))}>
                      <option value="homepage">Homepage</option>
                      <option value="banner">Banner (Top)</option>
                      <option value="sidebar">Sidebar (hidden on home)</option>
                    </select>
                    <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '0.25rem', display: 'block' }}>
                      Sidebar ads are not shown on the home page
                    </span>
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
                  <label>Image</label>
                  <div className="admin-image-upload-area">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="admin-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <span className="admin-login-loading">
                          <span className="admin-login-spinner" />
                          Uploading...
                        </span>
                      ) : (
                        <>
                          <span>📷</span>
                          <span>Click to Upload</span>
                          <span className="admin-upload-hint">JPG, PNG, WebP — Max 5MB each</span>
                        </>
                      )}
                    </button>
                  </div>
                  {form.image && (
                    <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                      <img src={form.image} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Or paste / edit an Image URL</label>
                    <input
                      type="url"
                      value={form.image}
                      onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                      placeholder="https://example.com/ad-image.jpg"
                      style={{ width: '100%', marginTop: '0.35rem', padding: '0.5rem', boxSizing: 'border-box' }}
                    />
                  </div>
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

              {saveError && <div style={{ padding: '0 1.5rem 0.75rem', color: '#dc2626', fontSize: '0.82rem' }}>{saveError}</div>}
              <div className="admin-modal-footer">
                <button onClick={() => { setSaveError(null); setShowModal(false); }} className="admin-btn admin-btn-outline">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary" style={{ opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Advertisement'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

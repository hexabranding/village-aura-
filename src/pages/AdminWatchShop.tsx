import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { WatchShopItem } from '../lib/api';

export default function AdminWatchShop() {
  const [items, setItems] = useState<WatchShopItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<WatchShopItem | null>(null);
  const [form, setForm] = useState({
    name: '',
    video: '',
    poster: '',
    price: '',
    productId: '',
    order: 1,
    active: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const posterInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const loadItems = async () => {
    try {
      const data = await api.watchshop.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to load watch shop items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', video: '', poster: '', price: '', productId: '', order: 1, active: true });
    setShowModal(true);
  };

  const openEdit = (item: WatchShopItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      video: item.video,
      poster: item.poster,
      price: item.price,
      productId: item.productId,
      order: item.order || 1,
      active: item.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.video) return;
    try {
      if (editing) {
        await api.watchshop.update(editing.id, form);
      } else {
        await api.watchshop.create(form);
      }
      await loadItems();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save watch shop item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.watchshop.delete(id);
      await loadItems();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete watch shop item:', error);
    }
  };

  const toggleActive = async (item: WatchShopItem) => {
    try {
      await api.watchshop.update(item.id, { active: !item.active });
      await loadItems();
    } catch (error) {
      console.error('Failed to toggle watch shop item:', error);
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await api.upload.images(files);
      if (urls.length > 0) {
        setForm((f) => ({ ...f, poster: urls[0] }));
      }
    } catch (error) {
      console.error('Failed to upload poster:', error);
    } finally {
      setUploading(false);
      if (posterInputRef.current) posterInputRef.current.value = '';
    }
  };

  const [uploadError, setUploadError] = useState<string | null>(null);
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingVideo(true); setUploadError(null);
    try {
      const urls = await api.upload.images(files);
      if (urls.length > 0) {
        setForm((f) => ({ ...f, video: urls[0] }));
      } else setUploadError('Upload returned no URL');
    } catch (error: any) {
      console.error('Failed to upload video:', error);
      setUploadError(error?.message || 'Upload failed — restart backend & ensure MP4 ≤50MB');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const truncateUrl = (url: string) => {
    if (!url) return '';
    return url.length > 40 ? url.substring(0, 40) + '...' : url;
  };

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="admin-products-spinner" />
        <span>Loading watch shop items...</span>
      </div>
    );
  }

  const stats = {
    total: items.length,
    active: items.filter((i) => i.active).length,
    withPrice: items.filter((i) => i.price).length,
    withProduct: items.filter((i) => i.productId).length,
  };

  return (
    <div className="admin-ads-page">
      <div className="admin-products-stats">
        <div className="admin-products-stat">
          <div className="admin-stat-icon maroon">🎬</div>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{stats.total}</span>
            <span className="admin-products-stat-label">Total Items</span>
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
          <div className="admin-stat-icon gold">💰</div>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{stats.withPrice}</span>
            <span className="admin-products-stat-label">With Price</span>
          </div>
        </div>
        <div className="admin-products-stat">
          <div className="admin-stat-icon teal">🔗</div>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{stats.withProduct}</span>
            <span className="admin-products-stat-label">Linked Products</span>
          </div>
        </div>
      </div>

      <div className="admin-products-toolbar">
        <div className="admin-products-toolbar-left">
          <button onClick={openAdd} className="admin-products-add-btn">
            <span>+</span> Add Watch & Shop Item
          </button>
        </div>
      </div>

      <div className="admin-ads-grid">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`admin-ad-card ${!item.active ? 'inactive' : ''}`}
          >
            {item.poster ? (
              <div className="admin-ad-card-image">
                <img src={item.poster} alt={item.name} />
                <div className="admin-tag video" style={{ position: 'absolute', top: 8, right: 8 }}>🎬 Video</div>
                {!item.active && <div className="admin-ad-card-overlay">Inactive</div>}
              </div>
            ) : (
              <div className="admin-ad-card-placeholder">
                <span>🎬</span>
              </div>
            )}

            <div className="admin-ad-card-content">
              <div className="admin-ad-card-header">
                <h4 className="admin-ad-card-title">{item.name}</h4>
                <div className="admin-ad-card-badges">
                  <span className={`admin-tag ${item.active ? 'new' : ''}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="admin-ad-card-tags">
                {item.price && <span className="admin-ad-tag type">{item.price}</span>}
                {item.productId && <span className="admin-ad-tag position">Product Linked</span>}
                {item.order > 0 && <span className="admin-ad-tag order">Order: {item.order}</span>}
              </div>

              <div className="admin-ad-card-link">🎬 {truncateUrl(item.video)}</div>
            </div>

            <div className="admin-ad-card-actions">
              <button onClick={() => toggleActive(item)} className={`admin-ad-card-action ${item.active ? 'deactivate' : 'activate'}`}>
                {item.active ? '⏸ Deactivate' : '▶ Activate'}
              </button>
              <button onClick={() => openEdit(item)} className="admin-ad-card-action edit">✏️ Edit</button>
              {deleteConfirm === item.id ? (
                <div className="admin-ad-card-confirm">
                  <button onClick={() => handleDelete(item.id)} className="admin-btn-sm delete-confirm">Yes</button>
                  <button onClick={() => setDeleteConfirm(null)} className="admin-btn-sm cancel">No</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(item.id)} className="admin-ad-card-action delete">🗑 Delete</button>
              )}
            </div>
          </motion.div>
        ))}

        {items.length === 0 && (
          <div className="admin-products-empty" style={{ gridColumn: '1 / -1' }}>
            <span className="admin-products-empty-icon">🎬</span>
            <h3>No Watch & Shop Items Yet</h3>
            <p>Create your first video item to showcase products in action.</p>
            <button onClick={openAdd} className="admin-products-add-btn" style={{ marginTop: '1rem' }}>
              <span>+</span> Create First Item
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
                <h3>{editing ? 'Edit Watch & Shop Item' : 'Add New Watch & Shop Item'}</h3>
                <button onClick={() => setShowModal(false)} className="admin-modal-close">✕</button>
              </div>

              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Product Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Cotton Summer Dress" />
                </div>

                <div className="admin-form-group">
                  <label>Video * (MP4/WebM, hover to play)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input value={form.video} onChange={(e) => setForm((f) => ({ ...f, video: e.target.value }))} placeholder="https://example.com/video.mp4 or upload" style={{ flex: 1 }} />
                    <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
                    <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo} style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--maroon)', background: 'var(--ivory)', color: 'var(--maroon)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                    </button>
                  </div>
                  {uploadError && <div style={{ color: '#dc2626', fontSize: '0.78rem', marginTop: '0.4rem' }}>{uploadError}</div>}
                  {form.video && <div style={{ marginTop: '0.5rem' }}><video src={form.video} controls muted style={{ width: '100%', maxHeight: 200, borderRadius: 'var(--radius-sm)' }} /></div>}
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '0.25rem', display: 'block' }}>MP4/WebM ≤50MB. Instagram/Reels page links don't play — download as MP4 then upload.</span>
                </div>

                <div className="admin-form-group">
                  <label>Poster Image</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      value={form.poster}
                      onChange={(e) => setForm((f) => ({ ...f, poster: e.target.value }))}
                      placeholder="Image URL or upload below"
                      style={{ flex: 1 }}
                    />
                    <input
                      ref={posterInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePosterUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => posterInputRef.current?.click()}
                      disabled={uploading}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--maroon)',
                        background: 'var(--ivory)',
                        color: 'var(--maroon)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {form.poster && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <img src={form.poster} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    </div>
                  )}
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Price</label>
                    <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="e.g. ₹1,299" />
                  </div>
                  <div className="admin-form-group">
                    <label>Linked Product ID</label>
                    <input value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} placeholder="Product ID" />
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                    Active (visible on store)
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button onClick={() => setShowModal(false)} className="admin-btn admin-btn-outline">Cancel</button>
                <button onClick={handleSave} className="admin-btn admin-btn-primary">
                  {editing ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { GalleryImage } from '../lib/api';

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [form, setForm] = useState({
    image: '',
    title: '',
    subtitle: 'VIEW MORE',
    link: '',
    active: true,
    order: 1,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    try {
      const data = await api.gallery.getAll();
      setImages(data);
    } catch (error) {
      console.error('Failed to load gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ image: '', title: '', subtitle: 'VIEW MORE', link: '', active: true, order: 1 });
    setShowModal(true);
  };

  const openEdit = (img: GalleryImage) => {
    setEditing(img);
    setForm({
      image: img.image,
      title: img.title,
      subtitle: img.subtitle || 'VIEW MORE',
      link: img.link || '',
      active: img.active,
      order: img.order || 1,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.image) return;
    try {
      if (editing) {
        await api.gallery.update(editing.id, form);
      } else {
        await api.gallery.create(form);
      }
      await loadImages();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save gallery image:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.gallery.delete(id);
      await loadImages();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete gallery image:', error);
    }
  };

  const toggleActive = async (img: GalleryImage) => {
    try {
      await api.gallery.update(img.id, { active: !img.active });
      await loadImages();
    } catch (error) {
      console.error('Failed to toggle gallery image:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await api.upload.images(files);
      if (urls.length > 0) {
        setForm((f) => ({ ...f, image: urls[0] }));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="admin-products-spinner" />
        <span>Loading gallery images...</span>
      </div>
    );
  }

  const stats = {
    total: images.length,
    active: images.filter((i) => i.active).length,
  };

  return (
    <div className="admin-ads-page">
      <div className="admin-products-stats">
        <div className="admin-products-stat">
          <div className="admin-stat-icon maroon">🖼️</div>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{stats.total}</span>
            <span className="admin-products-stat-label">Total Images</span>
          </div>
        </div>
        <div className="admin-products-stat green">
          <div className="admin-stat-icon green">✅</div>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{stats.active}</span>
            <span className="admin-products-stat-label">Active</span>
          </div>
        </div>
      </div>

      <div className="admin-products-toolbar">
        <div className="admin-products-toolbar-left">
          <button onClick={openAdd} className="admin-products-add-btn">
            <span>+</span> Add Gallery Image
          </button>
        </div>
      </div>

      <div className="admin-ads-grid">
        {images.map((img, index) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`admin-ad-card ${!img.active ? 'inactive' : ''}`}
          >
            {img.image ? (
              <div className="admin-ad-card-image">
                <img src={img.image} alt={img.title} />
                {!img.active && <div className="admin-ad-card-overlay">Inactive</div>}
              </div>
            ) : (
              <div className="admin-ad-card-placeholder">
                <span>🖼️</span>
              </div>
            )}

            <div className="admin-ad-card-content">
              <div className="admin-ad-card-header">
                <h4 className="admin-ad-card-title">{img.title}</h4>
                <div className="admin-ad-card-badges">
                  <span className={`admin-tag ${img.active ? 'new' : ''}`}>
                    {img.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="admin-ad-card-tags">
                {img.subtitle && <span className="admin-ad-tag type">{img.subtitle}</span>}
                {img.order > 0 && <span className="admin-ad-tag order">Order: {img.order}</span>}
              </div>

              {img.link && (
                <div className="admin-ad-card-link">🔗 {img.link}</div>
              )}
            </div>

            <div className="admin-ad-card-actions">
              <button onClick={() => toggleActive(img)} className={`admin-ad-card-action ${img.active ? 'deactivate' : 'activate'}`}>
                {img.active ? '⏸ Deactivate' : '▶ Activate'}
              </button>
              <button onClick={() => openEdit(img)} className="admin-ad-card-action edit">✏️ Edit</button>
              {deleteConfirm === img.id ? (
                <div className="admin-ad-card-confirm">
                  <button onClick={() => handleDelete(img.id)} className="admin-btn-sm delete-confirm">Yes</button>
                  <button onClick={() => setDeleteConfirm(null)} className="admin-btn-sm cancel">No</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(img.id)} className="admin-ad-card-action delete">🗑 Delete</button>
              )}
            </div>
          </motion.div>
        ))}

        {images.length === 0 && (
          <div className="admin-products-empty" style={{ gridColumn: '1 / -1' }}>
            <span className="admin-products-empty-icon">🖼️</span>
            <h3>No Gallery Images Yet</h3>
            <p>Add images to the "Woven With Love Gallery" section.</p>
            <button onClick={openAdd} className="admin-products-add-btn" style={{ marginTop: '1rem' }}>
              <span>+</span> Add First Image
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
                <h3>{editing ? 'Edit Gallery Image' : 'Add New Gallery Image'}</h3>
                <button onClick={() => setShowModal(false)} className="admin-modal-close">✕</button>
              </div>

              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Image *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      value={form.image}
                      onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                      placeholder="Image URL or upload below"
                      style={{ flex: 1 }}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
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
                  {form.image && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <img src={form.image} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    </div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label>Title *</label>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Tissue" />
                </div>

                <div className="admin-form-group">
                  <label>Subtitle</label>
                  <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="VIEW MORE" />
                </div>

                <div className="admin-form-group">
                  <label>Link URL</label>
                  <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="/shop?category=Sarees" />
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
                  {editing ? 'Save Changes' : 'Add Image'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

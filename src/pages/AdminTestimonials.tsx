import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, resolveUploadUrl } from '../lib/api';
import type { Testimonial } from '../lib/api';

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ name: '', role: '', category: '', rating: 5, quote: '', image: '', active: true, order: 1 });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try { const d = await api.testimonials.getAll(); setItems(d); } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', role: '', category: '', rating: 5, quote: '', image: '', active: true, order: items.length + 1 }); setShowModal(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setForm({ name: t.name, role: t.role, category: t.category, rating: t.rating, quote: t.quote, image: t.image, active: t.active, order: t.order }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.quote.trim()) return;
    try {
      if (editing) await api.testimonials.update(editing.id, form);
      else await api.testimonials.create(form as any);
      await load(); setShowModal(false);
    } catch (e) { console.error(e); }
  };
  const handleDelete = async (id: string) => { try { await api.testimonials.delete(id); await load(); setDeleteConfirm(null); } catch (e) { console.error(e); } };
  const toggleActive = async (t: Testimonial) => { try { await api.testimonials.update(t.id, { active: !t.active }); await load(); } catch (e) { console.error(e); } };
  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try { const urls = await api.upload.images(files); if (urls[0]) setForm(f => ({ ...f, image: urls[0] })); } catch (e) { console.error(e); } finally { setUploading(false); }
  };

  if (loading) return <div className="admin-products-loading"><div className="admin-products-spinner" /><span>Loading feedbacks...</span></div>;

  return (
    <div className="admin-ads-page">
      <div className="admin-products-stats">
        <div className="admin-products-stat"><div className="admin-stat-icon maroon">💬</div><div className="admin-products-stat-text"><span className="admin-products-stat-value">{items.length}</span><span className="admin-products-stat-label">Total Feedbacks</span></div></div>
        <div className="admin-products-stat green"><div className="admin-stat-icon green">✅</div><div className="admin-products-stat-text"><span className="admin-products-stat-value">{items.filter(i=>i.active).length}</span><span className="admin-products-stat-label">Active</span></div></div>
      </div>
      <div className="admin-products-toolbar"><div className="admin-products-toolbar-left"><button onClick={openAdd} className="admin-products-add-btn"><span>+</span> Add Feedback</button></div></div>
      <div className="admin-ads-grid">
        {items.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`admin-ad-card ${!t.active ? 'inactive' : ''}`}>
            <div className="admin-ad-card-image" style={{ height: 180 }}>{t.image ? <img src={resolveUploadUrl(t.image)} alt={t.name} style={{ objectFit: 'cover' }} /> : <div className="admin-ad-card-placeholder">💬</div>}{!t.active && <div className="admin-ad-card-overlay">Inactive</div>}</div>
            <div className="admin-ad-card-content">
              <div className="admin-ad-card-header"><h4 className="admin-ad-card-title">{t.name}</h4><span className={`admin-tag ${t.active ? 'new' : ''}`}>{t.active ? 'Active' : 'Inactive'}</span></div>
              <div className="admin-ad-card-tags"><span className="admin-ad-tag">{t.role}</span><span className="admin-ad-tag type">{t.category}</span><span className="admin-ad-tag">★ {t.rating}</span><span className="admin-ad-tag order">Order: {t.order}</span></div>
              <p className="admin-ad-card-desc" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.quote}</p>
            </div>
            <div className="admin-ad-card-actions">
              <button onClick={() => toggleActive(t)} className={`admin-ad-card-action ${t.active ? 'deactivate' : 'activate'}`}>{t.active ? '⏸ Deactivate' : '▶ Activate'}</button>
              <button onClick={() => openEdit(t)} className="admin-ad-card-action edit">✏️ Edit</button>
              {deleteConfirm === t.id ? <div className="admin-ad-card-confirm"><button onClick={() => handleDelete(t.id)} className="admin-btn-sm delete-confirm">Yes</button><button onClick={() => setDeleteConfirm(null)} className="admin-btn-sm cancel">No</button></div> : <button onClick={() => setDeleteConfirm(t.id)} className="admin-ad-card-action delete">🗑 Delete</button>}
            </div>
          </motion.div>
        ))}
        {items.length === 0 && <div className="admin-products-empty" style={{ gridColumn: '1/-1' }}><span className="admin-products-empty-icon">💬</span><h3>No Feedbacks Yet</h3><p>Add client feedback for “Customer Love” section.</p><button onClick={openAdd} className="admin-products-add-btn" style={{ marginTop: '1rem' }}><span>+</span> Add First Feedback</button></div>}
      </div>
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header"><h3>{editing ? 'Edit Feedback' : 'Add Feedback'}</h3><button onClick={() => setShowModal(false)} className="admin-modal-close">✕</button></div>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <div className="admin-form-group"><label>Client Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Priya Sharma" /></div>
                  <div className="admin-form-group"><label>Role</label><input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Entrepreneur" /></div>
                </div>
                <div className="admin-form-grid">
                  <div className="admin-form-group"><label>Category</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Kanjivaram Silk" /></div>
                  <div className="admin-form-group"><label>Rating (1-5)</label><select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}</select></div>
                </div>
                <div className="admin-form-group"><label>Quote *</label><textarea rows={3} value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} placeholder="Client feedback..." /></div>
                <div className="admin-form-group"><label>Client Image</label><div style={{ display: 'flex', gap: '0.5rem' }}><input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="Image URL or upload" style={{ flex: 1 }} /><input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} /><button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ padding: '0.5rem 1rem', border: '1px solid var(--maroon)', borderRadius: 'var(--radius-sm)', background: 'var(--ivory)', color: 'var(--maroon)', cursor: 'pointer' }}>{uploading ? 'Uploading...' : 'Upload'}</button></div>{form.image && <img src={resolveUploadUrl(form.image)} alt="preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginTop: '0.5rem' }} />}</div>
                <div className="admin-form-grid">
                  <div className="admin-form-group"><label>Order</label><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} /></div>
                  <div className="admin-form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.4rem', cursor: 'pointer' }}><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} /> Active (visible)</label></div>
                </div>
              </div>
              <div className="admin-modal-footer"><button onClick={() => setShowModal(false)} className="admin-btn admin-btn-outline">Cancel</button><button onClick={handleSave} className="admin-btn admin-btn-primary">{editing ? 'Save Changes' : 'Add Feedback'}</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

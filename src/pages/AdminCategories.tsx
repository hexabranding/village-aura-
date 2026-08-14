import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { Category } from '../lib/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', subcategories: '', image: '', description: '', active: true });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', subcategories: '', image: '', description: '', active: true });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      subcategories: cat.subcategories.join(', '),
      image: cat.image,
      description: cat.description,
      active: cat.active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        subcategories: form.subcategories.split(',').map((s) => s.trim()).filter(Boolean),
        image: form.image,
        description: form.description,
        active: form.active,
      };

      if (editing) {
        await api.categories.update(editing.id, payload);
      } else {
        await api.categories.create(payload);
      }
      await loadCategories();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.categories.delete(id);
      await loadCategories();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const toggleActive = async (cat: Category) => {
    try {
      await api.categories.update(cat.id, { active: !cat.active });
      await loadCategories();
    } catch (error) {
      console.error('Failed to toggle category:', error);
    }
  };

  if (loading) return <div className="admin-empty">Loading categories...</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <span style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} total,{' '}
            {categories.filter((c) => c.active).length} active
          </span>
        </div>
        <button onClick={openAdd} className="admin-btn admin-btn-primary">+ Add Category</button>
      </div>

      <div className="admin-ads-grid">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`admin-ad-card ${!cat.active ? 'inactive' : ''}`}
          >
            {cat.image ? (
              <div className="admin-ad-image">
                <img src={cat.image} alt={cat.name} />
                {!cat.active && <div className="admin-ad-overlay">Inactive</div>}
              </div>
            ) : (
              <div className="admin-ad-placeholder">📁</div>
            )}
            <div className="admin-ad-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{cat.name}</h4>
                <span className={`admin-tag ${cat.active ? 'new' : ''}`} style={{ fontSize: '0.65rem' }}>
                  {cat.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {cat.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', margin: '0.5rem 0', lineHeight: 1.5 }}>
                  {cat.description}
                </p>
              )}
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontWeight: 500 }}>Subcategories:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.3rem' }}>
                  {cat.subcategories.length > 0 ? (
                    cat.subcategories.map((sub, i) => (
                      <span key={i} style={{
                        fontSize: '0.68rem',
                        background: 'var(--ivory-deep)',
                        border: '1px solid var(--line)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--ink-soft)',
                      }}>
                        {sub}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', fontStyle: 'italic' }}>None</span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', marginTop: '0.5rem' }}>
                Slug: {cat.slug}
              </div>
            </div>
            <div className="admin-ad-actions">
              <button onClick={() => toggleActive(cat)} className="admin-btn-sm edit">
                {cat.active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => openEdit(cat)} className="admin-btn-sm edit">Edit</button>
              {deleteConfirm === cat.id ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleDelete(cat.id)} className="admin-btn-sm delete-confirm">Yes</button>
                  <button onClick={() => setDeleteConfirm(null)} className="admin-btn-sm cancel">No</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(cat.id)} className="admin-btn-sm delete">Delete</button>
              )}
            </div>
          </motion.div>
        ))}

        {categories.length === 0 && (
          <div className="admin-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📁</div>
            <h3 style={{ margin: '0 0 0.5rem' }}>No Categories Yet</h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Create your first category to organize your products.
            </p>
            <button onClick={openAdd} className="admin-btn admin-btn-primary">+ Create First Category</button>
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
                <h3>{editing ? 'Edit Category' : 'Add New Category'}</h3>
                <button onClick={() => setShowModal(false)} className="admin-modal-close">✕</button>
              </div>

              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Category Name *</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Sarees" />
                  </div>
                  <div className="admin-form-group">
                    <label>Slug</label>
                    <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="Auto-generated from name" />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Short description of this category..." />
                </div>

                <div className="admin-form-group">
                  <label>Image URL</label>
                  <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://example.com/category.jpg" />
                  {form.image && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <img src={form.image} alt="Preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    </div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label>Subcategories (comma-separated)</label>
                  <textarea
                    rows={3}
                    value={form.subcategories}
                    onChange={(e) => setForm((f) => ({ ...f, subcategories: e.target.value }))}
                    placeholder="Kanchipuram Silk, Banarasi Silk, Chanderi Silk"
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '0.25rem', display: 'block' }}>
                    Separate each subcategory with a comma
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
                  {editing ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

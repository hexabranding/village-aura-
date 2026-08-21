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

  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.active).length;
  const inactiveCount = categories.filter((c) => !c.active).length;

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="admin-products-spinner" />
        <span>Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="admin-categories-page">
      <div className="admin-products-stats">
        <div className="admin-products-stat">
          <span className="admin-products-stat-icon">📁</span>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{totalCategories}</span>
            <span className="admin-products-stat-label">Total Categories</span>
          </div>
        </div>
        <div className="admin-products-stat green">
          <span className="admin-products-stat-icon">✅</span>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{activeCount}</span>
            <span className="admin-products-stat-label">Active</span>
          </div>
        </div>
        <div className="admin-products-stat red">
          <span className="admin-products-stat-icon">⏸️</span>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{inactiveCount}</span>
            <span className="admin-products-stat-label">Inactive</span>
          </div>
        </div>
      </div>

      <div className="admin-categories-toolbar">
        <h3 className="admin-categories-title">All Categories</h3>
        <button onClick={openAdd} className="admin-products-add-btn">
          <span>+</span>
          Add Category
        </button>
      </div>

      <div className="admin-categories-grid">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`admin-category-card ${!cat.active ? 'inactive' : ''}`}
          >
            <div className="admin-category-card-image">
              {cat.image ? (
                <>
                  <img src={cat.image} alt={cat.name} />
                  {!cat.active && <div className="admin-category-card-overlay">Inactive</div>}
                </>
              ) : (
                <div className="admin-category-card-placeholder">📁</div>
              )}
            </div>

            <div className="admin-category-card-body">
              <div className="admin-category-card-header">
                <h4 className="admin-category-card-name">{cat.name}</h4>
                <button
                  onClick={() => toggleActive(cat)}
                  className={`admin-category-card-status ${cat.active ? 'active' : 'inactive'}`}
                >
                  {cat.active ? 'Active' : 'Inactive'}
                </button>
              </div>

              {cat.description && (
                <p className="admin-category-card-desc">{cat.description}</p>
              )}

              <div className="admin-category-card-slug">
                <span>Slug:</span> {cat.slug}
              </div>

              <div className="admin-category-card-subs">
                <span className="admin-category-card-subs-label">Subcategories</span>
                <div className="admin-category-card-subs-list">
                  {cat.subcategories.length > 0 ? (
                    cat.subcategories.map((sub, i) => (
                      <span key={i} className="admin-category-card-sub">{sub}</span>
                    ))
                  ) : (
                    <span className="admin-category-card-sub empty">None</span>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-category-card-actions">
              <button onClick={() => openEdit(cat)} className="admin-category-card-edit">
                <span>✏️</span>
                Edit
              </button>
              {deleteConfirm === cat.id ? (
                <div className="admin-product-card-delete-confirm">
                  <button onClick={() => handleDelete(cat.id)} className="admin-product-card-delete-yes">
                    Delete
                  </button>
                  <button onClick={() => setDeleteConfirm(null)} className="admin-product-card-delete-no">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(cat.id)} className="admin-category-card-delete">
                  <span>🗑️</span>
                  Delete
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {categories.length === 0 && (
          <div className="admin-products-empty">
            <span className="admin-products-empty-icon">📁</span>
            <h3>No Categories Yet</h3>
            <p>Create your first category to organize your products.</p>
            <button onClick={openAdd} className="admin-products-add-btn">
              <span>+</span>
              Create First Category
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
                    <div className="admin-category-modal-preview">
                      <img src={form.image} alt="Preview" />
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
                  <span className="admin-form-hint">Separate each subcategory with a comma</span>
                </div>

                <div className="admin-form-group">
                  <label className="admin-category-modal-toggle">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                    <span className="admin-category-modal-toggle-track" />
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

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, resolveUploadUrl } from '../lib/api';
import type { Category } from '../lib/api';

function InlineNameEditor({ name, onSave }: { name: string; onSave: (n: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) onSave(trimmed);
    else setValue(name);
    setEditing(false);
  };

  const cancel = () => { setValue(name); setEditing(false); };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="admin-category-inline-name-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') cancel();
        }}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <h4
      className="admin-category-card-name editable"
      onClick={() => setEditing(true)}
      title="Click to edit name"
    >
      {name}
    </h4>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formSubcategories, setFormSubcategories] = useState<string[]>([]);
  const [formActive, setFormActive] = useState(true);
  const [formSubInput, setFormSubInput] = useState('');
  const [formUploading, setFormUploading] = useState(false);

  const [cardSubInputs, setCardSubInputs] = useState<Record<string, string>>({});

  const loadCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data);
      window.dispatchEvent(new Event('categoriesUpdated'));
      localStorage.setItem('categoriesUpdated', Date.now().toString());
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    if (!editing && formName && !formSlug) {
      setFormSlug(formName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [formName, editing, formSlug]);

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description);
    setFormImage(cat.image);
    setFormSubcategories([...cat.subcategories]);
    setFormActive(cat.active);
    setFormSubInput('');
    setShowModal(true);
  };

  const addSubToForm = () => {
    const val = formSubInput.trim();
    if (val && !formSubcategories.includes(val)) {
      setFormSubcategories((s) => [...s, val]);
    }
    setFormSubInput('');
  };

  const removeSubFromForm = (sub: string) => {
    setFormSubcategories((s) => s.filter((x) => x !== sub));
  };

  const handleFormImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFormUploading(true);
    try {
      const urls = await api.upload.images(files);
      if (urls.length > 0) setFormImage(urls[0]);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setFormUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formName.trim() || !editing) return;
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug || formName.trim().toLowerCase().replace(/\s+/g, '-'),
        subcategories: formSubcategories,
        image: formImage,
        description: formDescription,
        active: formActive,
      };
      await api.categories.update(editing.id, payload);
      await loadCategories();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleInlineNameSave = async (cat: Category, newName: string) => {
    try {
      await api.categories.update(cat.id, {
        name: newName,
        slug: cat.slug === cat.name.toLowerCase().replace(/\s+/g, '-')
          ? newName.toLowerCase().replace(/\s+/g, '-')
          : cat.slug,
      });
      await loadCategories();
    } catch (error) {
      console.error('Failed to rename category:', error);
    }
  };

  const handleInlineSubAdd = async (cat: Category, sub: string) => {
    if (!sub.trim() || cat.subcategories.includes(sub.trim())) return;
    const updated = [...cat.subcategories, sub.trim()];
    try {
      await api.categories.update(cat.id, { subcategories: updated });
      await loadCategories();
    } catch (error) {
      console.error('Failed to add subcategory:', error);
    }
  };

  const handleInlineSubRemove = async (cat: Category, sub: string) => {
    const updated = cat.subcategories.filter((s) => s !== sub);
    try {
      await api.categories.update(cat.id, { subcategories: updated });
      await loadCategories();
    } catch (error) {
      console.error('Failed to remove subcategory:', error);
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

  const handleDelete = async (id: string) => {
    try {
      await api.categories.delete(id);
      await loadCategories();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const totalCategories = categories.length;
  const activeCount = categories.filter((c) => c.active).length;
  const totalSubs = categories.reduce((sum, c) => sum + c.subcategories.length, 0);

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
        <div className="admin-products-stat">
          <span className="admin-products-stat-icon">🏷️</span>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{totalSubs}</span>
            <span className="admin-products-stat-label">Total Subcategories</span>
          </div>
        </div>
      </div>

      <div className="admin-categories-toolbar">
        <h3 className="admin-categories-title">All Categories</h3>
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
                  <img src={resolveUploadUrl(cat.image)} alt={cat.name} />
                  {!cat.active && <div className="admin-category-card-overlay">Inactive</div>}
                </>
              ) : (
                <div className="admin-category-card-placeholder">📁</div>
              )}
            </div>

            <div className="admin-category-card-body">
              <div className="admin-category-card-header">
                <InlineNameEditor name={cat.name} onSave={(n) => handleInlineNameSave(cat, n)} />
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
                  {cat.subcategories.map((sub, i) => (
                    <span key={i} className="admin-category-card-sub">
                      {sub}
                      <button
                        className="admin-category-card-sub-remove"
                        onClick={() => handleInlineSubRemove(cat, sub)}
                        title={`Remove ${sub}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <div className="admin-category-card-sub-add">
                    <input
                      type="text"
                      placeholder="Add sub..."
                      value={cardSubInputs[cat.id] || ''}
                      onChange={(e) => setCardSubInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleInlineSubAdd(cat, cardSubInputs[cat.id] || '');
                          setCardSubInputs((prev) => ({ ...prev, [cat.id]: '' }));
                        }
                      }}
                    />
                    <button
                      className="admin-category-card-sub-add-btn"
                      onClick={() => {
                        handleInlineSubAdd(cat, cardSubInputs[cat.id] || '');
                        setCardSubInputs((prev) => ({ ...prev, [cat.id]: '' }));
                      }}
                    >
                      Add
                    </button>
                  </div>
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
            <p>Categories from backend will appear here.</p>
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
                <h3>Edit Category</h3>
                <button onClick={() => setShowModal(false)} className="admin-modal-close">✕</button>
              </div>

              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Category Name *</label>
                    <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Sarees" />
                  </div>
                  <div className="admin-form-group">
                    <label>Slug</label>
                    <input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="Auto-generated from name" />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea rows={2} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Short description of this category..." />
                </div>

                <div className="admin-form-group">
                  <label>Image</label>
                  <div className="admin-form-image-upload-row">
                    <input value={formImage} onChange={(e) => setFormImage(e.target.value)} placeholder="Image URL or upload below" />
                    <label className="admin-btn admin-btn-outline admin-upload-btn">
                      {formUploading ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFormImageUpload(e.target.files)}
                        disabled={formUploading}
                      />
                    </label>
                  </div>
                  {formImage && (
                    <div className="admin-category-modal-preview">
                      <img src={resolveUploadUrl(formImage)} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label>Subcategories</label>
                  <div className="admin-modal-subs-list">
                    {formSubcategories.map((sub) => (
                      <span key={sub} className="admin-category-card-sub">
                        {sub}
                        <button className="admin-category-card-sub-remove" onClick={() => removeSubFromForm(sub)}>×</button>
                      </span>
                    ))}
                  </div>
                  <div className="admin-modal-subs-add">
                    <input
                      type="text"
                      placeholder="Add a subcategory..."
                      value={formSubInput}
                      onChange={(e) => setFormSubInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addSubToForm(); }}
                    />
                    <button type="button" className="admin-btn admin-btn-outline" onClick={addSubToForm}>Add</button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-category-modal-toggle">
                    <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} />
                    <span className="admin-category-modal-toggle-track" />
                    Active (visible on store)
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button onClick={() => setShowModal(false)} className="admin-btn admin-btn-outline">Cancel</button>
                <button onClick={handleSave} className="admin-btn admin-btn-primary">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

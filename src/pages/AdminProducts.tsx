import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { Product } from '../data/products';
import type { Category } from '../lib/api';

const emptyProduct: Product = {
  id: '',
  name: '',
  category: 'Sarees',
  subCategory: '',
  fabric: '',
  price: 0,
  mrp: 0,
  description: '',
  details: [],
  care: [],
  variants: [{ colorName: '', hex: '#6b1e23', images: [] }],
  featured: false,
  isNew: false,
  isBestSeller: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Product>(emptyProduct);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData.filter((c) => c.active));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categoryNames = ['All', ...categories.map((c) => c.name)];

  const subcategoriesForCategory = categories.find((c) => c.name === form.category)?.subcategories || [];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyProduct, id: `product-${Date.now()}` });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({ ...product });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    try {
      if (editing) {
        await api.products.update(editing.id, form);
      } else {
        await api.products.create(form);
      }
      await loadData();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.products.delete(id);
      await loadData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const updateForm = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  if (loading) return <div className="admin-empty">Loading products...</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search"
          />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="admin-select">
            {categoryNames.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button onClick={openAdd} className="admin-btn admin-btn-primary">+ Add Product</button>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Sub Category</th>
                <th>Price</th>
                <th>MRP</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.variants[0]?.images[0] || ''}
                      alt={product.name}
                      style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 6 }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{product.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>{product.id}</div>
                  </td>
                  <td>{product.category}</td>
                  <td style={{ fontSize: '0.82rem' }}>{product.subCategory || '—'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--maroon)' }}>₹{product.price.toLocaleString('en-IN')}</td>
                  <td style={{ color: 'var(--ink-soft)' }}>{product.mrp ? `₹${product.mrp.toLocaleString('en-IN')}` : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {product.isNew && <span className="admin-tag new">New</span>}
                      {product.isBestSeller && <span className="admin-tag best">Best</span>}
                      {product.featured && <span className="admin-tag featured">Featured</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(product)} className="admin-btn-sm edit">Edit</button>
                      {deleteConfirm === product.id ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <button onClick={() => handleDelete(product.id)} className="admin-btn-sm delete-confirm">Yes</button>
                          <button onClick={() => setDeleteConfirm(null)} className="admin-btn-sm cancel">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(product.id)} className="admin-btn-sm delete">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="admin-empty">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
                <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setShowModal(false)} className="admin-modal-close">✕</button>
              </div>

              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Product Name *</label>
                    <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="e.g. Kanjivaram Silk Saree" />
                  </div>
                  <div className="admin-form-group">
                    <label>Product ID</label>
                    <input value={form.id} onChange={(e) => updateForm('id', e.target.value)} disabled={!!editing} />
                  </div>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => {
                        updateForm('category', e.target.value);
                        updateForm('subCategory', '');
                      }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Sub Category</label>
                    {subcategoriesForCategory.length > 0 ? (
                      <select value={form.subCategory || ''} onChange={(e) => updateForm('subCategory', e.target.value)}>
                        <option value="">Select subcategory</option>
                        {subcategoriesForCategory.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    ) : (
                      <input value={form.subCategory || ''} onChange={(e) => updateForm('subCategory', e.target.value)} placeholder="e.g. Chanderi Silk" />
                    )}
                  </div>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Fabric</label>
                    <input value={form.fabric} onChange={(e) => updateForm('fabric', e.target.value)} placeholder="e.g. Pure Mulberry Silk" />
                  </div>
                  <div className="admin-form-group">
                    <label>Selling Price (₹) *</label>
                    <input type="number" value={form.price || ''} onChange={(e) => updateForm('price', Number(e.target.value))} />
                  </div>
                </div>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>MRP (₹)</label>
                    <input type="number" value={form.mrp || ''} onChange={(e) => updateForm('mrp', Number(e.target.value))} />
                  </div>
                  <div className="admin-form-group">
                    <label>Status</label>
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!form.isNew} onChange={(e) => updateForm('isNew', e.target.checked)} />
                        New Arrival
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!form.isBestSeller} onChange={(e) => updateForm('isBestSeller', e.target.checked)} />
                        Best Seller
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!form.featured} onChange={(e) => updateForm('featured', e.target.checked)} />
                        Featured
                      </label>
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="Product description..." />
                </div>

                <div className="admin-form-group">
                  <label>Image URLs (one per line)</label>
                  <textarea
                    rows={3}
                    value={form.variants[0]?.images.join('\n') || ''}
                    onChange={(e) => {
                      const urls = e.target.value.split('\n').filter((u) => u.trim());
                      const variants = [...form.variants];
                      variants[0] = { ...variants[0], images: urls };
                      updateForm('variants', variants);
                    }}
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button onClick={() => setShowModal(false)} className="admin-btn admin-btn-outline">Cancel</button>
                <button onClick={handleSave} className="admin-btn admin-btn-primary">
                  {editing ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

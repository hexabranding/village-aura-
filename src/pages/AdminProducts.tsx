import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import type { Product } from '../data/products';
import type { Category } from '../lib/api';

interface Variant {
  colorName: string;
  hex: string;
  images: string[];
}

const emptyVariant: Variant = { colorName: '', hex: '#6b1e23', images: [] };

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
  variants: [{ ...emptyVariant }],
  featured: false,
  isNew: false,
  isBestSeller: false,
  inStock: true,
};

const presetColors = [
  { name: 'Deep Maroon', hex: '#6b1e23' },
  { name: 'Burgundy', hex: '#722f37' },
  { name: 'Wine Red', hex: '#722f37' },
  { name: 'Crimson', hex: '#dc143c' },
  { name: 'Ruby Red', hex: '#9b111e' },
  { name: 'Brick Red', hex: '#cb4154' },
  { name: 'Rose Pink', hex: '#ff007f' },
  { name: 'Dusty Rose', hex: '#dcae96' },
  { name: 'Blush Pink', hex: '#de5d83' },
  { name: 'Baby Pink', hex: '#f4c2c2' },
  { name: 'Coral', hex: '#ff7f50' },
  { name: 'Salmon', hex: '#fa8072' },
  { name: 'Peach', hex: '#ffcba4' },
  { name: 'Apricot', hex: '#fbceb1' },
  { name: 'Burnt Orange', hex: '#cc5500' },
  { name: 'Rust', hex: '#b7410e' },
  { name: 'Terracotta', hex: '#e2725b' },
  { name: 'Amber', hex: '#ffbf00' },
  { name: 'Mustard', hex: '#ffdb58' },
  { name: 'Golden Yellow', hex: '#ffd700' },
  { name: 'Antique Gold', hex: '#c9a96e' },
  { name: 'Dark Gold', hex: '#b8860b' },
  { name: 'Champagne', hex: '#f7e7ce' },
  { name: 'Ivory', hex: '#fffff0' },
  { name: 'Cream', hex: '#fffdd0' },
  { name: 'Lemon', hex: '#fff44f' },
  { name: 'Lime Green', hex: '#32cd32' },
  { name: 'Olive Green', hex: '#808000' },
  { name: 'Moss Green', hex: '#8a9a5b' },
  { name: 'Sage Green', hex: '#9cad8f' },
  { name: 'Emerald', hex: '#50c878' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Emerald Teal', hex: '#1f4741' },
  { name: 'Sea Green', hex: '#2e8b57' },
  { name: 'Mint', hex: '#98ff98' },
  { name: 'Aqua', hex: '#00ffff' },
  { name: 'Turquoise', hex: '#40e0d0' },
  { name: 'Sky Blue', hex: '#87ceeb' },
  { name: 'Powder Blue', hex: '#b0e0e6' },
  { name: 'Baby Blue', hex: '#89cff0' },
  { name: 'Royal Blue', hex: '#4169e1' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Indigo', hex: '#4b0082' },
  { name: 'Cobalt', hex: '#0047ab' },
  { name: 'Sapphire', hex: '#0f52ba' },
  { name: 'Lavender', hex: '#e6e6fa' },
  { name: 'Lilac', hex: '#c8a2c8' },
  { name: 'Royal Purple', hex: '#7851a9' },
  { name: 'Plum', hex: '#8e4585' },
  { name: 'Mauve', hex: '#e0b0ff' },
  { name: 'Violet', hex: '#8f00ff' },
  { name: 'Grape', hex: '#6f2da8' },
  { name: 'Black', hex: '#000000' },
  { name: 'Charcoal', hex: '#36454f' },
  { name: 'Slate Gray', hex: '#708090' },
  { name: 'Silver', hex: '#c0c0c0' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Snow White', hex: '#fffafa' },
  { name: 'Beige', hex: '#f5f5dc' },
  { name: 'Tan', hex: '#d2b48c' },
  { name: 'Khaki', hex: '#c3b091' },
  { name: 'Brown', hex: '#964b00' },
  { name: 'Chocolate', hex: '#7b3f00' },
  { name: 'Coffee', hex: '#6f4e37' },
  { name: 'Copper', hex: '#b87333' },
  { name: 'Bronze', hex: '#cd7f32' },
  { name: 'Rose Gold', hex: '#b76e79' },
];

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeVariantTab, setActiveVariantTab] = useState(0);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

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
    setActiveVariantTab(0);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({ ...product, variants: product.variants.length > 0 ? product.variants : [{ ...emptyVariant }] });
    setActiveVariantTab(0);
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

  const handleStockToggle = async (product: Product) => {
    try {
      await api.products.update(product.id, { ...product, inStock: !product.inStock });
      await loadData();
    } catch (error) {
      console.error('Failed to toggle stock:', error);
    }
  };

  const updateForm = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const updateVariant = (index: number, key: keyof Variant, value: unknown) => {
    setForm((f) => {
      const variants = [...f.variants];
      variants[index] = { ...variants[index], [key]: value };
      return { ...f, variants };
    });
  };

  const addVariant = () => {
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { ...emptyVariant }],
    }));
    setActiveVariantTab(form.variants.length);
  };

  const removeVariant = (index: number) => {
    if (form.variants.length <= 1) return;
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index),
    }));
    setActiveVariantTab(Math.min(activeVariantTab, form.variants.length - 2));
  };

  const handleImageUpload = async (variantIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const urls = await api.upload.images(files);
      const variants = [...form.variants];
      variants[variantIndex] = {
        ...variants[variantIndex],
        images: [...variants[variantIndex].images, ...urls],
      };
      setForm((f) => ({ ...f, variants }));
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const variants = [...form.variants];
    variants[variantIndex] = {
      ...variants[variantIndex],
      images: variants[variantIndex].images.filter((_, i) => i !== imageIndex),
    };
    setForm((f) => ({ ...f, variants }));
  };

  const handleUrlAdd = (variantIndex: number, url: string) => {
    if (!url.trim()) return;
    const variants = [...form.variants];
    variants[variantIndex] = {
      ...variants[variantIndex],
      images: [...variants[variantIndex].images, url.trim()],
    };
    setForm((f) => ({ ...f, variants }));
  };

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock !== false).length;
  const outOfStockCount = products.filter((p) => p.inStock === false).length;

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="admin-products-spinner" />
        <span>Loading products...</span>
      </div>
    );
  }

  return (
    <div className="admin-products-page">
      <div className="admin-products-stats">
        <div className="admin-products-stat">
          <span className="admin-products-stat-icon">📦</span>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{totalProducts}</span>
            <span className="admin-products-stat-label">Total Products</span>
          </div>
        </div>
        <div className="admin-products-stat green">
          <span className="admin-products-stat-icon">✅</span>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{inStockCount}</span>
            <span className="admin-products-stat-label">In Stock</span>
          </div>
        </div>
        <div className="admin-products-stat red">
          <span className="admin-products-stat-icon">⚠️</span>
          <div className="admin-products-stat-text">
            <span className="admin-products-stat-value">{outOfStockCount}</span>
            <span className="admin-products-stat-label">Out of Stock</span>
          </div>
        </div>
      </div>

      <div className="admin-products-toolbar">
        <div className="admin-products-toolbar-left">
          <div className="admin-products-search-wrap">
            <span className="admin-products-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-products-search"
            />
            {search && (
              <button className="admin-products-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="admin-products-filter">
            {categoryNames.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
        <button onClick={openAdd} className="admin-products-add-btn">
          <span>+</span>
          Add Product
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} style={{ opacity: product.inStock === false ? 0.7 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 220 }}>
                      <img src={product.variants[0]?.images[0] || 'https://via.placeholder.com/56x70?text=No+Img'} alt={product.name} style={{ width: 52, height: 64, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--line)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{product.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--ink-soft)', letterSpacing: '0.04em' }}>{product.id}</div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                          {product.variants.slice(0, 4).map((v, i) => (
                            <span key={i} title={v.colorName} style={{ width: 14, height: 14, borderRadius: '50%', background: v.hex, border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block' }} />
                          ))}
                          {product.variants.length > 4 && <span style={{ fontSize: '0.68rem', color: 'var(--ink-soft)' }}>+{product.variants.length - 4}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--ink)' }}>{product.category}</div>
                    {product.subCategory && <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>{product.subCategory}</div>}
                    {product.fabric && <div style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: 2 }}>{product.fabric}</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--maroon)', fontSize: '0.9rem' }}>₹{product.price.toLocaleString('en-IN')}</div>
                    {product.mrp && product.mrp > product.price && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textDecoration: 'line-through' }}>₹{product.mrp.toLocaleString('en-IN')} <span style={{ color: '#059669', textDecoration: 'none', fontWeight: 600, marginLeft: 4 }}>{Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off</span></div>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleStockToggle(product)} className={`admin-status-badge ${product.inStock === false ? 'cancelled' : 'delivered'}`} style={{ border: 'none', cursor: 'pointer' }}>
                      {product.inStock === false ? 'Out of Stock' : 'In Stock'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 140 }}>
                      {product.isNew && <span className="admin-tag new">New</span>}
                      {product.isBestSeller && <span className="admin-tag best">Best</span>}
                      {product.featured && <span className="admin-tag featured">Featured</span>}
                      {!product.isNew && !product.isBestSeller && !product.featured && <span style={{ fontSize: '0.7rem', color: 'var(--ink-soft)' }}>—</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button onClick={() => setDetailProduct(product)} className="admin-btn-sm" style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', color: '#374151' }}>View</button>
                      <button onClick={() => openEdit(product)} className="admin-btn-sm edit">Edit</button>
                      {deleteConfirm === product.id ? (
                        <>
                          <button onClick={() => handleDelete(product.id)} className="admin-btn-sm delete-confirm">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="admin-btn-sm cancel">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(product.id)} className="admin-btn-sm delete">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--ink-soft)' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📦</div>
                    <div style={{ fontWeight: 600 }}>No products found</div>
                    <div style={{ fontSize: '0.82rem', marginTop: 4 }}>{search ? 'Try a different search term' : 'Start by adding your first product'}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {detailProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-modal-overlay" onClick={() => setDetailProduct(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} className="admin-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{detailProduct.name}</h3>
                <button onClick={() => setDetailProduct(null)} className="admin-modal-close">✕</button>
              </div>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {detailProduct.variants.flatMap((v) => v.images).slice(0, 6).map((img, i) => (
                        <img key={i} src={img} alt="" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--line)' }} />
                      ))}
                      {detailProduct.variants.flatMap((v) => v.images).length === 0 && <div style={{ gridColumn: '1 / -1', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ivory-deep)', borderRadius: 12, color: 'var(--ink-soft)', border: '1px dashed var(--line)' }}>No images</div>}
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {detailProduct.variants.map((v, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.35rem 0.6rem', borderRadius: 20, border: '1px solid var(--line)', fontSize: '0.72rem', background: 'var(--ivory-deep)' }}>
                          <span style={{ width: 12, height: 12, borderRadius: '50%', background: v.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                          {v.colorName} • {v.images.length} img
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div><span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700 }}>ID</span><div style={{ fontSize: '0.82rem', color: 'var(--ink)' }}>{detailProduct.id}</div></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700 }}>Category</span><div style={{ fontSize: '0.85rem' }}>{detailProduct.category}{detailProduct.subCategory ? ` • ${detailProduct.subCategory}` : ''}</div></div>
                        <div><span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700 }}>Fabric</span><div style={{ fontSize: '0.85rem' }}>{detailProduct.fabric || '—'}</div></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700 }}>Price</span><div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--maroon)' }}>₹{detailProduct.price.toLocaleString('en-IN')}{detailProduct.mrp ? <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', fontWeight: 400, textDecoration: 'line-through', marginLeft: 8 }}>₹{detailProduct.mrp.toLocaleString('en-IN')}</span> : null}</div></div>
                        <div><span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700 }}>Stock</span><div><span className={`admin-status-badge ${detailProduct.inStock === false ? 'cancelled' : 'delivered'}`} style={{ marginTop: 4 }}>{detailProduct.inStock === false ? 'Out of Stock' : 'In Stock'}</span></div></div>
                      </div>
                      <div><span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700 }}>Tags</span><div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>{detailProduct.isNew && <span className="admin-tag new">New</span>}{detailProduct.isBestSeller && <span className="admin-tag best">Best Seller</span>}{detailProduct.featured && <span className="admin-tag featured">Featured</span>}{!detailProduct.isNew && !detailProduct.isBestSeller && !detailProduct.featured && <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>No tags</span>}</div></div>
                      <div><span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700 }}>Description</span><div style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginTop: 4 }}>{detailProduct.description || 'No description'}</div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={() => setDetailProduct(null)} className="admin-btn admin-btn-outline">Close</button>
                <button onClick={() => { const p = detailProduct; setDetailProduct(null); if (p) openEdit(p); }} className="admin-btn admin-btn-primary">Edit Product</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
              className="admin-modal admin-modal-wide"
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
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
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

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Stock Availability</label>
                    <div className="admin-form-stock-toggle">
                      <button
                        type="button"
                        className={`admin-stock-btn ${form.inStock !== false ? 'active' : ''}`}
                        onClick={() => updateForm('inStock', true)}
                      >
                        <span className="admin-stock-btn-dot in" />
                        In Stock
                      </button>
                      <button
                        type="button"
                        className={`admin-stock-btn ${form.inStock === false ? 'active' : ''}`}
                        onClick={() => updateForm('inStock', false)}
                      >
                        <span className="admin-stock-btn-dot out" />
                        Out of Stock
                      </button>
                    </div>
                  </div>
                  <div className="admin-form-group" />
                </div>

                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea rows={3} value={form.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="Product description..." />
                </div>

                <div className="admin-variants-section">
                  <div className="admin-variants-header">
                    <label>Color Variants & Images</label>
                    <button type="button" onClick={addVariant} className="admin-btn admin-btn-sm-outline">
                      + Add Variant
                    </button>
                  </div>

                  <div className="admin-variant-tabs">
                    {form.variants.map((v, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`admin-variant-tab ${activeVariantTab === i ? 'active' : ''}`}
                        onClick={() => setActiveVariantTab(i)}
                      >
                        <span
                          className="admin-variant-tab-color"
                          style={{ background: v.hex || '#ccc' }}
                        />
                        <span>{v.colorName || `Variant ${i + 1}`}</span>
                        {form.variants.length > 1 && (
                          <span
                            className="admin-variant-tab-remove"
                            onClick={(e) => { e.stopPropagation(); removeVariant(i); }}
                          >
                            ×
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {form.variants.map((variant, vIndex) => (
                    vIndex === activeVariantTab && (
                      <div key={vIndex} className="admin-variant-content">
                        <div className="admin-form-grid">
                          <div className="admin-form-group">
                            <label>Color Name *</label>
                            <input
                              value={variant.colorName}
                              onChange={(e) => updateVariant(vIndex, 'colorName', e.target.value)}
                              placeholder="e.g. Deep Maroon"
                            />
                          </div>
                          <div className="admin-form-group">
                            <label>Color</label>
                            <div className="admin-color-picker-wrap">
                              <input
                                type="color"
                                value={variant.hex}
                                onChange={(e) => updateVariant(vIndex, 'hex', e.target.value)}
                                className="admin-color-input"
                              />
                              <input
                                type="text"
                                value={variant.hex}
                                onChange={(e) => updateVariant(vIndex, 'hex', e.target.value)}
                                className="admin-color-hex"
                                placeholder="#000000"
                              />
                            </div>
                            <div className="admin-color-presets">
                              {presetColors.map((c) => (
                                <button
                                  key={c.hex + c.name}
                                  type="button"
                                  className={`admin-color-preset ${variant.hex.toLowerCase() === c.hex.toLowerCase() ? 'selected' : ''}`}
                                  style={{ background: c.hex }}
                                  title={`${c.name} — ${c.hex}`}
                                  onClick={() => {
                                    updateVariant(vIndex, 'hex', c.hex);
                                    if (!variant.colorName) updateVariant(vIndex, 'colorName', c.name);
                                  }}
                                >
                                  <span className="admin-color-preset-label">{c.hex}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="admin-form-group">
                          <label>Product Images</label>
                          <div className="admin-image-upload-area">
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleImageUpload(vIndex, e.target.files)}
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
                                  <span>Click to Upload Images</span>
                                  <span className="admin-upload-hint">JPG, PNG, WebP — Max 5MB each</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="admin-form-group">
                          <label>Or Add Image URL</label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              id={`url-input-${vIndex}`}
                              type="url"
                              placeholder="https://example.com/image.jpg"
                              className="admin-url-input"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleUrlAdd(vIndex, (e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="admin-btn admin-btn-sm-outline"
                              onClick={() => {
                                const input = document.getElementById(`url-input-${vIndex}`) as HTMLInputElement;
                                if (input) {
                                  handleUrlAdd(vIndex, input.value);
                                  input.value = '';
                                }
                              }}
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {variant.images.length > 0 && (
                          <div className="admin-image-preview-grid">
                            {variant.images.map((img, imgIndex) => (
                              <div key={imgIndex} className="admin-image-preview-item">
                                <img src={img} alt={`Preview ${imgIndex + 1}`} />
                                <button
                                  type="button"
                                  className="admin-image-remove"
                                  onClick={() => removeImage(vIndex, imgIndex)}
                                >
                                  ×
                                </button>
                                {imgIndex === 0 && (
                                  <span className="admin-image-main-badge">Main</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  ))}
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

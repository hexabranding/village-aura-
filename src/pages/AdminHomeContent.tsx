import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

export default function AdminHomeContent() {
  const [weaver, setWeaver] = useState({ eyebrow: '', title: '', description: '', buttonText: '', buttonLink: '', image1: '', image2: '' });
  const [curated, setCurated] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [instagram, setInstagram] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingWeaver, setSavingWeaver] = useState(false);
  const [showCuratedModal, setShowCuratedModal] = useState(false);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [showInstaModal, setShowInstaModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [editingHero, setEditingHero] = useState<any | null>(null);
  const [editingInsta, setEditingInsta] = useState<any | null>(null);
  const [form, setForm] = useState({ category: '', eyebrow: 'Curated Edit', title: '', copy: '', image: '', order: 1, active: true });
  const [heroForm, setHeroForm] = useState({ eyebrow: '', headline: '', ctaLabel: '', ctaLink: '', ctaSecondaryLabel: '', ctaSecondaryLink: '', image: '', order: 1, active: true });
  const [instaForm, setInstaForm] = useState({ label: '', image: '', link: '', order: 1, active: true });
  const [uploading, setUploading] = useState<string | null>(null);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const fileRefCurated = useRef<HTMLInputElement>(null);
  const fileRefHero = useRef<HTMLInputElement>(null);
  const fileRefInsta = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const [w, c, h, insta] = await Promise.all([api.weaverStory.get(), api.curatedEdits.getAll(), api.heroSlides.getAll(), api.instagram.getAll().catch(() => [])]);
      setWeaver({ eyebrow: w.eyebrow || '', title: w.title || '', description: w.description || '', buttonText: w.buttonText || '', buttonLink: w.buttonLink || '', image1: w.image1 || '', image2: w.image2 || '' });
      setCurated(Array.isArray(c) ? c : []);
      setHeroSlides(Array.isArray(h) ? h : []);
      setInstagram(Array.isArray(insta) ? insta : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const upload = async (files: FileList | null, onUrl: (url: string) => void, key: string) => {
    if (!files || !files.length) return;
    setUploading(key);
    try { const urls = await api.upload.images(files); if (urls[0]) onUrl(urls[0]); } catch (e) { console.error(e); } finally { setUploading(null); }
  };

  const saveWeaver = async () => {
    setSavingWeaver(true);
    try { await api.weaverStory.update(weaver); } catch (e) { console.error(e); } finally { setSavingWeaver(false); }
  };

  const openAddCurated = () => { setEditing(null); setForm({ category: '', eyebrow: 'Curated Edit', title: '', copy: '', image: '', order: curated.length + 1, active: true }); setShowCuratedModal(true); };
  const openEditCurated = (item: any) => { setEditing(item); setForm({ category: item.category, eyebrow: item.eyebrow, title: item.title, copy: item.copy, image: item.image, order: item.order, active: item.active }); setShowCuratedModal(true); };
  const saveCurated = async () => {
    if (!form.category || !form.title) return;
    try {
      if (editing) await api.curatedEdits.update(editing.id || editing._id, form);
      else await api.curatedEdits.create(form);
      await load(); setShowCuratedModal(false);
    } catch (e) { console.error(e); }
  };
  const deleteCurated = async (id: string) => { try { await api.curatedEdits.delete(id); await load(); } catch (e) { console.error(e); } };
  const openAddHero = () => { setEditingHero(null); setHeroForm({ eyebrow: '', headline: '', ctaLabel: 'Shop the Weave', ctaLink: '/shop', ctaSecondaryLabel: '', ctaSecondaryLink: '', image: '', order: heroSlides.length + 1, active: true }); setHeroError(null); setShowHeroModal(true); };
  const openEditHero = (item: any) => { setEditingHero(item); setHeroForm({ eyebrow: item.eyebrow || '', headline: Array.isArray(item.headline) ? item.headline.join('\n') : (item.headline || ''), ctaLabel: item.ctaLabel || '', ctaLink: item.ctaLink || '', ctaSecondaryLabel: item.ctaSecondaryLabel || '', ctaSecondaryLink: item.ctaSecondaryLink || '', image: item.image || '', order: item.order || 1, active: item.active }); setHeroError(null); setShowHeroModal(true); };
  const saveHero = async () => {
    if (!heroForm.headline.trim()) { setHeroError('Headline is required (one or two lines)'); return; }
    if (!heroForm.image.trim()) { setHeroError('Background image is required'); return; }
    setHeroSaving(true); setHeroError(null);
    const payload = { eyebrow: heroForm.eyebrow, headline: heroForm.headline.split('\n').map((s: string) => s.trim()).filter(Boolean), ctaLabel: heroForm.ctaLabel, ctaLink: heroForm.ctaLink, ctaSecondaryLabel: heroForm.ctaSecondaryLabel, ctaSecondaryLink: heroForm.ctaSecondaryLink, image: heroForm.image, order: heroForm.order, active: heroForm.active };
    try {
      if (editingHero) await api.heroSlides.update(editingHero.id || editingHero._id, payload);
      else await api.heroSlides.create(payload);
      await load(); setShowHeroModal(false);
    } catch (e: any) { console.error(e); setHeroError(e?.message || 'Failed to save — restart backend and ensure login'); } finally { setHeroSaving(false); }
  };
  const deleteHero = async (id: string) => { try { await api.heroSlides.delete(id); await load(); } catch (e) { console.error(e); } };
  const openAddInsta = () => { setEditingInsta(null); setInstaForm({ label: '', image: '', link: '', order: instagram.length + 1, active: true }); setShowInstaModal(true); };
  const openEditInsta = (item: any) => { setEditingInsta(item); setInstaForm({ label: item.label || '', image: item.image || '', link: item.link || '', order: item.order || 1, active: item.active }); setShowInstaModal(true); };
  const saveInsta = async () => {
    if (!instaForm.image) return;
    try {
      if (editingInsta) await api.instagram.update(editingInsta.id || editingInsta._id, instaForm);
      else await api.instagram.create(instaForm);
      await load(); setShowInstaModal(false);
    } catch (e) { console.error(e); }
  };
  const deleteInsta = async (id: string) => { try { await api.instagram.delete(id); await load(); } catch (e) { console.error(e); } };
  const importLocalInstagram = async () => {
    const localImages = [
      { label: 'Sarees', image: '/images/IMG_9630.PNG' },
      { label: 'Suit Sets', image: '/images/IMG_9588.PNG' },
      { label: 'Weaves', image: '/images/IMG_9587.PNG' },
      { label: 'Bags', image: '/images/IMG_8835.PNG' },
      { label: 'Jewellery', image: '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_19_32%20PM.png' },
      { label: 'New Arrivals', image: '/images/ChatGPT%20Image%20Aug%2022%2C%202026%20at%2004_09_29%20PM.png' },
    ];
    try {
      for (let i = 0; i < localImages.length; i++) {
        const it = localImages[i];
        await api.instagram.create({ label: it.label, image: it.image, link: '', order: instagram.length + i + 1, active: true });
      }
      await load();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="admin-products-loading"><div className="admin-products-spinner" /><span>Loading home content...</span></div>;

  return (
    <div className="admin-ads-page">
      <div className="admin-products-stats">
        <div className="admin-products-stat"><div className="admin-stat-icon maroon">🏠</div><div className="admin-products-stat-text"><span className="admin-products-stat-value">{heroSlides.length}</span><span className="admin-products-stat-label">Hero Slides</span></div></div>
        <div className="admin-products-stat"><div className="admin-stat-icon maroon">🧵</div><div className="admin-products-stat-text"><span className="admin-products-stat-value">Weaver</span><span className="admin-products-stat-label">Story</span></div></div>
        <div className="admin-products-stat green"><div className="admin-stat-icon green">✨</div><div className="admin-products-stat-text"><span className="admin-products-stat-value">{curated.length}</span><span className="admin-products-stat-label">Curated Edits</span></div></div>
        <div className="admin-products-stat"><div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #e1306c, #f77737)', color: '#fff' }}>📸</div><div className="admin-products-stat-text"><span className="admin-products-stat-value">{instagram.length}</span><span className="admin-products-stat-label">Instagram</span></div></div>
      </div>

      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Hero Section — Slides</h3>
          <button onClick={openAddHero} className="admin-products-add-btn"><span>+</span> Add Slide</button>
        </div>
        <div className="admin-ads-grid">
          {heroSlides.map((item, i) => (
            <motion.div key={item.id || item._id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`admin-ad-card ${!item.active ? 'inactive' : ''}`}>
              {item.image ? <div className="admin-ad-card-image"><img src={item.image} alt={item.eyebrow} />{!item.active && <div className="admin-ad-card-overlay">Inactive</div>}</div> : <div className="admin-ad-card-placeholder">🏠</div>}
              <div className="admin-ad-card-content">
                <h4 className="admin-ad-card-title" style={{ fontSize: '0.85rem' }}>{Array.isArray(item.headline) ? item.headline.join(' ') : item.headline}</h4>
                <div className="admin-ad-card-tags"><span className="admin-ad-tag">{item.eyebrow}</span><span className="admin-ad-tag order">Order: {item.order}</span>{item.active ? <span className="admin-ad-tag" style={{ background: '#dcfce7' }}>Active</span> : <span className="admin-ad-tag">Inactive</span>}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '0.3rem' }}>{item.ctaLabel} → {item.ctaLink}</div>
              </div>
              <div className="admin-ad-card-actions">
                <button onClick={() => openEditHero(item)} className="admin-ad-card-action edit">✏️ Edit</button>
                <button onClick={() => deleteHero(item.id || item._id)} className="admin-ad-card-action delete">🗑 Delete</button>
              </div>
            </motion.div>
          ))}
          {heroSlides.length === 0 && <div className="admin-products-empty" style={{ gridColumn: '1/-1' }}><h3>No Hero Slides</h3><p>Add slides for hero carousel.</p></div>}
        </div>
      </div>

      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>By Hand, By Name — Weaver Story</h3>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label>Eyebrow</label><input value={weaver.eyebrow} onChange={e => setWeaver(v => ({ ...v, eyebrow: e.target.value }))} placeholder="By Hand, By Name" /></div>
          <div className="admin-form-group"><label>Button Text</label><input value={weaver.buttonText} onChange={e => setWeaver(v => ({ ...v, buttonText: e.target.value }))} placeholder="Meet the Weaves →" /></div>
        </div>
        <div className="admin-form-group"><label>Title</label><input value={weaver.title} onChange={e => setWeaver(v => ({ ...v, title: e.target.value }))} placeholder="Every saree is signed by the loom..." /></div>
        <div className="admin-form-group"><label>Description</label><textarea rows={3} value={weaver.description} onChange={e => setWeaver(v => ({ ...v, description: e.target.value }))} /></div>
        <div className="admin-form-group"><label>Button Link</label><input value={weaver.buttonLink} onChange={e => setWeaver(v => ({ ...v, buttonLink: e.target.value }))} placeholder="/shop" /></div>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label>Image 1 (Left - Large)</label><div style={{ display: 'flex', gap: '0.5rem' }}><input value={weaver.image1} onChange={e => setWeaver(v => ({ ...v, image1: e.target.value }))} placeholder="Image URL or upload" style={{ flex: 1 }} /><input ref={fileRef1} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => upload(e.target.files, url => setWeaver(v => ({ ...v, image1: url })), 'img1')} /><button type="button" onClick={() => fileRef1.current?.click()} style={{ padding: '0.5rem 1rem', border: '1px solid var(--maroon)', borderRadius: 'var(--radius-sm)', background: 'var(--ivory)', color: 'var(--maroon)', cursor: 'pointer' }}>{uploading === 'img1' ? '...' : 'Upload'}</button></div>{weaver.image1 && <img src={weaver.image1} alt="preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', marginTop: '0.5rem', borderRadius: 8 }} />}</div>
          <div className="admin-form-group"><label>Image 2 (Right - Small)</label><div style={{ display: 'flex', gap: '0.5rem' }}><input value={weaver.image2} onChange={e => setWeaver(v => ({ ...v, image2: e.target.value }))} placeholder="Image URL or upload" style={{ flex: 1 }} /><input ref={fileRef2} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => upload(e.target.files, url => setWeaver(v => ({ ...v, image2: url })), 'img2')} /><button type="button" onClick={() => fileRef2.current?.click()} style={{ padding: '0.5rem 1rem', border: '1px solid var(--maroon)', borderRadius: 'var(--radius-sm)', background: 'var(--ivory)', color: 'var(--maroon)', cursor: 'pointer' }}>{uploading === 'img2' ? '...' : 'Upload'}</button></div>{weaver.image2 && <img src={weaver.image2} alt="preview" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', marginTop: '0.5rem', borderRadius: 8 }} />}</div>
        </div>
        <button onClick={saveWeaver} disabled={savingWeaver} className="admin-btn admin-btn-primary" style={{ marginTop: '1rem', opacity: savingWeaver ? 0.6 : 1 }}>{savingWeaver ? 'Saving...' : 'Save Weaver Story'}</button>
      </div>

      <div className="admin-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Handpicked For You — Curated Edits</h3>
          <button onClick={openAddCurated} className="admin-products-add-btn"><span>+</span> Add Edit</button>
        </div>
        <div className="admin-ads-grid">
          {curated.map((item, i) => (
            <motion.div key={item.id || item._id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`admin-ad-card ${!item.active ? 'inactive' : ''}`}>
              {item.image ? <div className="admin-ad-card-image"><img src={item.image} alt={item.title} />{!item.active && <div className="admin-ad-card-overlay">Inactive</div>}</div> : <div className="admin-ad-card-placeholder">✨</div>}
              <div className="admin-ad-card-content">
                <h4 className="admin-ad-card-title">{item.title}</h4>
                <div className="admin-ad-card-tags"><span className="admin-ad-tag">{item.category}</span><span className="admin-ad-tag type">{item.eyebrow}</span>{item.active ? <span className="admin-ad-tag" style={{ background: '#dcfce7' }}>Active</span> : <span className="admin-ad-tag">Inactive</span>}</div>
                <p className="admin-ad-card-desc">{item.copy}</p>
              </div>
              <div className="admin-ad-card-actions">
                <button onClick={() => openEditCurated(item)} className="admin-ad-card-action edit">✏️ Edit</button>
                <button onClick={() => deleteCurated(item.id || item._id)} className="admin-ad-card-action delete">🗑 Delete</button>
              </div>
            </motion.div>
          ))}
          {curated.length === 0 && <div className="admin-products-empty" style={{ gridColumn: '1/-1' }}><h3>No Curated Edits</h3><p>Add cards for Handpicked section.</p></div>}
        </div>
      </div>

      <div className="admin-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Follow Us On Instagram</h3>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {instagram.length === 0 && <button onClick={importLocalInstagram} className="admin-btn admin-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Import Local Images</button>}
            <button onClick={openAddInsta} className="admin-products-add-btn"><span>+</span> Add Image</button>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginBottom: '1rem' }}>Manage Instagram scrolling images. Click Import to bring existing local images into backend for editing, then edit label/image/link per card.</p>
        <div className="admin-ads-grid">
          {instagram.map((item, i) => (
            <motion.div key={item.id || item._id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`admin-ad-card ${!item.active ? 'inactive' : ''}`}>
              {item.image ? <div className="admin-ad-card-image"><img src={item.image} alt={item.label} />{!item.active && <div className="admin-ad-card-overlay">Inactive</div>}</div> : <div className="admin-ad-card-placeholder">📸</div>}
              <div className="admin-ad-card-content">
                <h4 className="admin-ad-card-title">{item.label || 'Instagram'}</h4>
                <div className="admin-ad-card-tags"><span className="admin-ad-tag order">Order: {item.order}</span>{item.active ? <span className="admin-ad-tag" style={{ background: '#dcfce7' }}>Active</span> : <span className="admin-ad-tag">Inactive</span>}</div>
                {item.link && <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', marginTop: '0.3rem', wordBreak: 'break-all' }}>{item.link}</div>}
              </div>
              <div className="admin-ad-card-actions">
                <button onClick={() => openEditInsta(item)} className="admin-ad-card-action edit">✏️ Edit</button>
                <button onClick={() => deleteInsta(item.id || item._id)} className="admin-ad-card-action delete">🗑 Delete</button>
              </div>
            </motion.div>
          ))}
          {instagram.length === 0 && <div className="admin-products-empty" style={{ gridColumn: '1/-1' }}><h3>No Instagram Images</h3><p>Add images for the scrolling Instagram strip on Home.</p></div>}
        </div>
      </div>

      <AnimatePresence>
        {showCuratedModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-modal-overlay" onClick={() => setShowCuratedModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header"><h3>{editing ? 'Edit Curated Edit' : 'Add Curated Edit'}</h3><button onClick={() => setShowCuratedModal(false)} className="admin-modal-close">✕</button></div>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <div className="admin-form-group"><label>Category *</label><input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Sarees" /></div>
                  <div className="admin-form-group"><label>Eyebrow</label><input value={form.eyebrow} onChange={e => setForm(f => ({ ...f, eyebrow: e.target.value }))} /></div>
                </div>
                <div className="admin-form-group"><label>Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Copy</label><textarea rows={2} value={form.copy} onChange={e => setForm(f => ({ ...f, copy: e.target.value }))} /></div>
                <div className="admin-form-group"><label>Image</label><div style={{ display: 'flex', gap: '0.5rem' }}><input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="Image URL or upload" style={{ flex: 1 }} /><input ref={fileRefCurated} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => upload(e.target.files, url => setForm(f => ({ ...f, image: url })), 'curated')} /><button type="button" onClick={() => fileRefCurated.current?.click()} style={{ padding: '0.5rem 1rem', border: '1px solid var(--maroon)', background: 'var(--ivory)', color: 'var(--maroon)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>{uploading === 'curated' ? '...' : 'Upload'}</button></div>{form.image && <img src={form.image} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', marginTop: '0.5rem', borderRadius: 8 }} />}</div>
                <div className="admin-form-grid">
                  <div className="admin-form-group"><label>Order</label><input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} /></div>
                  <div className="admin-form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.4rem' }}><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} /> Active</label></div>
                </div>
              </div>
              <div className="admin-modal-footer"><button onClick={() => setShowCuratedModal(false)} className="admin-btn admin-btn-outline">Cancel</button><button onClick={saveCurated} className="admin-btn admin-btn-primary">{editing ? 'Save' : 'Add'}</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showHeroModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-modal-overlay" onClick={() => setShowHeroModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header"><h3>{editingHero ? 'Edit Hero Slide' : 'Add Hero Slide'}</h3><button onClick={() => setShowHeroModal(false)} className="admin-modal-close">✕</button></div>
              <div className="admin-modal-body">
                <div className="admin-form-group"><label>Eyebrow</label><input value={heroForm.eyebrow} onChange={e => setHeroForm(f => ({ ...f, eyebrow: e.target.value }))} placeholder="Woven Since 1962..." /></div>
                <div className="admin-form-group"><label>Headline (each line on new line)</label><textarea rows={2} value={heroForm.headline} onChange={e => setHeroForm(f => ({ ...f, headline: e.target.value }))} placeholder={"Six yards,\none lifetime of moments."} /></div>
                <div className="admin-form-grid">
                  <div className="admin-form-group"><label>CTA Label</label><input value={heroForm.ctaLabel} onChange={e => setHeroForm(f => ({ ...f, ctaLabel: e.target.value }))} placeholder="Shop the Weave" /></div>
                  <div className="admin-form-group"><label>CTA Link</label><input value={heroForm.ctaLink} onChange={e => setHeroForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="/shop" /></div>
                </div>
                <div className="admin-form-grid">
                  <div className="admin-form-group"><label>CTA Secondary Label</label><input value={heroForm.ctaSecondaryLabel} onChange={e => setHeroForm(f => ({ ...f, ctaSecondaryLabel: e.target.value }))} placeholder="Sarees" /></div>
                  <div className="admin-form-group"><label>CTA Secondary Link</label><input value={heroForm.ctaSecondaryLink} onChange={e => setHeroForm(f => ({ ...f, ctaSecondaryLink: e.target.value }))} placeholder="/shop?category=Sarees" /></div>
                </div>
                <div className="admin-form-group"><label>Background Image *</label><div style={{ display: 'flex', gap: '0.5rem' }}><input value={heroForm.image} onChange={e => setHeroForm(f => ({ ...f, image: e.target.value }))} placeholder="Image URL or upload" style={{ flex: 1 }} /><input ref={fileRefHero} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => upload(e.target.files, url => setHeroForm(f => ({ ...f, image: url })), 'hero')} /><button type="button" onClick={() => fileRefHero.current?.click()} style={{ padding: '0.5rem 1rem', border: '1px solid var(--maroon)', background: 'var(--ivory)', color: 'var(--maroon)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>{uploading === 'hero' ? '...' : 'Upload'}</button></div>{heroForm.image && <img src={heroForm.image} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', marginTop: '0.5rem', borderRadius: 8 }} />}</div>
                <div className="admin-form-grid">
                  <div className="admin-form-group"><label>Order</label><input type="number" value={heroForm.order} onChange={e => setHeroForm(f => ({ ...f, order: Number(e.target.value) }))} /></div>
                  <div className="admin-form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.4rem' }}><input type="checkbox" checked={heroForm.active} onChange={e => setHeroForm(f => ({ ...f, active: e.target.checked }))} /> Active</label></div>
                </div>
              </div>
              {heroError && <div style={{ padding: '0 1.5rem 0.75rem', color: '#dc2626', fontSize: '0.82rem' }}>{heroError}</div>}
              <div className="admin-modal-footer"><button onClick={() => { setHeroError(null); setShowHeroModal(false); }} className="admin-btn admin-btn-outline">Cancel</button><button onClick={saveHero} disabled={heroSaving} className="admin-btn admin-btn-primary" style={{ opacity: heroSaving ? 0.6 : 1 }}>{heroSaving ? 'Saving...' : editingHero ? 'Save' : 'Add'}</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showInstaModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-modal-overlay" onClick={() => setShowInstaModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header"><h3>{editingInsta ? 'Edit Instagram Image' : 'Add Instagram Image'}</h3><button onClick={() => setShowInstaModal(false)} className="admin-modal-close">✕</button></div>
              <div className="admin-modal-body">
                <div className="admin-form-group"><label>Label</label><input value={instaForm.label} onChange={e => setInstaForm(f => ({ ...f, label: e.target.value }))} placeholder="Sarees" /></div>
                <div className="admin-form-group"><label>Link (Instagram URL)</label><input value={instaForm.link} onChange={e => setInstaForm(f => ({ ...f, link: e.target.value }))} placeholder="https://instagram.com/p/..." /></div>
                <div className="admin-form-group"><label>Image *</label><div style={{ display: 'flex', gap: '0.5rem' }}><input value={instaForm.image} onChange={e => setInstaForm(f => ({ ...f, image: e.target.value }))} placeholder="Image URL or upload" style={{ flex: 1 }} /><input ref={fileRefInsta} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => upload(e.target.files, url => setInstaForm(f => ({ ...f, image: url })), 'insta')} /><button type="button" onClick={() => fileRefInsta.current?.click()} style={{ padding: '0.5rem 1rem', border: '1px solid var(--maroon)', background: 'var(--ivory)', color: 'var(--maroon)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>{uploading === 'insta' ? '...' : 'Upload'}</button></div>{instaForm.image && <img src={instaForm.image} alt="preview" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', marginTop: '0.5rem', borderRadius: 8 }} />}</div>
                <div className="admin-form-grid">
                  <div className="admin-form-group"><label>Order</label><input type="number" value={instaForm.order} onChange={e => setInstaForm(f => ({ ...f, order: Number(e.target.value) }))} /></div>
                  <div className="admin-form-group"><label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.4rem' }}><input type="checkbox" checked={instaForm.active} onChange={e => setInstaForm(f => ({ ...f, active: e.target.checked }))} /> Active</label></div>
                </div>
              </div>
              <div className="admin-modal-footer"><button onClick={() => setShowInstaModal(false)} className="admin-btn admin-btn-outline">Cancel</button><button onClick={saveInsta} className="admin-btn admin-btn-primary">{editingInsta ? 'Save' : 'Add'}</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

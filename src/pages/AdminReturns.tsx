import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type ReturnRequest, resolveUploadUrl } from '../lib/api';
import { getProduct } from '../lib/productStore';

const statuses=['Return Requested','Under Review','More Information Required','Approved','Pickup Scheduled','Picked Up','Product Received','Quality Check','Replacement Processing','Completed','Rejected','Cancelled'];
const colors:any={ 'Return Requested':'#f59e0b','Under Review':'#3b82f6','More Information Required':'#eab308', Approved:'#10b981','Pickup Scheduled':'#8b5cf6','Picked Up':'#f97316','Product Received':'#06b6d4','Quality Check':'#a855f7','Replacement Processing':'#6366f1', Completed:'#059669', Rejected:'#ef4444', Cancelled:'#6b7280' };

export default function AdminReturns(){
  const [returns,setReturns]=useState<ReturnRequest[]>([]);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('All');
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState<ReturnRequest|null>(null);
  const [actionStatus,setActionStatus]=useState('');
  const [adminMsg,setAdminMsg]=useState('');
  const [pickupDate,setPickupDate]=useState('');
  const [courier,setCourier]=useState('');
  const [trackingNo,setTrackingNo]=useState('');
  const [zoomImage,setZoomImage]=useState<string|null>(null);
  const [zoomScale,setZoomScale]=useState(1);
  const [videoRetries,setVideoRetries]=useState<Record<string,number>>({});
  useEffect(()=>{
    if(!zoomImage) return;
    const handler=(e:WheelEvent)=>{e.preventDefault();setZoomScale(s=>Math.max(1,Math.min(5,s-(e.deltaY>0?0.3:-0.3))));};
    window.addEventListener('wheel',handler,{passive:false});
    return()=>window.removeEventListener('wheel',handler);
  },[zoomImage]);
  useEffect(()=>{
    if(!zoomImage) return;
    const keyHandler=(e:KeyboardEvent)=>{if(e.key==='Escape'){setZoomImage(null);setZoomScale(1);}if(e.key==='+'||e.key==='=')setZoomScale(s=>Math.min(5,s+0.5));if(e.key==='-')setZoomScale(s=>Math.max(1,s-0.5));};
    window.addEventListener('keydown',keyHandler);
    return()=>window.removeEventListener('keydown',keyHandler);
  },[zoomImage]);
  const load=async()=>{ try{ const d=await api.returns.getAll(); setReturns(d);}catch(e:any){ } finally{ setLoading(false);} };
  useEffect(()=>{ load(); const i=setInterval(load,12000); return()=>clearInterval(i); },[]);
  const openAction=(r:ReturnRequest, status:string)=>{ setSelected(r); setActionStatus(status); setAdminMsg(''); setPickupDate(''); setCourier(''); setTrackingNo(''); };
  const handleDelete=async(id:string, returnId?:string)=>{
    if(!confirm(`Delete return ${returnId||id}? This cannot be undone.`)) return;
    try{ await api.returns.delete(id); setReturns(p=>p.filter(x=> (x as any).id!==id && (x as any)._id!==id && x.returnId!==id)); setSelected(null); }catch(e:any){ alert(e.message||'Delete failed'); }
  };
  const doAction=async()=>{
    if(!selected || !actionStatus) return;
    if(actionStatus==='Rejected' && !adminMsg.trim()){ alert('Rejection reason required'); return; }
    try{
      const extra:any={ adminMessage: adminMsg, message: adminMsg||`Moved to ${actionStatus}` };
      if(pickupDate) extra.pickupDate=pickupDate;
      if(courier) extra.pickupCourier=courier;
      if(trackingNo) extra.pickupTrackingNo=trackingNo;
      const u=await api.returns.updateStatus(selected.id, actionStatus, extra);
      setReturns(p=>p.map(x=>x.id===selected.id?u:x)); setSelected(null);
    }catch(e:any){ alert(e.message); }
  };
  const filtered=returns.filter(r=>{
    const q=search.toLowerCase();
    return (!q || r.orderId.toLowerCase().includes(q) || r.phone.includes(q) || r.reason.toLowerCase().includes(q) || (r.returnId||'').toLowerCase().includes(q)) && (filter==='All' || r.status===filter);
  });
  if(loading) return <div className="admin-products-loading"><div className="admin-products-spinner"/><span>Loading returns...</span></div>;
  return (
    <div className="admin-orders-page">
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'1rem'}}>
        {['All',...statuses].slice(0,8).map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:'0.4rem 0.8rem', borderRadius:20, border: filter===s?'1px solid var(--maroon)':'1px solid var(--line)', background: filter===s?'var(--maroon)':'white', color: filter===s?'white':'var(--ink-soft)', fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>{s} ({s==='All'?returns.length:returns.filter(r=>r.status===s).length})</button>
        ))}
      </div>
      <div className="admin-products-toolbar">
        <div className="admin-products-toolbar-left">
          <div className="admin-products-search-wrap"><span className="admin-products-search-icon">🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search returnId / orderId / phone / reason..." className="admin-products-search"/>{search && <button className="admin-products-search-clear" onClick={()=>setSearch('')}>✕</button>}</div>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="admin-products-filter"><option value="All">All</option>{statuses.map(s=> <option key={s} value={s}>{s}</option>)}</select>
        </div>
        <span style={{fontSize:'0.82rem',color:'var(--ink-soft)'}}>{filtered.length} requests</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'0.85rem'}}>
        {filtered.map((r)=>{
          const prod=getProduct(r.productId);
          const thumb= prod?.variants?.[0]?.images?.[0];
          return (
          <motion.div key={r.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} whileHover={{ y:-2, boxShadow:'0 8px 24px rgba(0,0,0,0.08)' }} style={{background:'white',border:'1px solid #f3f4f6',borderLeft:`4px solid ${colors[r.status]||'#999'}`,borderRadius:16,padding:'1.1rem',display:'flex',flexDirection:'column',gap:'0.7rem',boxShadow:'0 2px 12px rgba(0,0,0,0.04)',transition:'all 0.2s'}}>
            <div style={{display:'flex',gap:'0.85rem',alignItems:'flex-start'}}>
              {thumb ? <img onError={(e)=>{const t=e.target as HTMLImageElement; if(!t.dataset.fallback){t.dataset.fallback='1'; t.style.display='none';}}} width={400} height={400} loading="lazy" decoding="async" src={resolveUploadUrl(thumb)} alt="Village Allure image" style={{width:56,height:56,objectFit:'cover',borderRadius:10,border:'1px solid #f3f4f6',flexShrink:0}}/> : <div style={{width:56,height:56,background:'#f9fafb',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem'}}>📦</div>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,color:'var(--maroon)',fontSize:'0.92rem',display:'flex',gap:'0.4rem',alignItems:'center',flexWrap:'wrap'}}>{r.returnId||r.id.slice(-8).toUpperCase()} <span style={{fontWeight:500,color:'var(--ink-soft)',fontSize:'0.72rem',background:'#f9fafb',padding:'0.15rem 0.5rem',borderRadius:20,border:'1px solid #f3f4f6'}}>{r.orderId}</span> <span style={{fontSize:'0.65rem',background:(colors[r.status]||'#999')+'15',color:colors[r.status]||'#111',padding:'0.25rem 0.6rem',borderRadius:20,fontWeight:700,border:`1px solid ${(colors[r.status]||'#999')}30`}}>{r.status}</span></div>
                <div style={{fontSize:'0.82rem',fontWeight:500,marginTop:'0.2rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{prod?.name||r.productId}</div>
                <div style={{fontSize:'0.72rem',color:'var(--ink-soft)',marginTop:'0.15rem'}}>Qty {r.qty||1} • {r.resolution} • {r.phone} • {new Date(r.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                <div style={{fontSize:'0.68rem',color:'#9ca3af',marginTop:'0.15rem'}}>Delivered: {r.deliveryDate? new Date(r.deliveryDate).toLocaleDateString('en-IN'): '-'} • Deadline: {r.returnDeadline? new Date(r.returnDeadline).toLocaleDateString('en-IN'): '-'}</div>
              </div>
            </div>
            <div style={{fontSize:'0.82rem'}}><strong>Reason:</strong> {r.reason}{r.otherReason?` (${r.otherReason})`:''} {r.description?` — ${r.description}`:''}</div>
            {(r.images?.length||0)>0 && <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{r.images!.map((img,i)=><img onError={(e)=>{const t=e.target as HTMLImageElement; if(!t.dataset.fallback){t.dataset.fallback='1'; t.style.display='none';}}} width={400} height={400} loading="lazy" decoding="async" key={i} src={resolveUploadUrl(img)} alt="Evidence" onClick={()=>{setZoomImage(img);setZoomScale(1);}} style={{width:64,height:64,objectFit:'cover',borderRadius:8,border:'1px solid var(--line)',cursor:'zoom-in',transition:'transform 0.15s'}} onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')} onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')} />)}</div>}
            {r.video && (()=>{
              const vidUrl=resolveUploadUrl(r.video);
              const retryCount=videoRetries[r.video]||0;
              const cacheBust=`?v=${retryCount}`;
              return retryCount>3
                ? <div style={{padding:'0.5rem',background:'#fef2f2',border:'1px dashed #fecaca',borderRadius:8,fontSize:'0.75rem',color:'#991b1b',maxWidth:240}}>Video unavailable <button onClick={()=>setVideoRetries(p=>({...p,[r.video ?? '']:0}))} style={{marginLeft:6,border:'1px solid #fecaca',background:'white',borderRadius:4,padding:'1px 6px',fontSize:'0.7rem',cursor:'pointer',color:'#991b1b'}}>Retry</button></div>
                : <video key={`${r.video}-${retryCount}`} src={vidUrl+cacheBust} controls playsInline preload="metadata" muted onError={()=>{ setVideoRetries(p=>({...p,[r.video!]: (p[r.video!]||0)+1 })); }} style={{maxWidth:240, maxHeight:140, borderRadius:8}} />;
            })()}
            {r.pickup && <div style={{fontSize:'0.75rem',background:'#f9fafb',border:'1px solid #e5e7eb',padding:'0.4rem 0.6rem',borderRadius:8}}>Pickup: {r.pickup.status} {r.pickup.date?`• ${r.pickup.date}`:''} {r.pickup.courier?`• ${r.pickup.courier}`:''} {r.pickup.trackingNo?`• ${r.pickup.trackingNo}`:''}</div>}
            {r.adminMessage && <div style={{fontSize:'0.78rem',background:'#eff6ff',border:'1px solid #bfdbfe',padding:'0.5rem',borderRadius:8,color:'#1e40af'}}>{r.adminMessage}</div>}
            {r.tracking && r.tracking.length>0 && (()=>{
              const last=r.tracking[r.tracking.length-1];
              return <div style={{fontSize:'0.72rem',color:'#6b7280',background:'#f9fafb',border:'1px solid #f3f4f6',padding:'0.35rem 0.6rem',borderRadius:8,display:'flex',alignItems:'center',gap:'0.4rem'}}><span style={{width:8,height:8,borderRadius:'50%',background:colors[last.status]||'#999',flexShrink:0}} /><span><strong>{last.status}</strong>: {last.message||'No details'} • {new Date(last.timestamp).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div>;
            })()}
            {r.tracking && <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{r.tracking.slice(-4).map((t:any,i:number)=><span key={i} style={{fontSize:'0.65rem',background:'#f3f4f6',padding:'2px 6px',borderRadius:12,border:'1px solid #e5e7eb'}}>{t.status}: {t.message?.slice(0,40)}</span>)}</div>}
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
              {['Under Review','Approved','More Information Required'].includes(r.status) || r.status==='Return Requested' ? <button onClick={()=>openAction(r,'Approved')} style={{padding:'0.4rem 0.8rem',background:'#10b981',color:'white',border:'none',borderRadius:8,fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>Approve</button> : null}
              <button onClick={()=>openAction(r,'Rejected')} style={{padding:'0.4rem 0.8rem',background:'white',border:'1px solid #fecaca',color:'#991b1b',borderRadius:8,fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>Reject</button>
              <select value="" onChange={e=>{ if(e.target.value) openAction(r, e.target.value); e.target.value=''; }} style={{padding:'0.4rem',borderRadius:8,border:'1px solid var(--line)',fontSize:'0.75rem'}}>
                <option value="">Move to...</option>
                {statuses.filter(s=>s!==r.status).map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={()=>setSelected(r)} style={{padding:'0.4rem 0.8rem',background:'white',border:'1px solid var(--line)',borderRadius:8,fontSize:'0.75rem',cursor:'pointer'}}>View</button>
              <button onClick={()=>handleDelete((r as any).id || (r as any)._id, r.returnId)} style={{padding:'0.4rem 0.8rem',background:'white',border:'1px solid #fecaca',color:'#991b1b',borderRadius:8,fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}}>🗑️ Delete</button>
            </div>
          </motion.div>
        )})}
        {filtered.length===0 && <div className="admin-products-empty"><h3>No returns</h3></div>}
      </div>
      <AnimatePresence>
        {selected && actionStatus && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="admin-modal-overlay" onClick={()=>{setSelected(null);setActionStatus('');}}>
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="admin-modal" onClick={e=>e.stopPropagation()}>
              <div className="admin-modal-header"><h3>{selected.returnId} → {actionStatus}</h3><button onClick={()=>{setSelected(null);setActionStatus('');}} className="admin-modal-close">✕</button></div>
              <div className="admin-modal-body" style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                <div className="admin-form-group"><label>Admin Message {actionStatus==='Rejected'?'*':''}</label><textarea value={adminMsg} onChange={e=>setAdminMsg(e.target.value)} rows={3} placeholder={actionStatus==='Rejected'?'Reason for rejection (required)':'Message to customer'} style={{width:'100%',padding:'0.6rem',border:'1px solid var(--line)',borderRadius:8}} /></div>
                {(actionStatus==='Pickup Scheduled' || actionStatus==='Picked Up') && <>
                  <div className="admin-form-group"><label>Pickup Date</label><input type="date" value={pickupDate} onChange={e=>setPickupDate(e.target.value)} style={{width:'100%',padding:'0.6rem',border:'1px solid var(--line)',borderRadius:8}} /></div>
                  <div className="admin-form-group"><label>Courier</label><input value={courier} onChange={e=>setCourier(e.target.value)} placeholder="Courier name" style={{width:'100%',padding:'0.6rem',border:'1px solid var(--line)',borderRadius:8}} /></div>
                  <div className="admin-form-group"><label>Tracking No</label><input value={trackingNo} onChange={e=>setTrackingNo(e.target.value)} placeholder="Tracking number" style={{width:'100%',padding:'0.6rem',border:'1px solid var(--line)',borderRadius:8}} /></div>
                </>}
              </div>
              <div className="admin-modal-footer"><button onClick={()=>{setSelected(null);setActionStatus('');}} className="admin-btn admin-btn-outline">Cancel</button><button onClick={doAction} className="admin-btn admin-btn-primary">Confirm {actionStatus}</button></div>
            </motion.div>
          </motion.div>
        )}
        {selected && !actionStatus && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="admin-modal-overlay" onClick={()=>setSelected(null)}>
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="admin-modal" onClick={e=>e.stopPropagation()} style={{maxWidth:700}}>
              <div className="admin-modal-header"><h3>{selected.returnId} Details</h3><button onClick={()=>setSelected(null)} className="admin-modal-close">✕</button></div>
              <div className="admin-modal-body" style={{fontSize:'0.82rem',lineHeight:1.6}}>
                <p><strong>Order:</strong> {selected.orderId} • <strong>Product:</strong> {selected.productId} • Qty {selected.qty}</p>
                <p><strong>Reason:</strong> {selected.reason} {selected.otherReason?`(${selected.otherReason})`:''}</p>
                <p><strong>Description:</strong> {selected.description||'-'}</p>
                <p><strong>Resolution:</strong> {selected.resolution} • <strong>Status:</strong> {selected.status}</p>
                {selected.images?.length ? <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:'0.5rem'}}>{selected.images.map((im,i)=><img onError={(e)=>{const t=e.target as HTMLImageElement; if(!t.dataset.fallback){t.dataset.fallback='1'; t.style.display='none';}}} width={400} height={400} loading="lazy" decoding="async" key={i} src={resolveUploadUrl(im)} onClick={()=>{setZoomImage(im);setZoomScale(1);}} style={{width:80,height:80,objectFit:'cover',borderRadius:8,cursor:'zoom-in',transition:'transform 0.15s'}} onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')} onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')} /> )}</div> : null}
                {selected.video && (()=>{
                  const vidUrl=resolveUploadUrl(selected.video);
                  const retryCount=videoRetries[selected.video]||0;
                  const cacheBust=`?v=${retryCount}`;
                  return retryCount>3
                    ? <div style={{padding:'1rem',background:'#fef2f2',border:'1px dashed #fecaca',borderRadius:8,fontSize:'0.82rem',color:'#991b1b',textAlign:'center'}}>Video unavailable <button onClick={()=>setVideoRetries(p=>({...p,[selected.video ?? '']:0}))} style={{marginLeft:6,border:'1px solid #fecaca',background:'white',borderRadius:4,padding:'2px 8px',fontSize:'0.75rem',cursor:'pointer',color:'#991b1b'}}>Retry</button></div>
                    : <video key={`${selected.video}-${retryCount}`} src={vidUrl+cacheBust} controls playsInline preload="metadata" muted onError={()=>{ setVideoRetries(p=>({...p,[selected.video!]: (p[selected.video!]||0)+1 })); }} style={{width:'100%',maxHeight:200,marginTop:'0.5rem',borderRadius:8}} />;
                })()}
                <div style={{marginTop:'0.75rem'}}>
                  <strong style={{fontSize:'0.85rem'}}>📋 Tracking Timeline</strong>
                  {selected.tracking?.length ? (
                    <div style={{display:'flex',flexDirection:'column',gap:0,marginTop:'0.5rem',borderLeft:'2px solid #e5e7eb',marginLeft:4,paddingLeft:14}}>
                      {selected.tracking!.map((t:any,i:number)=>(
                        <div key={i} style={{position:'relative',paddingBottom:12,borderBottom: i<(selected.tracking!.length-1) ? '1px solid #f3f4f6' : 'none'}}>
                          <div style={{position:'absolute',left:-20,top:4,width:12,height:12,borderRadius:'50%',background: i===selected.tracking!.length-1 ? (colors[t.status]||'#6b7280') : '#d1d5db',border:'2px solid white',boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}} />
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{fontSize:'0.78rem',fontWeight:700,color: i===selected.tracking!.length-1 ? (colors[t.status]||'#333') : '#6b7280'}}>{t.status}</span>
                            <span style={{fontSize:'0.65rem',color:'#9ca3af'}}>{new Date(t.timestamp).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                          </div>
                          {t.message && <div style={{fontSize:'0.72rem',color:'#6b7280',marginTop:2}}>{t.message}</div>}
                        </div>
                      ))}
                    </div>
                  ) : <div style={{fontSize:'0.75rem',color:'#9ca3af',marginTop:'0.3rem'}}>No tracking entries yet</div>}
                </div>
              </div>
              <div className="admin-modal-footer"><button onClick={()=>handleDelete((selected as any).id || (selected as any)._id, selected.returnId)} style={{padding:'0.5rem 1rem',background:'#fee2e2',border:'1px solid #fecaca',color:'#991b1b',borderRadius:8,fontSize:'0.82rem',fontWeight:700,cursor:'pointer',marginRight:'auto'}}>🗑️ Delete</button><button onClick={()=>setSelected(null)} className="admin-btn admin-btn-outline">Close</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {zoomImage && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9999,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'zoom-out'}} onClick={()=>{setZoomImage(null);setZoomScale(1);}}>
            <motion.div initial={{scale:0.8}} animate={{scale:1}} exit={{scale:0.8}} onClick={e=>e.stopPropagation()} style={{position:'relative',maxWidth:'90vw',maxHeight:'90vh'}}>
              <img src={resolveUploadUrl(zoomImage)} alt="Zoomed evidence" style={{maxWidth:'90vw',maxHeight:'85vh',objectFit:'contain',borderRadius:8,transform:`scale(${zoomScale})`,transformOrigin:'center',transition:'transform 0.2s ease',cursor:zoomScale>1?'grab':'zoom-in'}} />
              <div style={{position:'absolute',top:-12,right:-12,display:'flex',gap:6}}>
                <button onClick={e=>{e.stopPropagation();setZoomScale(s=>Math.min(s+0.5,5));}} style={{width:36,height:36,borderRadius:'50%',background:'white',border:'none',fontSize:'1.2rem',cursor:'pointer',boxShadow:'0 2px 12px rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                <button onClick={e=>{e.stopPropagation();setZoomScale(s=>Math.max(s-0.5,1));}} style={{width:36,height:36,borderRadius:'50%',background:'white',border:'none',fontSize:'1.2rem',cursor:'pointer',boxShadow:'0 2px 12px rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>-</button>
                <button onClick={e=>{e.stopPropagation();setZoomImage(null);setZoomScale(1);}} style={{width:36,height:36,borderRadius:'50%',background:'#ef4444',color:'white',border:'none',fontSize:'1rem',cursor:'pointer',boxShadow:'0 2px 12px rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
              </div>
              <div style={{position:'absolute',bottom:-12,left:'50%',transform:'translateX(-50%)',background:'rgba(255,255,255,0.9)',padding:'4px 12px',borderRadius:20,fontSize:'0.75rem',fontWeight:600,color:'#333',whiteSpace:'nowrap'}}>{Math.round(zoomScale*100)}% • Scroll to zoom • Click outside to close</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

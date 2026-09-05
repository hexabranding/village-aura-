import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function AdminReturnSettings(){
  const [s,setS]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  useEffect(()=>{ api.returnSettings.getAdmin().then(d=>setS(d)).catch(()=>{}).finally(()=>setLoading(false)); },[]);
  const save=async()=>{
    setSaving(true);
    try{ const u=await api.returnSettings.update(s); setS(u); }catch(e:any){ alert(e.message);} finally{ setSaving(false); }
  };
  if(loading) return <div style={{padding:'2rem'}}>Loading...</div>;
  if(!s) return <div>Failed to load</div>;
  const inputStyle:any={ width:'100%', padding:'0.6rem', border:'1px solid var(--line)', borderRadius:8, fontSize:'0.85rem' };
  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      <h2 style={{ fontSize:'1.4rem', fontWeight:700, marginBottom:'1rem' }}>Return Settings — 7-Day Policy</h2>
      <div style={{ background:'white', border:'1px solid var(--line)', borderRadius:12, padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
          <label>Return Window (days)<input type="number" value={s.returnWindow} onChange={e=>setS({...s, returnWindow:Number(e.target.value)})} style={inputStyle} /></label>
          <label>Restocking Fee (%)<input type="number" value={s.restockingFee} onChange={e=>setS({...s, restockingFee:Number(e.target.value)})} style={inputStyle} /></label>
        </div>
        <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
          {[
            ['enabled','Enable Returns'],
            ['replacementEnabled','Replacement'],
            ['exchangeEnabled','Exchange'],
            ['refundEnabled','Refund'],
            ['videoRequired','Video Required'],
            ['imagesRequired','Images Required'],
            ['pickupAvailable','Pickup Available'],
          ].map(([k,label])=>(
            <label key={k} style={{ display:'flex', gap:'0.4rem', alignItems:'center', fontSize:'0.85rem' }}><input type="checkbox" checked={s[k]} onChange={e=>setS({...s,[k]:e.target.checked})} /> {label}</label>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
          <label>Max Video MB<input type="number" value={s.maxVideoSizeMB} onChange={e=>setS({...s,maxVideoSizeMB:Number(e.target.value)})} style={inputStyle} /></label>
          <label>Max Image MB<input type="number" value={s.maxImageSizeMB} onChange={e=>setS({...s,maxImageSizeMB:Number(e.target.value)})} style={inputStyle} /></label>
          <label>Max Images<input type="number" value={s.maxImages} onChange={e=>setS({...s,maxImages:Number(e.target.value)})} style={inputStyle} /></label>
        </div>
        <label>Non-returnable Categories (comma separated)<input value={(s.nonReturnableCategories||[]).join(', ')} onChange={e=>setS({...s, nonReturnableCategories: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean)})} placeholder="e.g. Innerwear, Earrings" style={inputStyle} /></label>
        <label>Return Conditions<textarea value={s.returnConditions} onChange={e=>setS({...s,returnConditions:e.target.value})} rows={3} style={inputStyle} /></label>
        <label>Refund Method<input value={s.refundMethod} onChange={e=>setS({...s,refundMethod:e.target.value})} style={inputStyle} /></label>
        <label>Instructions<textarea value={s.instructions} onChange={e=>setS({...s,instructions:e.target.value})} rows={2} style={inputStyle} /></label>
        <label>Return Reasons (comma separated)<textarea value={(s.reasons||[]).join(', ')} onChange={e=>setS({...s, reasons: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean)})} rows={2} style={inputStyle} /></label>
        <button onClick={save} disabled={saving} style={{ padding:'0.75rem 1.5rem', background:'var(--maroon)', color:'white', border:'none', borderRadius:8, fontWeight:700, cursor:'pointer', opacity:saving?0.6:1 }}>{saving?'Saving...':'Save Settings'}</button>
      </div>
    </div>
  );
}

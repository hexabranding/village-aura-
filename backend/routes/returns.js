import express from 'express';
import Return from '../models/Return.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ReturnSettings from '../models/ReturnSettings.js';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

const router = express.Router();

function getDeliveredDate(order){
  if(order.deliveredAt) return new Date(order.deliveredAt);
  const deliveredTrack = [...(order.tracking||[])].reverse().find(t=>t.status==='Delivered');
  if(deliveredTrack) return new Date(deliveredTrack.timestamp);
  return null;
}

async function getSettings(){
  let s = await ReturnSettings.findOne();
  if(!s){
    const reasons=['Product damaged','Product broken','Product defective/not working','Wrong product received','Wrong size/colour/variant','Missing item','Missing accessories/parts','Product quality issue','Product does not match description','Product looks different from images','Packaging damaged','Expired product','Product received used/opened','Other'];
    s = await ReturnSettings.create({ reasons });
  }
  return s;
}

router.get('/phone/:phone', async (req, res) => {
  try {
    const returns = await Return.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json(returns);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch returns' }); }
});

router.get('/eligibility/:orderId/:productId', async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const order = await Order.findOne({ orderId: String(orderId).trim().toUpperCase() }) || await Order.findOne({ orderId: String(orderId).trim() });
    if(!order) return res.status(404).json({ eligible:false, reason:'Order not found' });
    if(order.status!=='Delivered') return res.json({ eligible:false, reason:'Order not delivered' });
    const delivered = getDeliveredDate(order);
    if(!delivered) return res.json({ eligible:false, reason:'Delivery date not found' });
    const settings = await getSettings();
    if(!settings.enabled) return res.json({ eligible:false, reason:'Returns disabled' });
    const product = await Product.findById(productId).catch(()=>null);
    if(product && product.returnable===false) return res.json({ eligible:false, reason: product.nonReturnableReason || 'Non-returnable product' });
    if(product && settings.nonReturnableCategories?.includes(product.category)) return res.json({ eligible:false, reason:'Category non-returnable' });
    const windowDays = product?.returnWindow || settings.returnWindow || 7;
    const deadline = order.returnDeadline ? new Date(order.returnDeadline) : new Date(delivered.getTime() + windowDays*24*60*60*1000);
    const now = new Date();
    const diff = Math.ceil((deadline.getTime() - now.getTime())/(24*60*60*1000));
    if(diff<0) return res.json({ eligible:false, reason:'Return window expired', deliveredOn: delivered, returnDeadline: deadline, daysRemaining: 0 });
    const hasItem = order.items.some(i=>i.id===productId);
    if(!hasItem) return res.json({ eligible:false, reason:'Product not in order' });
    const existing = await Return.findOne({ orderId: order.orderId, productId, phone: order.phone, status: { $nin: ['Rejected','Cancelled','Completed'] } });
    if(existing) return res.json({ eligible:false, reason:'Return already requested' });
    res.json({ eligible:true, deliveredOn: delivered, returnDeadline: deadline, daysRemaining: diff, windowDays });
  } catch(e){ res.status(500).json({ error:'Eligibility check failed' }); }
});

router.get('/', auth, async (req, res) => {
  try { const returns = await Return.find().sort({ createdAt: -1 }); res.json(returns); } catch(e){ res.status(500).json({ error:'Failed' }); }
});

router.post('/', async (req, res) => {
  try {
    const { orderId, productId, phone, reason, otherReason, description, qty, images, video, resolution, exchangeVariant, productPrice } = req.body;
    if(!orderId || !productId || !phone || !reason) return res.status(400).json({ error:'orderId, productId, phone, reason required' });
    const order = await Order.findOne({ orderId: String(orderId).trim().toUpperCase() }) || await Order.findOne({ orderId: String(orderId).trim() });
    if(!order) return res.status(404).json({ error:'Order not found' });
    if(String(phone).replace(/[^0-9]/g,'') !== String(order.phone).replace(/[^0-9]/g,'')) return res.status(403).json({ error:'Phone mismatch' });
    if(order.status!=='Delivered') return res.status(400).json({ error:'Returns allowed only for Delivered orders' });
    const item = order.items.find(i=>i.id===productId);
    if(!item) return res.status(400).json({ error:'Product not in order' });
    const reqQty = Number(qty||1);
    if(reqQty<1 || reqQty>item.qty) return res.status(400).json({ error:`Quantity must be 1-${item.qty}` });
    const delivered = getDeliveredDate(order);
    if(!delivered) return res.status(400).json({ error:'Delivery date not available' });
    const settings = await getSettings();
    if(!settings.enabled) return res.status(400).json({ error:'Returns disabled by admin' });
    const product = await Product.findById(productId).catch(()=>null);
    if(product && product.returnable===false) return res.status(400).json({ error: product.nonReturnableReason || 'Product is non-returnable' });
    if(product && settings.nonReturnableCategories?.includes(product.category)) return res.status(400).json({ error:'Category is non-returnable' });
    const windowDays = product?.returnWindow || settings.returnWindow || 7;
    const deadline = order.returnDeadline ? new Date(order.returnDeadline) : new Date(delivered.getTime() + windowDays*24*60*60*1000);
    if(new Date() > deadline) return res.status(400).json({ error:'Return window expired', returnDeadline: deadline });
    const existing = await Return.findOne({ orderId: order.orderId, productId, phone: order.phone, status: { $nin:['Rejected','Cancelled','Completed'] } });
    if(existing) return res.status(409).json({ error:'Return already exists for this product', return: existing });
    if(reason==='Other' && !otherReason?.trim()) return res.status(400).json({ error:'Other reason text required' });
    const videoRequired = product?.unboxingVideoRequired ?? settings.videoRequired;
    if(videoRequired && !video) return res.status(400).json({ error:'Unboxing video required for this return' });
    if(settings.imagesRequired && (!images || images.length===0)) return res.status(400).json({ error:'Product images required' });
    if(images && images.length > (settings.maxImages||5)) return res.status(400).json({ error:`Max ${settings.maxImages} images allowed` });
    const finalResolution = resolution || 'Refund';
    if(finalResolution==='Replacement' && !settings.replacementEnabled && !product?.replacementAvailable) return res.status(400).json({ error:'Replacement not enabled' });
    if(finalResolution==='Exchange' && !settings.exchangeEnabled && !product?.exchangeAvailable) return res.status(400).json({ error:'Exchange not enabled' });
    if(finalResolution==='Refund' && !settings.refundEnabled && !product?.refundAvailable) return res.status(400).json({ error:'Refund not enabled' });
    const refundAmount = product ? product.price * reqQty : 0;
    const returnReq = new Return({
      orderId: order.orderId,
      phone: order.phone,
      productId,
      qty: reqQty,
      reason,
      otherReason: otherReason || '',
      description: description || '',
      images: images || [],
      video: video || '',
      resolution: finalResolution,
      exchangeVariant: exchangeVariant || '',
      status: 'Return Requested',
      tracking: [{ status:'Return Requested', message:`Return requested: ${reason}`, timestamp: new Date() }],
      deliveryDate: delivered,
      returnDeadline: deadline,
      refund: { amount: refundAmount, method: settings.refundMethod, status:'Pending' },
      pickup: { required: settings.pickupAvailable, status:'Pending' },
    });
    await returnReq.save();
    try{ await Notification.create({ type:'return', title:'Return Requested', message:`Return ${returnReq.returnId} for ${productId} order ${order.orderId} Reason:${reason}`, orderId: order.orderId, productId, phone: order.phone }); }catch(_){ }
    res.status(201).json(returnReq);
  } catch(e){ console.error('Create return error',e); res.status(500).json({ error:'Failed to create return' }); }
});

router.put('/:id/cancel', async (req, res) => {
  try{
    const { phone } = req.body;
    const ret = await Return.findById(req.params.id);
    if(!ret) return res.status(404).json({ error:'Not found' });
    if(phone && String(phone).replace(/[^0-9]/g,'') !== String(ret.phone).replace(/[^0-9]/g,'')) return res.status(403).json({ error:'Not owner' });
    if(!['Return Requested','Under Review'].includes(ret.status)) return res.status(400).json({ error:'Cannot cancel at this stage' });
    ret.status='Cancelled';
    ret.tracking.push({ status:'Cancelled', message:'Cancelled by customer', timestamp:new Date() });
    await ret.save();
    res.json(ret);
  }catch(e){ res.status(500).json({ error:'Cancel failed' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    let ret = null;
    try { ret = await Return.findByIdAndDelete(req.params.id); } catch (_) {}
    if (!ret) ret = await Return.findOneAndDelete({ returnId: req.params.id });
    if (!ret) return res.status(404).json({ error: 'Not found: ' + req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (e) { res.status(500).json({ error: 'Delete failed' }); }
});

router.put('/:id/status', auth, async (req, res) => {
  try{
    const { status, adminMessage, pickupDate, pickupCourier, pickupTrackingNo, refundStatus, refundTransactionId, refundAmount, message } = req.body;
    const allowed=['Return Requested','Under Review','More Information Required','Approved','Pickup Scheduled','Picked Up','Product Received','Quality Check','Refund Processing','Replacement Processing','Completed','Rejected','Cancelled'];
    if(!allowed.includes(status)) return res.status(400).json({ error:'Invalid status' });
    const ret = await Return.findById(req.params.id);
    if(!ret) return res.status(404).json({ error:'Not found' });
    if(status==='Rejected' && !adminMessage) return res.status(400).json({ error:'Rejection reason required' });
    ret.status=status;
    if(adminMessage!==undefined) ret.adminMessage=adminMessage;
    if(pickupDate!==undefined) ret.pickup.date=pickupDate;
    if(pickupCourier!==undefined) ret.pickup.courier=pickupCourier;
    if(pickupTrackingNo!==undefined) ret.pickup.trackingNo=pickupTrackingNo;
    if(status==='Pickup Scheduled') ret.pickup.status='Scheduled';
    if(status==='Picked Up') ret.pickup.status='Picked Up';
    if(refundStatus) ret.refund.status=refundStatus;
    if(refundTransactionId) ret.refund.transactionId=refundTransactionId;
    if(refundAmount!==undefined) ret.refund.amount=refundAmount;
    ret.tracking.push({ status, message: message||adminMessage||`Status -> ${status}`, timestamp:new Date() });
    await ret.save();
    try{ await Notification.create({ type:'return', title:`Return ${status}`, message:`Return ${ret.returnId} ${status}: ${adminMessage||message||''}`, orderId:ret.orderId, productId:ret.productId, phone:ret.phone }); }catch(_){ }
    res.json(ret);
  }catch(e){ console.error(e); res.status(500).json({ error:'Update failed' }); }
});

export default router;

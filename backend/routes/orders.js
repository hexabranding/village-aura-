import express from 'express';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

const router = express.Router();

function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'RS-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({
      orderId: order.orderId,
      status: order.status,
      tracking: order.tracking,
      estimatedDelivery: order.estimatedDelivery,
      lastUpdated: order.lastUpdated,
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

router.get('/user/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.put('/cancel/:orderId', async (req, res) => {
  try {
    const { phone, reason, productId } = req.body;
    const oid = String(req.params.orderId || '').trim().toUpperCase();
    const order = await Order.findOne({ orderId: oid }) || await Order.findOne({ orderId: String(req.params.orderId).trim() });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(phone).replace(/[^0-9]/g, '') !== String(order.phone).replace(/[^0-9]/g, '')) return res.status(403).json({ error: 'Phone does not match order' });
    if (['Delivered', 'Cancelled'].includes(order.status) && !productId) return res.status(400).json({ error: `Cannot cancel ${order.status} order` });

    if (productId) {
      const item = order.items.find((i) => i.id === productId && !i.cancelled);
      if (!item) return res.status(400).json({ error: 'Product not found or already cancelled' });
      item.cancelled = true;
      item.cancelReason = reason || 'Cancelled by customer';
      item.cancelledAt = new Date();
      const activeItems = order.items.filter((i) => !i.cancelled);
      if (activeItems.length === 0) {
        order.status = 'Cancelled';
        order.notes = 'All items cancelled by customer';
      }
      order.lastUpdated = new Date().toISOString();
      order.tracking.push({ status: 'Cancelled', timestamp: new Date(), message: `Product ${productId} cancelled: ${reason || 'by customer'}` });
      await order.save();
      try { await Notification.create({ type: 'cancellation', title: 'Product Cancelled', message: `Customer ${order.name} cancelled product ${productId} from order ${order.orderId}. Reason: ${reason || 'N/A'}`, orderId: order.orderId, productId, phone: order.phone }); } catch (_) {}
      res.json(order);
    } else {
      order.status = 'Cancelled';
      order.notes = reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer';
      order.lastUpdated = new Date().toISOString();
      order.tracking.push({ status: 'Cancelled', timestamp: new Date(), message: reason ? `Cancelled: ${reason}` : 'Order cancelled by customer' });
      await order.save();
      try { await Notification.create({ type: 'cancellation', title: 'Order Cancelled', message: `Customer ${order.name} cancelled entire order ${order.orderId}. Reason: ${reason || 'N/A'}`, orderId: order.orderId, phone: order.phone }); } catch (_) {}
      res.json(order);
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

router.post('/', async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      orderId: generateOrderId(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Pending',
      tracking: [{
        status: 'Pending',
        timestamp: new Date(),
        message: 'Order placed successfully',
      }],
    };

    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, message, estimatedDelivery, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (notes !== undefined) order.notes = notes;
    if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery;
    order.lastUpdated = new Date().toISOString();
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      const existing = order.returnDeadline ? new Date(order.returnDeadline) : null;
      if (!existing) {
        const deadline = new Date(order.deliveredAt.getTime() + 7*24*60*60*1000);
        order.returnDeadline = deadline;
      }
    }

    order.tracking.push({
      status,
      timestamp: new Date(),
      message: message || `Status updated to ${status}`,
    });

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    let order = null;
    try { order = await Order.findByIdAndDelete(req.params.id); } catch (_) {}
    if (!order) order = await Order.findOneAndDelete({ orderId: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found: ' + req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;

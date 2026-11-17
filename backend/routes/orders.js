import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';
import { sendOrderConfirmation, sendOrderStatusUpdate, sendPaymentConfirmation } from '../utils/email.js';
import { sendOrderConfirmationSMS, sendOrderStatusSMS } from '../utils/sms.js';
import { sendOrderWhatsApp, sendOrderStatusWhatsApp } from '../utils/whatsapp.js';

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
    const rawId = String(req.params.orderId || '').trim();
    if (!rawId) return res.status(400).json({ error: 'Order ID is required' });
    const order = await Order.findOne({ orderId: { $regex: new RegExp(`^${rawId}$`, 'i') } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({
      orderId: order.orderId,
      status: order.status,
      tracking: order.tracking,
      estimatedDelivery: order.estimatedDelivery,
      lastUpdated: order.lastUpdated,
      date: order.date,
      total: order.total,
      payment: order.payment,
      name: order.name,
      items: order.items || [],
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

router.get('/user/:identifier', async (req, res) => {
  try {
    const rawIdentifier = decodeURIComponent(req.params.identifier || '').trim();
    const queryEmail = String(req.query.email || '').trim().toLowerCase();
    const queryPhone = String(req.query.phone || '').trim();

    const conditions = [];
    const getDigits = (str) => String(str || '').replace(/\D/g, '');

    if (rawIdentifier.includes('@')) {
      conditions.push({ email: rawIdentifier.toLowerCase() });
    } else if (rawIdentifier && rawIdentifier !== 'all') {
      conditions.push({ phone: rawIdentifier });
      const digits = getDigits(rawIdentifier);
      if (digits.length >= 10) {
        const last10 = digits.slice(-10);
        conditions.push({ phone: new RegExp(`${last10}$`) });
      }
    }

    if (queryEmail) {
      conditions.push({ email: queryEmail });
    }

    if (queryPhone) {
      conditions.push({ phone: queryPhone });
      const digits = getDigits(queryPhone);
      if (digits.length >= 10) {
        const last10 = digits.slice(-10);
        conditions.push({ phone: new RegExp(`${last10}$`) });
      }
    }

    if (conditions.length === 0) {
      return res.json([]);
    }

    const orders = await Order.find({ $or: conditions }).sort({ createdAt: -1 });
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

      // Restore quantity
      try {
        const product = await Product.findById(productId);
        if (product) {
          product.quantity = (product.quantity || 0) + (item.qty || 1);
          product.inStock = product.quantity > 0;
          await product.save();
        }
      } catch (_) {}

      const activeItems = order.items.filter((i) => !i.cancelled);
      if (activeItems.length === 0) {
        order.status = 'Cancelled';
        order.notes = 'All items cancelled by customer';
      }
      order.lastUpdated = new Date().toISOString();
      order.tracking.push({ status: 'Cancelled', timestamp: new Date(), message: `Product ${productId} cancelled: ${reason || 'by customer'}` });
      await order.save();
      try { await Notification.create({ type: 'cancellation', title: 'Product Cancelled', message: `Customer ${order.name} cancelled product ${productId} from order ${order.orderId}. Reason: ${reason || 'N/A'}`, orderId: order.orderId, productId, phone: order.phone }); } catch (_) {}
      if (order.status === 'Cancelled') {
        sendOrderStatusWhatsApp(order, 'Cancelled', order.notes).catch((err) => console.error('WhatsApp status send failed:', err.message));
      }
      res.json(order);
    } else {
      order.status = 'Cancelled';
      order.notes = reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer';
      order.lastUpdated = new Date().toISOString();
      order.tracking.push({ status: 'Cancelled', timestamp: new Date(), message: reason ? `Cancelled: ${reason}` : 'Order cancelled by customer' });

      // Restore quantity for all non-cancelled items
      try {
        for (const item of order.items) {
          if (!item.cancelled) {
            const product = await Product.findById(item.id);
            if (product) {
              product.quantity = (product.quantity || 0) + (item.qty || 1);
              product.inStock = product.quantity > 0;
              await product.save();
            }
          }
        }
      } catch (_) {}

      await order.save();
      try { await Notification.create({ type: 'cancellation', title: 'Order Cancelled', message: `Customer ${order.name} cancelled entire order ${order.orderId}. Reason: ${reason || 'N/A'}`, orderId: order.orderId, phone: order.phone }); } catch (_) {}
      sendOrderStatusWhatsApp(order, 'Cancelled', order.notes).catch((err) => console.error('WhatsApp status send failed:', err.message));
      res.json(order);
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { items } = req.body;

    // Validate stock availability for every item first, then decrease quantity
    const productInfo = new Map();
    if (items && items.length > 0) {
      const products = [];
      for (const item of items) {
        const product = await Product.findById(item.id);
        if (!product) continue;
        const currentQty = Number(product.quantity) || 0;
        if (currentQty < item.qty) {
          return res.status(400).json({ error: currentQty <= 0
            ? `"${product.name}" is out of stock.`
            : `Not enough stock for "${product.name}". Only ${currentQty} pieces available.` });
        }
        products.push({ product, currentQty, qty: item.qty });
        productInfo.set(String(item.id), product);
      }
      for (const { product, currentQty, qty } of products) {
        product.quantity = Math.max(0, currentQty - qty);
        product.inStock = product.quantity > 0;
        await product.save();
      }
      // Snapshot name + image so orders never fall back to a raw product ID.
      for (const item of items) {
        const product = productInfo.get(String(item.id));
        if (product) {
          if (!item.name) item.name = product.name || '';
          if (!item.image) {
            item.image = product.variants?.[item.colorIndex || 0]?.images?.[0]
              || product.variants?.[0]?.images?.[0] || '';
          }
        }
      }
    }

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

    // Auto-sync customer's phone if registered account has no phone
    if (order.email && order.phone) {
      try {
        await Customer.updateOne(
          { email: order.email.toLowerCase().trim(), $or: [{ phone: '' }, { phone: { $exists: false } }] },
          { $set: { phone: String(order.phone).trim() } }
        );
      } catch (_) {}
    }

    sendOrderConfirmation(order).catch((err) => console.error('Email send failed:', err.message));
    sendPaymentConfirmation(order).catch((err) => console.error('Payment email send failed:', err.message));
    sendOrderConfirmationSMS(order).catch((err) => console.error('SMS send failed:', err.message));
    sendOrderWhatsApp(order).catch((err) => console.error('WhatsApp send failed:', err.message));

    const productIds = order.items.map((item) => item.id);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = {};
    products.forEach((p) => { productMap[p._id] = p; });

    const itemList = order.items.map((item) => {
      const product = productMap[item.id];
      const name = product ? product.name : item.id;
      return `${name} x${item.qty || 1}`;
    }).join(', ');

    const addressLine = [order.address, order.city, order.state, order.pincode].filter(Boolean).join(', ');
    const waMsg = encodeURIComponent(
      `Hi Village Allure,\n\nOrder Details:\nOrder ID: ${order.orderId}\nItems: ${itemList}\nTotal: ₹${order.total.toLocaleString('en-IN')}\nPayment: ${order.payment}\n\nShipping To:\n${order.name}\n${addressLine}\nPhone: ${order.phone}\n\nPlease confirm my order. Thank you!`
    );
    const businessNumber = (process.env.WHATSAPP_BUSINESS_NUMBER || '916282655422').replace(/\D/g, '');
    const whatsappUrl = businessNumber ? `https://wa.me/${businessNumber}?text=${waMsg}` : '';

    res.status(201).json({ ...order.toJSON(), whatsappUrl });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, message, estimatedDelivery, notes, trackingLink } = req.body;

    let order = null;
    try { order = await Order.findById(req.params.id); } catch (_) {}
    if (!order) order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ensure customer's registered email and phone are populated if missing on the order
    let registeredCustomer = null;
    if (order.email) {
      registeredCustomer = await Customer.findOne({ email: order.email.toLowerCase().trim() }).lean();
    }
    if (!registeredCustomer && order.phone) {
      const last10 = String(order.phone).replace(/\D/g, '').slice(-10);
      if (last10.length === 10) {
        registeredCustomer = await Customer.findOne({ phone: new RegExp(last10 + '$') }).lean();
      }
    }
    if (registeredCustomer) {
      if (!order.email && registeredCustomer.email) {
        order.email = registeredCustomer.email;
      }
      if (!order.phone && registeredCustomer.phone) {
        order.phone = registeredCustomer.phone;
      }
    }

    order.status = status;
    if (notes !== undefined) order.notes = notes;
    if (estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery;
    if (trackingLink !== undefined) order.trackingLink = typeof trackingLink === 'string' ? trackingLink.trim() : trackingLink;
    order.lastUpdated = new Date().toISOString();

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      const existing = order.returnDeadline ? new Date(order.returnDeadline) : null;
      if (!existing) {
        const deadline = new Date(order.deliveredAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        order.returnDeadline = deadline;
      }
    }

    const cleanTrackingLink = order.trackingLink || '';
    const trackingMsg = status === 'Dispatched' && cleanTrackingLink
      ? `Your order ${order.orderId} has been dispatched! Track it here: ${cleanTrackingLink}`
      : message || `Status updated to ${status}`;

    order.tracking.push({
      status,
      timestamp: new Date(),
      message: trackingMsg,
    });

    await order.save();

    const statusMessage = message || `Status updated to ${status}`;

    // 1. Send automated email via SMTP directly to customer's registered email
    let emailResult = { sent: false, to: order.email || '' };
    try {
      emailResult = await sendOrderStatusUpdate(order, status, statusMessage);
    } catch (err) {
      console.error('Email status update failed:', err.message);
    }

    // 2. Send automated WhatsApp if Cloud API is configured
    sendOrderStatusWhatsApp(order, status, statusMessage).catch((err) =>
      console.error('WhatsApp status send failed:', err.message)
    );

    // 3. Send automated SMS if MSG91 is configured
    sendOrderStatusSMS(order, status, cleanTrackingLink).catch((err) =>
      console.error('SMS status send failed:', err.message)
    );

    if (status === 'Dispatched') {
      const notifMsg = `Order ${order.orderId} dispatched for ${order.name}. Phone: ${order.phone}${order.email ? ', Email: ' + order.email : ''}. Tracking: ${cleanTrackingLink || 'N/A'}`;
      await Notification.create({
        type: 'order',
        title: 'Order Dispatched',
        message: notifMsg,
        orderId: order.orderId,
        phone: order.phone,
      }).catch(() => {});

      // Helper to format phone for WhatsApp wa.me link (Indian numbers: 91XXXXXXXXXX)
      const cleanCustomerPhone = (raw) => {
        if (!raw) return '';
        const digits = String(raw).replace(/\D/g, '');
        if (digits.length === 10) return `91${digits}`;
        if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
        if (digits.length === 12 && digits.startsWith('91')) return digits;
        return digits;
      };

      const customerPhone = cleanCustomerPhone(order.phone);
      const customerFirstName = (order.name || '').split(' ')[0] || 'Customer';

      const whatsappText = [
        `Hi ${customerFirstName},`,
        '',
        `Your order *${order.orderId}* from Village Allure has been dispatched! 🚀`,
        cleanTrackingLink ? `\nTrack your shipment here:\n${cleanTrackingLink}` : '',
        order.estimatedDelivery ? `\nEstimated Delivery: ${order.estimatedDelivery}` : '',
        '\nThank you for shopping with Village Allure! We hope you love your purchase.',
        'If you have any questions, reply to this message.',
      ].filter(Boolean).join('\n');

      // TARGET CUSTOMER REGISTERED PHONE NUMBER
      const customerWhatsappUrl = customerPhone
        ? `https://wa.me/${customerPhone}?text=${encodeURIComponent(whatsappText)}`
        : '';

      const businessNumber = (process.env.WHATSAPP_BUSINESS_NUMBER || '916282655422').replace(/\D/g, '');
      const businessWhatsappUrl = businessNumber
        ? `https://wa.me/${businessNumber}?text=${encodeURIComponent(whatsappText)}`
        : '';
      const whatsappBusinessIntentUrl = customerPhone
        ? `whatsapp://send?phone=${customerPhone}&text=${encodeURIComponent(whatsappText)}`
        : '';
      const whatsappWebUrl = customerPhone
        ? `https://web.whatsapp.com/send?phone=${customerPhone}&text=${encodeURIComponent(whatsappText)}`
        : '';

      const emailSubject = encodeURIComponent(`Your Village Allure Order ${order.orderId} has been Dispatched!`);
      const emailBody = encodeURIComponent(
        `Hi ${order.name},\n\nYour order ${order.orderId} has been dispatched!\n\nTrack your shipment here:\n${cleanTrackingLink || 'Tracking link will be updated soon.'}\n\nThank you for shopping with Village Allure!`
      );
      const emailUrl = order.email ? `mailto:${order.email}?subject=${emailSubject}&body=${emailBody}` : '';

      return res.json({
        order,
        whatsappUrl: customerWhatsappUrl,
        customerWhatsappUrl,
        businessWhatsappUrl,
        whatsappBusinessIntentUrl,
        whatsappWebUrl,
        whatsappText,
        businessNumber,
        customerPhone,
        customerEmail: order.email || '',
        emailSent: Boolean(emailResult?.sent),
        emailTo: emailResult?.to || order.email || '',
        emailUrl,
      });
    }

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

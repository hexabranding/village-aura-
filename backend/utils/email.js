import Product from '../models/Product.js';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzeblogq';

export async function sendOrderConfirmation(order) {
  if (!order.email) return;

  const productIds = order.items.map((item) => item.id);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = {};
  products.forEach((p) => { productMap[p._id] = p; });

  const itemNames = order.items.map((item) => {
    const product = productMap[item.id];
    const name = product ? product.name : item.id;
    const qty = item.qty || 1;
    return `${name} x${qty}`;
  }).join(', ');

  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject: `Order Confirmed - ${order.orderId}`,
        _replyto: order.email,
        _template: 'table',
        name: order.name,
        email: order.email,
        phone: order.phone,
        orderId: order.orderId,
        items: itemNames,
        total: `₹${order.total.toLocaleString('en-IN')}`,
        address: `${order.address || ''}, ${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}`,
        payment: order.payment,
        date: order.date,
        type: 'order_confirmation',
      }),
    });
    console.log(`Order confirmation email sent to ${order.email}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error.message);
  }
}

export async function sendOrderStatusUpdate(order, status, message) {
  if (!order.email) return;

  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject: `Order ${order.orderId} - ${status}`,
        _replyto: order.email,
        _template: 'table',
        name: order.name,
        email: order.email,
        phone: order.phone,
        orderId: order.orderId,
        status: status,
        message: message || `Status updated to ${status}`,
        type: 'order_status_update',
      }),
    });
    console.log(`Status update email sent to ${order.email}`);
  } catch (error) {
    console.error('Failed to send status update email:', error.message);
  }
}

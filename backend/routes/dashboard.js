import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find();
    const users = await User.find();

    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = users.length;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    orders.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthlyMap[key]) monthlyMap[key] = 0;
      if (order.status !== 'Cancelled') {
        monthlyMap[key] += order.total;
      }
    });
    const monthlyRevenue = Object.entries(monthlyMap)
      .map(([month, revenue]) => ({ month, revenue }))
      .slice(-6);

    const categoryMap = {};
    for (const order of orders) {
      if (order.status === 'Cancelled') continue;
      for (const item of order.items) {
        const product = products.find((p) => p._id === item.id);
        if (product) {
          const cat = product.category;
          if (!categoryMap[cat]) categoryMap[cat] = 0;
          categoryMap[cat] += product.price * item.qty;
        }
      }
    }
    const categorySales = Object.entries(categoryMap)
      .map(([category, sales]) => ({ category, sales }))
      .sort((a, b) => b.sales - a.sales);

    const statusMap = {};
    orders.forEach((o) => {
      if (!statusMap[o.status]) statusMap[o.status] = 0;
      statusMap[o.status]++;
    });
    const ordersByStatus = Object.entries(statusMap)
      .map(([status, count]) => ({ status, count }));

    const productSalesMap = {};
    for (const order of orders) {
      if (order.status === 'Cancelled') continue;
      for (const item of order.items) {
        const product = products.find((p) => p._id === item.id);
        if (product) {
          if (!productSalesMap[product._id]) {
            productSalesMap[product._id] = {
              name: product.name,
              sales: 0,
              revenue: 0,
            };
          }
          productSalesMap[product._id].sales += item.qty;
          productSalesMap[product._id].revenue += product.price * item.qty;
        }
      }
    }
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((o) => ({
        orderId: o.orderId,
        name: o.name,
        total: o.total,
        status: o.status,
        date: o.date,
      }));

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      monthlyRevenue,
      categorySales,
      recentOrders,
      topProducts,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.get('/sales', auth, async (req, res) => {
  try {
    const { category } = req.query;
    const orders = await Order.find();
    const products = await Product.find();

    const filteredOrders = orders.filter((o) => o.status !== 'Cancelled');

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const dailyMap = {};
    filteredOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      const key = `${d.getDate()} ${d.toLocaleString('en-IN', { month: 'short' })}`;
      if (!dailyMap[key]) dailyMap[key] = { revenue: 0, orders: 0 };
      dailyMap[key].revenue += order.total;
      dailyMap[key].orders++;
    });
    const dailyData = Object.entries(dailyMap)
      .map(([date, data]) => ({ date, ...data }))
      .slice(-14);

    const categoryMap = {};
    for (const order of filteredOrders) {
      for (const item of order.items) {
        const product = products.find((p) => p._id === item.id);
        if (product) {
          if (category && product.category !== category) continue;
          if (!categoryMap[product.category]) categoryMap[product.category] = 0;
          categoryMap[product.category] += product.price * item.qty;
        }
      }
    }
    const categoryData = Object.entries(categoryMap)
      .map(([category, sales]) => ({ category, sales }));

    const paymentMap = {};
    filteredOrders.forEach((o) => {
      if (!paymentMap[o.payment]) paymentMap[o.payment] = 0;
      paymentMap[o.payment]++;
    });
    const paymentData = Object.entries(paymentMap)
      .map(([method, count]) => ({ method, count }));

    const statusCounts = {};
    filteredOrders.forEach((o) => {
      if (!statusCounts[o.status]) statusCounts[o.status] = 0;
      statusCounts[o.status]++;
    });

    const productSalesMap = {};
    for (const order of filteredOrders) {
      for (const item of order.items) {
        const product = products.find((p) => p._id === item.id);
        if (product) {
          if (category && product.category !== category) continue;
          if (!productSalesMap[product._id]) {
            productSalesMap[product._id] = {
              id: product._id,
              name: product.name,
              category: product.category,
              quantity: 0,
              revenue: 0,
            };
          }
          productSalesMap[product._id].quantity += item.qty;
          productSalesMap[product._id].revenue += product.price * item.qty;
        }
      }
    }
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      dailyData,
      categoryData,
      paymentData,
      statusCounts,
      topProducts,
    });
  } catch (error) {
    console.error('Get sales data error:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

export default router;

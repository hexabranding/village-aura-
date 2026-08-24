import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import type { Order } from '../lib/api';
import { getProduct, products as localProducts } from '../data/products';
import type { Product as ProductType } from '../data/products';

interface DailySales {
  day: string;
  revenue: number;
  orders: number;
}

interface ProductSales {
  name: string;
  sales: number;
  revenue: number;
}

interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  dailySales: DailySales[];
  productSales: ProductSales[];
  ordersByStatus: { status: string; count: number }[];
}

export default function AdminSales() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [apiProducts, setApiProducts] = useState<ProductType[]>(localProducts);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30days');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          api.orders.getAll(),
          api.products.getAll().catch(() => []),
        ]);
        setOrders(ordersData);
        if (productsData.length > 0) {
          setApiProducts(productsData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (dateRange === 'all') return true;
    const orderDate = new Date(o.date);
    const now = new Date();
    const daysAgo = dateRange === 'last7days' ? 7 : 30;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return orderDate >= cutoff;
  });

  const stats: SalesStats = {
    totalRevenue: filteredOrders.reduce((sum, o) => sum + o.total, 0),
    totalOrders: filteredOrders.length,
    averageOrderValue: filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, o) => sum + o.total, 0) / filteredOrders.length) : 0,
    dailySales: (() => {
      const dayMap: Record<string, { revenue: number; orders: number }> = {};
      filteredOrders.forEach((o) => {
        const day = o.date;
        if (!dayMap[day]) dayMap[day] = { revenue: 0, orders: 0 };
        dayMap[day].revenue += o.total;
        dayMap[day].orders++;
      });
      return Object.entries(dayMap)
        .map(([day, data]) => ({ day, ...data }))
        .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime())
        .slice(0, 20)
        .reverse();
    })(),
    productSales: (() => {
      const prodMap: Record<string, { sales: number; revenue: number }> = {};
      filteredOrders.forEach((o) => {
        o.items?.forEach((item) => {
          const localProduct = getProduct(item.id);
          const apiProduct = apiProducts.find((p) => p.id === item.id);
          const product = apiProduct || localProduct;
          const key = product?.name || item.id;
          if (!prodMap[key]) prodMap[key] = { sales: 0, revenue: 0 };
          prodMap[key].sales += item.qty;
          prodMap[key].revenue += (product?.price ?? 0) * item.qty;
        });
      });
      return Object.entries(prodMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    })(),
    ordersByStatus: (() => {
      const statusMap: Record<string, number> = {};
      filteredOrders.forEach((o) => {
        statusMap[o.status] = (statusMap[o.status] || 0) + 1;
      });
      return Object.entries(statusMap).map(([status, count]) => ({ status, count }));
    })(),
  };

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="admin-products-spinner" />
        <span>Loading sales data...</span>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: '💰', colorClass: 'maroon' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', colorClass: 'gold' },
    { label: 'Avg. Order Value', value: `₹${stats.averageOrderValue.toLocaleString('en-IN')}`, icon: '📊', colorClass: 'teal' },
  ];

  return (
    <div className="admin-sales-page">
      <div className="admin-products-stats">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="admin-products-stat"
          >
            <div className={`admin-stat-icon ${card.colorClass}`}>{card.icon}</div>
            <div className="admin-products-stat-text">
              <div className="admin-products-stat-value">{card.value}</div>
              <div className="admin-products-stat-label">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="admin-products-toolbar">
        <div className="admin-products-toolbar-left">
          <h3 className="admin-products-toolbar-title">Sales Analytics</h3>
        </div>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="admin-products-filter">
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="alltime">All Time</option>
        </select>
      </div>

      <div className="admin-charts-row">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Daily Revenue</h3>
          {stats.dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.12)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6b1e23" />
                    <stop offset="100%" stopColor="#4a1418" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-chart-empty">No sales data yet</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Top Products by Revenue</h3>
          {stats.productSales.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.productSales}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.12)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="url(#barGold)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a96e" />
                    <stop offset="100%" stopColor="#d4b87a" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-chart-empty">No product sales data yet</div>
          )}
        </motion.div>
      </div>

      <div className="admin-charts-row">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Daily Orders</h3>
          {stats.dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.12)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip formatter={(value) => [value, 'Orders']} />
                <Bar dataKey="orders" fill="url(#barTeal)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1f4741" />
                    <stop offset="100%" stopColor="#163a35" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-chart-empty">No order data yet</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Orders by Status</h3>
          {stats.ordersByStatus.length > 0 ? (
            <div className="admin-sales-status-list">
              {stats.ordersByStatus.map((s) => (
                <div key={s.status} className="admin-sales-status-item">
                  <div className="admin-sales-status-label">
                    <span className={`admin-status-badge ${s.status.toLowerCase().replace(/\s+/g, '-')}`}>{s.status}</span>
                    <span className="admin-sales-status-count">{s.count} orders</span>
                  </div>
                  <div className="admin-sales-status-bar-track">
                    <div
                      className="admin-sales-status-bar-fill"
                      style={{
                        width: `${Math.max(10, (s.count / stats.totalOrders) * 100)}%`,
                        background: `linear-gradient(90deg, var(--maroon), var(--gold))`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-chart-empty">No status data yet</div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="admin-card">
        <h3 className="admin-card-title">Recent Orders</h3>
        {orders.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.orderId}>
                    <td><code className="admin-order-id">{order.orderId}</code></td>
                    <td style={{ fontWeight: 500 }}>{order.name}</td>
                    <td style={{ fontWeight: 600, color: 'var(--maroon)' }}>₹{order.total.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`admin-status-badge ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--ink-soft)' }}>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-chart-empty">No orders yet</div>
        )}
      </motion.div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../lib/api';

const COLORS = ['#6b1e23', '#c9a96e', '#1f4741', '#d4b87a', '#4a1418'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTooltip = (value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatPieLabel = ({ category, percent }: any) => `${category} (${(percent * 100).toFixed(0)}%)`;

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyRevenue: { month: string; revenue: number }[];
  categorySales: { category: string; sales: number }[];
  recentOrders: { orderId: string; name: string; total: number; status: string; date: string }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.dashboard.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-products-loading">
        <div className="admin-products-spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }
  if (!stats) return <div className="admin-products-empty"><h3>Failed to load dashboard</h3></div>;

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: '💰', colorClass: 'maroon' },
    { label: 'Total Orders', value: stats.totalOrders, icon: '📦', colorClass: 'gold' },
    { label: 'Total Products', value: stats.totalProducts, icon: '🧵', colorClass: 'teal' },
    { label: 'Customers', value: stats.totalCustomers, icon: '👥', colorClass: 'green' },
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="admin-products-stats">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`admin-products-stat ${card.colorClass === 'green' ? 'green' : ''}`}
          >
            <div className={`admin-stat-icon ${card.colorClass}`}>{card.icon}</div>
            <div className="admin-products-stat-text">
              <div className="admin-products-stat-value">{card.value}</div>
              <div className="admin-products-stat-label">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="admin-charts-row">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Monthly Revenue</h3>
          {stats.monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.12)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip formatter={formatTooltip} />
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
            <div className="admin-chart-empty">No revenue data yet</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Sales by Category</h3>
          {stats.categorySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.categorySales} dataKey="sales" nameKey="category" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label={formatPieLabel}>
                  {stats.categorySales.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-chart-empty">No category data yet</div>
          )}
        </motion.div>
      </div>

      <div className="admin-charts-row">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Orders by Status</h3>
          {stats.ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.ordersByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.12)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 11, fill: '#888' }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="url(#barGold)" radius={[0, 8, 8, 0]} />
                <defs>
                  <linearGradient id="barGold" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#c9a96e" />
                    <stop offset="100%" stopColor="#d4b87a" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-chart-empty">No order status data yet</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Top Products</h3>
          {stats.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.12)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip formatter={formatTooltip} />
                <Bar dataKey="revenue" fill="url(#barTeal)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1f4741" />
                    <stop offset="100%" stopColor="#163a35" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-chart-empty">No product data yet</div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="admin-card">
        <h3 className="admin-card-title">Recent Orders</h3>
        {stats.recentOrders.length > 0 ? (
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
                {stats.recentOrders.map((order) => (
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

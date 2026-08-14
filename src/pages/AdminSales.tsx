import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { api } from '../lib/api';

const COLORS = ['#6b1e23', '#c9a96e', '#1f4741', '#d4b87a', '#4a1418', '#e8c4c4'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatRevenue = (value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatPieLabel = ({ category, percent }: any) => `${category} (${(percent * 100).toFixed(0)}%)`;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatStatusPieLabel = ({ status, percent }: any) => `${status} (${(percent * 100).toFixed(0)}%)`;

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  dailyData: { date: string; revenue: number; orders: number }[];
  categoryData: { category: string; sales: number }[];
  paymentData: { method: string; count: number }[];
  statusCounts: Record<string, number>;
  topProducts: { id: string; name: string; category: string; quantity: number; revenue: number }[];
}

export default function AdminSales() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadSales = async (category?: string) => {
    try {
      const data = await api.dashboard.getSales(category);
      setSalesData(data);
    } catch (error) {
      console.error('Failed to load sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    loadSales(cat === 'All' ? undefined : cat);
  };

  if (loading) return <div className="admin-empty">Loading sales data...</div>;
  if (!salesData) return <div className="admin-empty">Failed to load sales data</div>;

  return (
    <div>
      <div className="admin-stats-grid">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#6b1e23' }}>💰</div>
          <div>
            <div className="admin-stat-value">₹{salesData.totalRevenue.toLocaleString('en-IN')}</div>
            <div className="admin-stat-label">Total Revenue</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#c9a96e' }}>📦</div>
          <div>
            <div className="admin-stat-value">{salesData.totalOrders}</div>
            <div className="admin-stat-label">Total Orders</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#1f4741' }}>📊</div>
          <div>
            <div className="admin-stat-value">₹{Math.round(salesData.avgOrderValue).toLocaleString('en-IN')}</div>
            <div className="admin-stat-label">Avg. Order Value</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#d4b87a' }}>🧵</div>
          <div>
            <div className="admin-stat-value">{salesData.topProducts.length}</div>
            <div className="admin-stat-label">Products Sold</div>
          </div>
        </motion.div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <select value={categoryFilter} onChange={(e) => handleCategoryChange(e.target.value)} className="admin-select">
            <option value="All">All Categories</option>
            <option value="Sarees">Sarees</option>
            <option value="Jewellery">Jewellery</option>
            <option value="Bags">Bags</option>
            <option value="Unstitched Suit Sets">Suit Sets</option>
          </select>
        </div>
      </div>

      <div className="admin-charts-row">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Daily Revenue</h3>
          {salesData.dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.15)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#555' }} />
                <YAxis tick={{ fontSize: 12, fill: '#555' }} />
                <Tooltip formatter={formatRevenue} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#6b1e23" strokeWidth={2} dot={{ fill: '#6b1e23' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty">No daily data available</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Category Revenue</h3>
          {salesData.categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={salesData.categoryData} dataKey="sales" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={formatPieLabel}>
                  {salesData.categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty">No category data available</div>
          )}
        </motion.div>
      </div>

      <div className="admin-charts-row">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Payment Methods</h3>
          {salesData.paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesData.paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.15)" />
                <XAxis dataKey="method" tick={{ fontSize: 11, fill: '#555' }} />
                <YAxis tick={{ fontSize: 12, fill: '#555' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#c9a96e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty">No payment data available</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="admin-chart-card">
          <h3 className="admin-chart-title">Order Status Distribution</h3>
          {Object.keys(salesData.statusCounts).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(salesData.statusCounts).map(([status, count]) => ({ status, count }))}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={formatStatusPieLabel}
                >
                  {Object.keys(salesData.statusCounts).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty">No status data available</div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="admin-card">
        <h3 className="admin-card-title">Top Selling Products</h3>
        {salesData.topProducts.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Qty Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesData.topProducts.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.quantity}</td>
                    <td style={{ fontWeight: 600, color: 'var(--maroon)' }}>₹{p.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">No sales data available</div>
        )}
      </motion.div>
    </div>
  );
}

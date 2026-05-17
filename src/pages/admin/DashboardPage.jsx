import { useState, useEffect } from 'react';
import { productApi, orderApi } from '../../lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodResult, orderResult] = await Promise.all([
          productApi.search({ size: 1 }),
          orderApi.search({ size: 5 }),
        ]);
        setStats({
          products: prodResult.paging?.total_items || 0,
          orders: orderResult.data || [],
          totalOrders: orderResult.paging?.total_item || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stat-grid mb-8">
        <div className="stat-card">
          <p className="stat-label">Total Products</p>
          <p className="stat-value">{stats.products}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Orders</p>
          <p className="stat-value">{stats.totalOrders || 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Recent Orders</p>
          <p className="stat-value">{stats.orders.length}</p>
        </div>
      </div>

      {/* Recent orders table */}
      <h2 className="text-headline-md mb-4">RECENT ORDERS</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAYMENT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {stats.orders.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#999' }}>No orders yet</td></tr>
            ) : (
              stats.orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{order.id?.substring(0, 20)}...</td>
                  <td>{order.user?.name}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                  <td className="font-bold">
                    Rp {((order.total_price || 0) + (order.shipping_cost || 0)).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <span className={`badge ${order.payment_status === 'SUCCESS' ? 'badge-success' : order.payment_status === 'PENDING' ? 'badge-warning' : 'badge-error'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${order.status === 'DELIVERED' ? 'badge-success' : 'badge-neutral'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

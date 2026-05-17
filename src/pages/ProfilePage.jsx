import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../lib/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [paging, setPaging] = useState({ page: 1, total_page: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const result = await orderApi.search({ page, size: 10 });
        setOrders(result.data || []);
        setPaging(result.paging || { page: 1, total_page: 1 });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const getStatusBadge = (status) => {
    const map = {
      SUCCESS: 'badge-success',
      PENDING: 'badge-warning',
      FAILED: 'badge-error',
      DELIVERED: 'badge-success',
      SHIPPED: 'badge-neutral',
      CANCELLED: 'badge-error',
    };
    return map[status] || 'badge-neutral';
  };

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile info */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="profile-details">
            <h1 className="text-headline-lg">{user?.name}</h1>
            <p className="text-muted">{user?.email}</p>
            {user?.phone && <p className="text-muted">{user.phone}</p>}
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>LOGOUT</button>
        </div>

        {/* Order history */}
        <section className="profile-section">
          <h2 className="text-headline-md mb-6">ORDER HISTORY</h2>

          {loading ? (
            <div className="loading-screen"><div className="spinner spinner-lg"></div></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <p className="text-muted">No orders yet.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ORDER ID</th>
                      <th>DATE</th>
                      <th>ITEMS</th>
                      <th>TOTAL</th>
                      <th>PAYMENT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{order.id?.substring(0, 20)}...</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                        <td>
                          {order.orderItems?.map((item, i) => (
                            <div key={i} className="text-label-sm">
                              {item.productVariant?.product?.name} ({item.productVariant?.color?.name}/{item.productVariant?.size?.label}) ×{item.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="font-bold">
                          Rp {((order.total_price || 0) + (order.shipping_cost || 0)).toLocaleString('id-ID')}
                        </td>
                        <td><span className={`badge ${getStatusBadge(order.payment_status)}`}>{order.payment_status}</span></td>
                        <td><span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {paging.total_page > 1 && (
                <div className="pagination">
                  <button disabled={page <= 1} onClick={() => setPage(page - 1)}>←</button>
                  {Array.from({ length: paging.total_page }, (_, i) => i + 1).map((p) => (
                    <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
                  ))}
                  <button disabled={page >= paging.total_page} onClick={() => setPage(page + 1)}>→</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

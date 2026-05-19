import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../lib/api';

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
      SUCCESS: 'bg-success text-on-primary',
      PENDING: 'bg-warning text-surface',
      FAILED: 'bg-error text-on-primary',
      DELIVERED: 'bg-success text-on-primary',
      SHIPPED: 'bg-surface-container-highest text-on-surface',
      CANCELLED: 'bg-error text-on-primary',
    };
    return map[status] || 'bg-border text-on-surface';
  };

  return (
    <div className="w-full bg-background min-h-screen pt-10 pb-20">
      <div className="container mx-auto px-6">
        
        {/* Profile info */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 p-8 border-4 border-primary bg-surface-container-lowest mb-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 bg-primary text-on-primary flex items-center justify-center text-5xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{user?.name}</h1>
              <p className="font-bold text-sm tracking-widest uppercase text-text-muted">{user?.email}</p>
              {user?.phone && <p className="font-bold text-sm tracking-widest uppercase text-text-muted">{user.phone}</p>}
            </div>
          </div>
          <button 
            className="btn btn-outline border-2 border-primary py-3 px-8 font-black tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1" 
            onClick={handleLogout}
          >
            LOGOUT
          </button>
        </div>

        {/* Order history */}
        <section className="flex flex-col gap-6">
          <h2 className="text-3xl font-black uppercase tracking-tighter border-b-4 border-primary pb-4 mb-2">ORDER HISTORY</h2>

          {loading ? (
             <div className="flex justify-center p-12"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>
          ) : orders.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-border text-center">
              <p className="font-bold text-lg tracking-widest uppercase text-text-muted">No orders yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="overflow-x-auto border-4 border-primary bg-surface-container-lowest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-primary text-on-primary font-black text-sm tracking-widest uppercase">
                      <th className="p-4 border-b-4 border-r-4 border-primary/20">ORDER ID</th>
                      <th className="p-4 border-b-4 border-r-4 border-primary/20">DATE</th>
                      <th className="p-4 border-b-4 border-r-4 border-primary/20">ITEMS</th>
                      <th className="p-4 border-b-4 border-r-4 border-primary/20">TOTAL</th>
                      <th className="p-4 border-b-4 border-r-4 border-primary/20">PAYMENT</th>
                      <th className="p-4 border-b-4 border-primary/20">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order.id} className={`border-b-2 border-border ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'} hover:bg-primary/5 transition-colors`}>
                        <td className="p-4 border-r-2 border-border font-mono text-xs font-bold">{order.id?.substring(0, 20)}...</td>
                        <td className="p-4 border-r-2 border-border font-bold text-sm tracking-wider uppercase">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="p-4 border-r-2 border-border">
                          {order.orderItems?.map((item, i) => (
                            <div key={i} className="font-bold text-xs tracking-wider uppercase mb-1 last:mb-0">
                              {item.productVariant?.product?.name} ({item.productVariant?.color?.name}/{item.productVariant?.size?.label}) ×{item.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="p-4 border-r-2 border-border font-black text-sm tracking-tighter">
                          Rp {((order.total_price || 0) + (order.shipping_cost || 0)).toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 border-r-2 border-border">
                          <span className={`inline-block px-2 py-1 text-[10px] font-black tracking-widest uppercase ${getStatusBadge(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 text-[10px] font-black tracking-widest uppercase ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {paging.total_page > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button 
                    disabled={page <= 1} 
                    onClick={() => setPage(page - 1)}
                    className="w-10 h-10 flex items-center justify-center border-2 border-primary font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    ←
                  </button>
                  {Array.from({ length: paging.total_page }, (_, i) => i + 1).map((p) => (
                    <button 
                      key={p} 
                      className={`w-10 h-10 flex items-center justify-center border-2 border-primary font-black transition-colors ${p === page ? 'bg-primary text-on-primary' : 'hover:bg-primary/10'}`} 
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button 
                    disabled={page >= paging.total_page} 
                    onClick={() => setPage(page + 1)}
                    className="w-10 h-10 flex items-center justify-center border-2 border-primary font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

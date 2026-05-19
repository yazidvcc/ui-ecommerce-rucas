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
     return <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;
  }

  const getStatusBadge = (status) => {
    const map = {
      SUCCESS: 'bg-success text-on-primary',
      PENDING: 'bg-warning text-primary',
      FAILED: 'bg-error text-on-primary',
      DELIVERED: 'bg-success text-on-primary',
      SHIPPED: 'bg-surface-container-highest text-on-surface',
      CANCELLED: 'bg-error text-on-primary',
    };
    return map[status] || 'bg-border text-on-surface';
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-end border-b-4 border-primary pb-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">DASHBOARD</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-4 border-primary bg-surface-container-lowest p-6 flex flex-col gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
          <p className="font-bold text-sm tracking-widest uppercase text-text-muted">Total Products</p>
          <p className="text-5xl font-black tracking-tighter">{stats.products}</p>
        </div>
        <div className="border-4 border-primary bg-surface-container-lowest p-6 flex flex-col gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
          <p className="font-bold text-sm tracking-widest uppercase text-text-muted">Total Orders</p>
          <p className="text-5xl font-black tracking-tighter">{stats.totalOrders || 0}</p>
        </div>
        <div className="border-4 border-primary bg-surface-container-lowest p-6 flex flex-col gap-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
          <p className="font-bold text-sm tracking-widest uppercase text-text-muted">Recent Orders</p>
          <p className="text-5xl font-black tracking-tighter">{stats.orders.length}</p>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-black uppercase tracking-tighter border-b-2 border-primary pb-2">RECENT ORDERS</h2>
        <div className="overflow-x-auto border-4 border-primary bg-surface-container-lowest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-primary text-on-primary font-black text-sm tracking-widest uppercase">
                <th className="p-4 border-b-4 border-r-4 border-primary/20">ORDER ID</th>
                <th className="p-4 border-b-4 border-r-4 border-primary/20">CUSTOMER</th>
                <th className="p-4 border-b-4 border-r-4 border-primary/20">DATE</th>
                <th className="p-4 border-b-4 border-r-4 border-primary/20">TOTAL</th>
                <th className="p-4 border-b-4 border-r-4 border-primary/20">PAYMENT</th>
                <th className="p-4 border-b-4 border-primary/20">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {stats.orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center font-bold text-lg tracking-widest uppercase text-text-muted border-dashed border-2 border-border m-4">
                    No orders yet
                  </td>
                </tr>
              ) : (
                stats.orders.map((order, index) => (
                  <tr key={order.id} className={`border-b-2 border-border ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'} hover:bg-primary/5 transition-colors`}>
                    <td className="p-4 border-r-2 border-border font-mono text-xs font-bold">{order.id?.substring(0, 20)}...</td>
                    <td className="p-4 border-r-2 border-border font-bold text-sm tracking-wider uppercase">{order.user?.name}</td>
                    <td className="p-4 border-r-2 border-border font-bold text-sm tracking-wider uppercase">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

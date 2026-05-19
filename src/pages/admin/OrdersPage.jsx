import { useState, useEffect } from 'react';
import { orderApi, adminOrderApi } from '../../lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [paging, setPaging] = useState({ page: 1, total_page: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    order_id: '',
    user_email: '',
    shipping_name: '',
    status: '',
    payment_status: '',
    tracking_number: '',
    date_start: '',
    date_end: ''
  });

  const handleViewDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      const result = await orderApi.get(orderId);
      setSelectedOrder(result.data || result);
      setShowModal(true);
    } catch (err) {
      alert(err.message || 'Failed to fetch order details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchOrders = async (currentPage = page, currentFilters = filters) => {
    setLoading(true);
    try {
      const searchParams = { page: currentPage, size: 15 };
      if (currentFilters.order_id) searchParams.order_id = currentFilters.order_id;
      if (currentFilters.user_email) searchParams.user_email = currentFilters.user_email;
      if (currentFilters.shipping_name) searchParams.shipping_name = currentFilters.shipping_name;
      if (currentFilters.status) searchParams.status = currentFilters.status;
      if (currentFilters.payment_status) searchParams.payment_status = currentFilters.payment_status;
      if (currentFilters.tracking_number) searchParams.tracking_number = currentFilters.tracking_number;
      if (currentFilters.date_start) searchParams.date_start = currentFilters.date_start;
      if (currentFilters.date_end) searchParams.date_end = currentFilters.date_end;

      const result = await orderApi.search(searchParams);
      setOrders(result.data || []);
      setPaging(result.paging || { page: 1, total_page: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(page, filters); }, [page]);

  const handleApplyFilters = () => {
    setPage(1);
    fetchOrders(1, filters);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      order_id: '',
      user_email: '',
      shipping_name: '',
      status: '',
      payment_status: '',
      tracking_number: '',
      date_start: '',
      date_end: ''
    };
    setFilters(emptyFilters);
    setPage(1);
    fetchOrders(1, emptyFilters);
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order? (Only FAILED orders can be deleted)')) return;
    try {
      await adminOrderApi.remove(orderId);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to delete. Only orders with FAILED payment status can be deleted.');
    }
  };

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
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Orders</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'HIDE FILTERS' : 'SHOW FILTERS'}
        </button>
      </div>

      {showFilters && (
        <div className="border-4 border-primary bg-surface-container-lowest p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
          <h2 className="text-lg font-black uppercase tracking-widest border-b-2 border-border pb-2">Filter Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Order ID" 
              className="input-field" 
              value={filters.order_id} 
              onChange={e => setFilters({...filters, order_id: e.target.value})}
            />
            <input 
              type="email" 
              placeholder="User Email" 
              className="input-field" 
              value={filters.user_email} 
              onChange={e => setFilters({...filters, user_email: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Courier Name (e.g. jne)" 
              className="input-field" 
              value={filters.shipping_name} 
              onChange={e => setFilters({...filters, shipping_name: e.target.value})}
            />
            <select 
              className="input-field" 
              value={filters.status} 
              onChange={e => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <select 
              className="input-field" 
              value={filters.payment_status} 
              onChange={e => setFilters({...filters, payment_status: e.target.value})}
            >
              <option value="">All Payment Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
            </select>
            <input 
              type="text" 
              placeholder="Tracking Number" 
              className="input-field" 
              value={filters.tracking_number} 
              onChange={e => setFilters({...filters, tracking_number: e.target.value})}
            />
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold tracking-widest uppercase text-text-muted">Start Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={filters.date_start} 
                onChange={e => setFilters({...filters, date_start: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold tracking-widest uppercase text-text-muted">End Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={filters.date_end} 
                onChange={e => setFilters({...filters, date_end: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-2">
            <button className="btn btn-outline" onClick={handleResetFilters}>
              RESET
            </button>
            <button className="btn btn-primary" onClick={handleApplyFilters}>
              APPLY FILTERS
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="overflow-x-auto border-4 border-primary bg-surface-container-lowest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-primary text-on-primary font-black text-sm tracking-widest uppercase">
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">ORDER ID</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">CUSTOMER</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">DATE</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">ITEMS</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">TOTAL</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">PAYMENT</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">STATUS</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">SHIPPING</th>
                  <th className="p-4 border-b-4 border-primary/20">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center font-bold text-lg tracking-widest uppercase text-text-muted border-dashed border-2 border-border m-4">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order.id} className={`border-b-2 border-border ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'} hover:bg-primary/5 transition-colors`}>
                      <td className="p-4 border-r-2 border-border font-mono text-xs font-bold max-w-[160px] truncate" title={order.id}>
                        {order.id?.substring(0, 20)}...
                      </td>
                      <td className="p-4 border-r-2 border-border">
                        <div className="font-bold text-sm tracking-wider uppercase">{order.user?.name}</div>
                        <div className="font-bold text-[10px] tracking-widest uppercase text-text-muted">{order.user?.email}</div>
                      </td>
                      <td className="p-4 border-r-2 border-border font-bold text-sm tracking-wider uppercase">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 border-r-2 border-border">
                        {order.orderItems?.map((item, i) => (
                          <div key={i} className="font-bold text-[10px] tracking-widest uppercase whitespace-nowrap">
                            {item.productVariant?.product?.name} ×{item.quantity}
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
                      <td className="p-4 border-r-2 border-border">
                        <span className={`inline-block px-2 py-1 text-[10px] font-black tracking-widest uppercase ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 border-r-2 border-border font-bold text-[10px] tracking-widest uppercase">{order.shipping_name + "-" + order.shipping_service || '-'}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button className="inline-block px-3 py-1 border-2 border-primary bg-surface font-black text-xs tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50" onClick={() => handleViewDetails(order.id)} disabled={loadingDetails}>
                            DETAILS
                          </button>
                          {order.payment_status === 'FAILED' && (
                            <button className="inline-block px-3 py-1 border-2 border-error bg-error text-on-primary font-black text-xs tracking-widest uppercase hover:bg-on-primary hover:text-error transition-colors" onClick={() => handleDelete(order.id)}>DELETE</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border-4 border-primary w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            
            {/* Header */}
            <div className="sticky top-0 bg-surface-container-lowest z-10 flex justify-between items-center p-6 sm:p-8 border-b-4 border-primary">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">ORDER #{selectedOrder.id?.substring(0,8)}</h2>
                <span className="font-bold text-xs tracking-widest uppercase text-text-muted">{new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</span>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center border-2 border-primary font-black text-xl hover:bg-primary hover:text-on-primary transition-colors">✕</button>
            </div>

            <div className="p-6 sm:p-8">
              
              {/* Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="border-4 border-primary p-6 bg-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="font-bold text-xs tracking-widest uppercase text-text-muted mb-2">ORDER STATUS</div>
                  <span className={`inline-block px-3 py-1 text-sm font-black tracking-widest uppercase border-2 border-primary ${getStatusBadge(selectedOrder.status)}`}>{selectedOrder.status}</span>
                </div>
                <div className="border-4 border-primary p-6 bg-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="font-bold text-xs tracking-widest uppercase text-text-muted mb-2">PAYMENT STATUS</div>
                  <span className={`inline-block px-3 py-1 text-sm font-black tracking-widest uppercase border-2 border-primary ${getStatusBadge(selectedOrder.payment_status)}`}>{selectedOrder.payment_status}</span>
                  <div className="mt-4 font-bold text-xs tracking-widest uppercase text-text-muted">VIA: <span className="text-on-surface">{selectedOrder.payment_type || '-'}</span></div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="flex flex-col gap-4 border-4 border-primary p-6 bg-surface-container-lowest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-lg font-black uppercase tracking-tighter border-b-2 border-border pb-2">CUSTOMER INFO</h3>
                  <div>
                    <div className="font-bold text-[10px] tracking-widest uppercase text-text-muted mb-1">NAME</div>
                    <div className="font-black text-sm tracking-widest uppercase">{selectedOrder.user?.name}</div>
                  </div>
                  <div>
                    <div className="font-bold text-[10px] tracking-widest uppercase text-text-muted mb-1">EMAIL & PHONE</div>
                    <div className="font-bold text-sm tracking-wider uppercase leading-relaxed">{selectedOrder.user?.email} <br/> {selectedOrder.user?.phone}</div>
                  </div>
                  <div>
                    <div className="font-bold text-[10px] tracking-widest uppercase text-text-muted mb-1">SHIPPING ADDRESS</div>
                    <div className="font-bold text-sm tracking-wider uppercase leading-relaxed">{selectedOrder.address}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-4 border-primary p-6 bg-surface-container-lowest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-lg font-black uppercase tracking-tighter border-b-2 border-border pb-2">SHIPPING DETAILS</h3>
                  <div>
                    <div className="font-bold text-[10px] tracking-widest uppercase text-text-muted mb-1">COURIER</div>
                    <div className="font-black text-sm tracking-widest uppercase">{selectedOrder.shipping_name} - {selectedOrder.shipping_service}</div>
                  </div>
                  <div>
                    <div className="font-bold text-[10px] tracking-widest uppercase text-text-muted mb-1">SERVICE DESCRIPTION</div>
                    <div className="font-bold text-sm tracking-wider uppercase leading-relaxed">{selectedOrder.shipping_description || '-'} (ETD: {selectedOrder.etd || '-'})</div>
                  </div>
                  <div>
                    <div className="font-bold text-[10px] tracking-widest uppercase text-text-muted mb-1">TRACKING NUMBER</div>
                    <div className={`font-black text-sm tracking-widest uppercase ${selectedOrder.tracking_number ? 'text-on-surface' : 'text-text-muted'}`}>{selectedOrder.tracking_number || 'Not yet updated'}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-4 border-primary bg-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
                <h3 className="text-lg font-black uppercase tracking-tighter border-b-4 border-primary p-4 bg-surface-container-lowest">ORDER ITEMS</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[400px]">
                    <thead>
                      <tr className="bg-primary/5 font-black text-xs tracking-widest uppercase border-b-4 border-primary">
                        <th className="p-4 border-r-4 border-primary">PRODUCT</th>
                        <th className="p-4 text-center w-24">QTY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems?.map((item, i) => (
                        <tr key={i} className="border-b-2 border-border last:border-b-0 hover:bg-primary/5 transition-colors">
                          <td className="p-4 border-r-4 border-border">
                            <div className="font-black text-sm tracking-widest uppercase mb-1">{item.productVariant?.product?.name}</div>
                            <div className="font-bold text-[10px] tracking-widest uppercase text-text-muted flex gap-2">
                              <span>Color: <span className="text-on-surface">{item.productVariant?.color?.name}</span></span>
                              <span>|</span>
                              <span>Size: <span className="text-on-surface">{item.productVariant?.size?.label}</span></span>
                            </div>
                          </td>
                          <td className="p-4 text-center font-black text-lg">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-4 border-primary bg-surface-container-lowest p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ml-auto max-w-sm">
                <div className="flex justify-between items-center mb-4 font-bold text-sm tracking-widest uppercase">
                  <span className="text-text-muted">Subtotal</span>
                  <span>Rp {(selectedOrder.total_price || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center mb-6 font-bold text-sm tracking-widest uppercase">
                  <span className="text-text-muted">Shipping</span>
                  <span>Rp {(selectedOrder.shipping_cost || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-4 border-primary text-xl font-black tracking-tighter uppercase">
                  <span>TOTAL</span>
                  <span>Rp {((selectedOrder.total_price || 0) + (selectedOrder.shipping_cost || 0)).toLocaleString('id-ID')}</span>
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="sticky bottom-0 bg-surface-container-lowest z-10 flex justify-end p-6 border-t-4 border-primary">
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-primary py-3 px-8 text-sm font-black tracking-widest uppercase border-2 border-primary hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await orderApi.search({ page, size: 15 });
      setOrders(result.data || []);
      setPaging(result.paging || { page: 1, total_page: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page]);

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
      SUCCESS: 'badge-success', PENDING: 'badge-warning', FAILED: 'badge-error',
      DELIVERED: 'badge-success', SHIPPED: 'badge-neutral', CANCELLED: 'badge-error',
    };
    return map[status] || 'badge-neutral';
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Orders</h1>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner spinner-lg"></div></div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                  <th>SHIPPING</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#999' }}>No orders found</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.id?.substring(0, 20)}...
                      </td>
                      <td>
                        <div className="font-bold">{order.user?.name}</div>
                        <div className="text-label-sm text-muted">{order.user?.email}</div>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                      <td>
                        {order.orderItems?.map((item, i) => (
                          <div key={i} className="text-label-sm">
                            {item.productVariant?.product?.name} ×{item.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="font-bold">
                        Rp {((order.total_price || 0) + (order.shipping_cost || 0)).toLocaleString('id-ID')}
                      </td>
                      <td><span className={`badge ${getStatusBadge(order.payment_status)}`}>{order.payment_status}</span></td>
                      <td><span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span></td>
                      <td className="text-label-sm">{order.shipping_service || '-'}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleViewDetails(order.id)} disabled={loadingDetails}>
                          DETAILS
                        </button>
                        {order.payment_status === 'FAILED' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(order.id)}>DELETE</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
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

      {showModal && selectedOrder && (
        <div className="modal-backdrop" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" style={{ maxWidth: '720px', width: '90%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '0', border: '2px solid #000', padding: '0', backgroundColor: '#fff' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '2px solid #000', backgroundColor: '#f8f8f8' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>ORDER #{selectedOrder.id?.substring(0,8)}</h2>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>{new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</span>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ padding: '32px' }}>
              
              {/* Status Row */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ flex: 1, padding: '16px', border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', letterSpacing: '1px', marginBottom: '8px' }}>ORDER STATUS</div>
                  <span className={`badge ${getStatusBadge(selectedOrder.status)}`} style={{ fontSize: '14px', padding: '6px 12px' }}>{selectedOrder.status}</span>
                </div>
                <div style={{ flex: 1, padding: '16px', border: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', letterSpacing: '1px', marginBottom: '8px' }}>PAYMENT STATUS</div>
                  <span className={`badge ${getStatusBadge(selectedOrder.payment_status)}`} style={{ fontSize: '14px', padding: '6px 12px' }}>{selectedOrder.payment_status}</span>
                  <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold' }}>VIA: {selectedOrder.payment_type || '-'}</div>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '900', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>CUSTOMER INFO</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', letterSpacing: '0.5px' }}>NAME</div>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{selectedOrder.user?.name}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', letterSpacing: '0.5px' }}>EMAIL & PHONE</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{selectedOrder.user?.email} <br/> {selectedOrder.user?.phone}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', letterSpacing: '0.5px' }}>SHIPPING ADDRESS</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', lineHeight: '1.5' }}>{selectedOrder.address}</div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '900', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>SHIPPING DETAILS</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', letterSpacing: '0.5px' }}>COURIER</div>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{selectedOrder.shipping_name} - {selectedOrder.shipping_service}</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', letterSpacing: '0.5px' }}>SERVICE DESCRIPTION</div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{selectedOrder.shipping_description || '-'} (ETD: {selectedOrder.etd || '-'})</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold', letterSpacing: '0.5px' }}>TRACKING NUMBER</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: selectedOrder.tracking_number ? '#000' : '#999' }}>{selectedOrder.tracking_number || 'Not yet updated'}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <h3 style={{ fontSize: '14px', fontWeight: '900', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>ORDER ITEMS</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', border: '1px solid #e0e0e0' }}>
                <thead style={{ backgroundColor: '#f8f8f8', borderBottom: '2px solid #000' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold' }}>PRODUCT</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>QTY</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.orderItems?.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{item.productVariant?.product?.name}</div>
                        <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                          Color: <span style={{ color: '#000' }}>{item.productVariant?.color?.name}</span> | 
                          Size: <span style={{ color: '#000' }}>{item.productVariant?.size?.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', fontSize: '14px' }}>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ backgroundColor: '#f8f8f8', padding: '24px', border: '1px solid #e0e0e0', marginLeft: 'auto', width: '100%', maxWidth: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#666', fontWeight: 'bold' }}>Subtotal</span>
                  <span style={{ fontWeight: '700' }}>Rp {(selectedOrder.total_price || 0).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px' }}>
                  <span style={{ color: '#666', fontWeight: 'bold' }}>Shipping</span>
                  <span style={{ fontWeight: '700' }}>Rp {(selectedOrder.shipping_cost || 0).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '16px', fontSize: '16px' }}>
                  <span style={{ fontWeight: '900' }}>TOTAL</span>
                  <span style={{ fontWeight: '900' }}>Rp {((selectedOrder.total_price || 0) + (selectedOrder.shipping_cost || 0)).toLocaleString('id-ID')}</span>
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid #e0e0e0', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '12px 32px', backgroundColor: '#000', color: '#fff', border: 'none', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer' }}
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

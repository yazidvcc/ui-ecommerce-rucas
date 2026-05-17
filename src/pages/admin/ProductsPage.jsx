import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi, adminProductApi } from '../../lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [paging, setPaging] = useState({ page: 1, total_page: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await productApi.search({ page, size: 15 });
      setProducts(result.data || []);
      setPaging(result.paging || { page: 1, total_page: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminProductApi.remove(productId);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">+ ADD NEW PRODUCT</Link>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner spinner-lg"></div></div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>IMAGE</th>
                  <th>NAME</th>
                  <th>GENDER</th>
                  <th>CATEGORY</th>
                  <th>CREATED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#999' }}>No products found</td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ width: 48, height: 48, background: '#f0f0f0', overflow: 'hidden' }}>
                          {product.url ? (
                            <img src={product.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#999' }}>N/A</div>
                          )}
                        </div>
                      </td>
                      <td className="font-bold">{product.name}</td>
                      <td>{product.gender}</td>
                      <td>{product.category?.name}</td>
                      <td>{new Date(product.createdAt).toLocaleDateString('id-ID')}</td>
                      <td>
                        <div className="flex gap-2">
                          <Link to={`/admin/products/${product.id}/edit`} className="btn btn-sm btn-secondary">EDIT</Link>
                          <Link to={`/admin/products/${product.id}/variants`} className="btn btn-sm btn-outline">VARIANTS</Link>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id)}>DELETE</button>
                        </div>
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
    </div>
  );
}

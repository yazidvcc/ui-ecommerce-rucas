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
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-end border-b-4 border-primary pb-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary py-3 px-6 text-sm font-black tracking-widest uppercase border-2 border-primary hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1">
          + ADD NEW PRODUCT
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="overflow-x-auto border-4 border-primary bg-surface-container-lowest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-primary text-on-primary font-black text-sm tracking-widest uppercase">
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">IMAGE</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">NAME</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">GENDER</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">CATEGORY</th>
                  <th className="p-4 border-b-4 border-r-4 border-primary/20">CREATED</th>
                  <th className="p-4 border-b-4 border-primary/20">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center font-bold text-lg tracking-widest uppercase text-text-muted border-dashed border-2 border-border m-4">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product.id} className={`border-b-2 border-border ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'} hover:bg-primary/5 transition-colors`}>
                      <td className="p-4 border-r-2 border-border">
                        <div className="w-12 h-12 border-2 border-border bg-surface flex items-center justify-center overflow-hidden">
                          {product.url ? (
                            <img src={product.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-black tracking-widest uppercase text-text-muted">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 border-r-2 border-border font-black text-sm tracking-widest uppercase">{product.name}</td>
                      <td className="p-4 border-r-2 border-border font-bold text-sm tracking-wider uppercase">{product.gender}</td>
                      <td className="p-4 border-r-2 border-border font-bold text-sm tracking-wider uppercase">{product.category?.name}</td>
                      <td className="p-4 border-r-2 border-border font-bold text-sm tracking-wider uppercase">{new Date(product.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/admin/products/${product.id}/edit`} className="inline-block px-3 py-1 border-2 border-primary bg-primary text-on-primary font-black text-xs tracking-widest uppercase hover:bg-on-primary hover:text-primary transition-colors">EDIT</Link>
                          <Link to={`/admin/products/${product.id}/variants`} className="inline-block px-3 py-1 border-2 border-primary bg-surface font-black text-xs tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors">VARIANTS</Link>
                          <button className="inline-block px-3 py-1 border-2 border-error bg-error text-on-primary font-black text-xs tracking-widest uppercase hover:bg-on-primary hover:text-error transition-colors" onClick={() => handleDelete(product.id)}>DELETE</button>
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
    </div>
  );
}

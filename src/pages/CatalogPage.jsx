import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '../lib/api';
import './CatalogPage.css';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paging, setPaging] = useState({ page: 1, total_page: 1 });
  const [loading, setLoading] = useState(true);

  const currentCategoryId = searchParams.get('category_id') || '';
  const currentGender = searchParams.get('gender') || '';
  const currentName = searchParams.get('name') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    categoryApi.search({ size: 50 }).then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await productApi.search({
          category_id: currentCategoryId,
          gender: currentGender,
          name: currentName,
          page: currentPage,
          size: 12,
        });
        setProducts(result.data || []);
        setPaging(result.paging || { page: 1, total_page: 1 });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategoryId, currentGender, currentName, currentPage]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    setSearchParams(params);
  };

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
  };

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Page header */}
        <div className="catalog-header">
          <h1 className="text-headline-lg">
            {currentGender ? `${currentGender}'S COLLECTION` : 'ALL PRODUCTS'}
          </h1>
          {currentName && <p className="text-muted">Search results for: "{currentName}"</p>}
        </div>

        <div className="catalog-layout">
          {/* Filters sidebar */}
          <aside className="catalog-filters">
            <div className="filter-section">
              <h3 className="filter-title">CATEGORY</h3>
              <button
                className={`filter-option ${!currentCategoryId ? 'active' : ''}`}
                onClick={() => updateFilter('category_id', '')}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-option ${currentCategoryId == cat.id ? 'active' : ''}`}
                  onClick={() => updateFilter('category_id', cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="filter-section">
              <h3 className="filter-title">GENDER</h3>
              {['', 'MALE', 'FEMALE', 'UNISEX'].map((g) => (
                <button
                  key={g}
                  className={`filter-option ${currentGender === g ? 'active' : ''}`}
                  onClick={() => updateFilter('gender', g)}
                >
                  {g || 'All'}
                </button>
              ))}
            </div>
          </aside>

          {/* Products grid */}
          <div className="catalog-content">
            {loading ? (
              <div className="loading-screen"><div className="spinner spinner-lg"></div></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <p className="text-headline-md">NO PRODUCTS FOUND</p>
                <p className="text-muted mt-2">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="product-grid catalog-grid">
                  {products.map((product) => (
                    <Link key={product.id} to={`/products/${product.id}`} className="product-card card">
                      <div className="card-image" style={{ backgroundColor: '#f0f0f0' }}>
                        {product.url ? (
                          <img src={product.url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '14px', fontWeight: 600 }}>
                            NO IMAGE
                          </div>
                        )}
                      </div>
                      <div className="card-body">
                        <p className="product-card-category text-label-sm text-muted">{product.gender}</p>
                        <h3 className="product-card-name">{product.name}</h3>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {paging.total_page > 1 && (
                  <div className="pagination">
                    <button disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>←</button>
                    {Array.from({ length: paging.total_page }, (_, i) => i + 1).map((p) => (
                      <button key={p} className={p === currentPage ? 'active' : ''} onClick={() => goToPage(p)}>
                        {p}
                      </button>
                    ))}
                    <button disabled={currentPage >= paging.total_page} onClick={() => goToPage(currentPage + 1)}>→</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

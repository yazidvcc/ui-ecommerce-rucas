import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '../lib/api';

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
    <div className="w-full bg-background min-h-screen pb-20">
      <div className="container mx-auto px-6 pt-10">
        {/* Page header */}
        <div className="border-b-4 border-primary pb-6 mb-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
            {currentGender ? `${currentGender}'S COLLECTION` : 'ALL PRODUCTS'}
          </h1>
          {currentName && <p className="text-lg font-bold text-text-muted mt-2 uppercase tracking-wide">Search results for: "{currentName}"</p>}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-8">
            <div className="flex flex-col gap-3 border-2 border-primary bg-surface-container-lowest p-6">
              <h3 className="font-black text-xl uppercase tracking-widest border-b-2 border-primary pb-2 mb-2">CATEGORY</h3>
              <button
                className={`text-left font-bold text-sm tracking-wider uppercase transition-colors hover:text-primary ${!currentCategoryId ? 'text-primary' : 'text-text-muted'}`}
                onClick={() => updateFilter('category_id', '')}
              >
                All Categories {(!currentCategoryId) && '←'}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`text-left font-bold text-sm tracking-wider uppercase transition-colors hover:text-primary ${currentCategoryId == cat.id ? 'text-primary' : 'text-text-muted'}`}
                  onClick={() => updateFilter('category_id', cat.id)}
                >
                  {cat.name} {(currentCategoryId == cat.id) && '←'}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 border-2 border-primary bg-surface-container-lowest p-6">
              <h3 className="font-black text-xl uppercase tracking-widest border-b-2 border-primary pb-2 mb-2">GENDER</h3>
              {['', 'MALE', 'FEMALE', 'UNISEX'].map((g) => (
                <button
                  key={g}
                  className={`text-left font-bold text-sm tracking-wider uppercase transition-colors hover:text-primary ${currentGender === g ? 'text-primary' : 'text-text-muted'}`}
                  onClick={() => updateFilter('gender', g)}
                >
                  {g || 'All'} {(currentGender === g) && '←'}
                </button>
              ))}
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="min-h-[40vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="border-2 border-dashed border-primary p-20 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-black uppercase tracking-tighter">NO PRODUCTS FOUND</p>
                <p className="text-text-muted font-bold mt-2 uppercase tracking-wide">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {products.map((product) => (
                    <Link key={product.id} to={`/products/${product.id}`} className="group flex flex-col border-2 border-transparent hover:border-primary transition-colors bg-surface-container-lowest">
                      <div className="aspect-[4/5] w-full bg-surface-container relative overflow-hidden">
                        {product.url ? (
                          <img src={product.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted font-bold text-sm tracking-widest">
                            NO IMAGE
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="bg-primary text-on-primary text-xs font-bold px-2 py-1 uppercase tracking-widest">{product.gender}</span>
                        </div>
                      </div>
                      <div className="p-4 border-t-2 border-transparent group-hover:border-primary transition-colors flex flex-col gap-2">
                        <h3 className="font-bold text-lg uppercase tracking-wide truncate">{product.name}</h3>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {paging.total_page > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-16">
                    <button 
                      disabled={currentPage <= 1} 
                      onClick={() => goToPage(currentPage - 1)}
                      className="w-12 h-12 flex items-center justify-center border-2 border-border font-bold text-lg hover:border-primary hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-border"
                    >
                      ←
                    </button>
                    {Array.from({ length: paging.total_page }, (_, i) => i + 1).map((p) => (
                      <button 
                        key={p} 
                        className={`w-12 h-12 flex items-center justify-center border-2 font-bold text-lg transition-colors ${p === currentPage ? 'border-primary bg-primary text-on-primary' : 'border-border hover:border-primary hover:bg-primary hover:text-on-primary'}`} 
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button 
                      disabled={currentPage >= paging.total_page} 
                      onClick={() => goToPage(currentPage + 1)}
                      className="w-12 h-12 flex items-center justify-center border-2 border-border font-bold text-lg hover:border-primary hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-border"
                    >
                      →
                    </button>
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

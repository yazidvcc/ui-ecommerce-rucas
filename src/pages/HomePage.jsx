import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi, categoryApi } from '../lib/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodResult, catResult] = await Promise.all([
          productApi.search({ size: 8 }),
          categoryApi.search({ size: 20 }),
        ]);
        setProducts(prodResult.data || []);
        setCategories(catResult.data || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center bg-surface-container-high overflow-hidden border-b-2 border-primary">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <span className="font-bold text-sm tracking-[0.2em] uppercase mb-4 py-1 px-3 bg-primary text-on-primary">NEW SEASON</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-6">DEFINE YOUR<br />STYLE</h1>
          <p className="text-lg md:text-xl max-w-xl mx-auto mb-10 text-on-surface-variant">Premium streetwear crafted for those who dare to stand out.</p>
          <Link to="/catalog" className="btn btn-primary btn-lg">SHOP NOW</Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20 border-b-2 border-primary bg-background">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-10 border-b-2 border-primary pb-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">SHOP BY CATEGORY</h2>
              <Link to="/catalog" className="font-bold text-sm tracking-widest uppercase hover:text-text-muted transition-colors">VIEW ALL →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalog?category_id=${cat.id}`}
                  className="group flex items-center justify-between p-6 border-2 border-primary bg-surface-container-lowest hover:bg-primary hover:text-on-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <span className="font-bold uppercase tracking-wider text-sm truncate mr-2">{cat.name}</span>
                  <span className="font-bold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-10 border-b-2 border-primary pb-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">NEW ARRIVALS</h2>
            <Link to="/catalog" className="font-bold text-sm tracking-widest uppercase hover:text-text-muted transition-colors">VIEW ALL →</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 bg-primary text-on-primary text-center">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6">BOLD. FEARLESS. RUCAS.</h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl text-surface-dim">Explore our full collection and find your statement piece. Designed for the streets, crafted for you.</p>
          <Link to="/catalog" className="btn bg-on-primary text-primary hover:bg-surface-container-high hover:-translate-y-1">
            EXPLORE COLLECTION
          </Link>
        </div>
      </section>
    </div>
  );
}

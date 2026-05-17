import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi, categoryApi } from '../lib/api';
import './HomePage.css';

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
    return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tagline">NEW SEASON</span>
          <h1 className="text-display">DEFINE YOUR<br />STYLE</h1>
          <p className="hero-subtitle">Premium streetwear crafted for those who dare to stand out.</p>
          <Link to="/catalog" className="btn btn-primary btn-lg">SHOP NOW</Link>
        </div>
        <div className="hero-pattern"></div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="text-headline-md">SHOP BY CATEGORY</h2>
              <Link to="/catalog" className="btn btn-ghost">VIEW ALL →</Link>
            </div>
            <div className="category-grid">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalog?category_id=${cat.id}`}
                  className="category-card"
                >
                  <span className="category-name">{cat.name}</span>
                  <span className="category-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="text-headline-md">NEW ARRIVALS</h2>
            <Link to="/catalog" className="btn btn-ghost">VIEW ALL →</Link>
          </div>
          <div className="product-grid">
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
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container">
          <h2 className="text-headline-lg">BOLD. FEARLESS. RUCAS.</h2>
          <p>Explore our full collection and find your statement piece.</p>
          <Link to="/catalog" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
            EXPLORE COLLECTION
          </Link>
        </div>
      </section>
    </div>
  );
}

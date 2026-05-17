import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './CustomerLayout.css';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?name=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="customer-layout">
      {/* Top Navigation */}
      <header className="customer-header">
        <div className="container">
          <div className="header-inner">
            <Link to="/" className="logo">RUCAS</Link>

            <nav className="main-nav hide-mobile">
              <Link to="/catalog" className="nav-link">SHOP ALL</Link>
              <Link to="/catalog?gender=MALE" className="nav-link">MEN</Link>
              <Link to="/catalog?gender=FEMALE" className="nav-link">WOMEN</Link>
            </nav>

            <form className="search-bar hide-mobile" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </form>

            <div className="header-actions">
              {user ? (
                <>
                  <Link to="/cart" className="icon-btn" aria-label="Cart">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </Link>
                  <Link to="/profile" className="icon-btn" aria-label="Profile">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="btn btn-sm btn-primary hide-mobile">ADMIN</Link>
                  )}
                </>
              ) : (
                <Link to="/login" className="btn btn-sm btn-primary">LOGIN</Link>
              )}
              <button className="hamburger hide-desktop" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {menuOpen ? (
                    <path d="M18 6 6 18M6 6l12 12" />
                  ) : (
                    <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="mobile-menu">
              <Link to="/catalog" onClick={() => setMenuOpen(false)}>SHOP ALL</Link>
              <Link to="/catalog?gender=MALE" onClick={() => setMenuOpen(false)}>MEN</Link>
              <Link to="/catalog?gender=FEMALE" onClick={() => setMenuOpen(false)}>WOMEN</Link>
              {user && (
                <>
                  <Link to="/cart" onClick={() => setMenuOpen(false)}>CART</Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>PROFILE</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }}>LOGOUT</button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="customer-main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="customer-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3 className="logo">RUCAS</h3>
              <p className="text-muted">Premium streetwear for the bold and the fearless.</p>
            </div>
            <div className="footer-links">
              <h4>SHOP</h4>
              <Link to="/catalog">All Products</Link>
              <Link to="/catalog?gender=MALE">Men</Link>
              <Link to="/catalog?gender=FEMALE">Women</Link>
            </div>
            <div className="footer-links">
              <h4>ACCOUNT</h4>
              <Link to="/profile">My Account</Link>
              <Link to="/cart">Cart</Link>
              <Link to="/profile">Order History</Link>
            </div>
            <div className="footer-links">
              <h4>INFO</h4>
              <span>About Us</span>
              <span>Contact</span>
              <span>Shipping & Returns</span>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} RUCAS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

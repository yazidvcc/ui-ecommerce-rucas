import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background border-b-2 border-primary">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8 w-full justify-between">
            <Link to="/" className="text-3xl font-black tracking-tighter">RUCAS</Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/catalog" className="font-bold text-sm tracking-wider uppercase hover:text-secondary transition-colors">SHOP ALL</Link>
              <Link to="/catalog?gender=MALE" className="font-bold text-sm tracking-wider uppercase hover:text-secondary transition-colors">MEN</Link>
              <Link to="/catalog?gender=FEMALE" className="font-bold text-sm tracking-wider uppercase hover:text-secondary transition-colors">WOMEN</Link>
            </nav>

            <form className="hidden md:flex items-center flex-1 max-w-sm ml-8" onSubmit={handleSearch}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2 border-2 border-border focus:border-primary focus:outline-none bg-surface-container-lowest text-sm transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/cart" className="p-2 hover:bg-surface-container transition-colors" aria-label="Cart">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </Link>
                  <Link to="/profile" className="p-2 hover:bg-surface-container transition-colors" aria-label="Profile">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="hidden md:inline-flex btn btn-sm btn-primary">ADMIN</Link>
                  )}
                </>
              ) : (
                <Link to="/login" className="btn btn-sm btn-primary">LOGIN</Link>
              )}
              <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
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
            <div className="absolute top-20 left-0 w-full bg-background border-b-2 border-primary shadow-lg p-6 flex flex-col gap-6 md:hidden">
              <Link to="/catalog" className="font-bold text-lg" onClick={() => setMenuOpen(false)}>SHOP ALL</Link>
              <Link to="/catalog?gender=MALE" className="font-bold text-lg" onClick={() => setMenuOpen(false)}>MEN</Link>
              <Link to="/catalog?gender=FEMALE" className="font-bold text-lg" onClick={() => setMenuOpen(false)}>WOMEN</Link>
              <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }}>
                 <input
                  type="text"
                  placeholder="Search..."
                  className="w-full p-3 border-2 border-border focus:border-primary focus:outline-none bg-surface-container-lowest"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              {user && (
                <>
                  <Link to="/cart" className="font-bold text-lg" onClick={() => setMenuOpen(false)}>CART</Link>
                  <Link to="/profile" className="font-bold text-lg" onClick={() => setMenuOpen(false)}>PROFILE</Link>
                  <button className="text-left font-bold text-lg text-error" onClick={() => { handleLogout(); setMenuOpen(false); }}>LOGOUT</button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-on-primary py-16 mt-auto">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <h3 className="text-3xl font-black mb-4 tracking-tighter">RUCAS</h3>
              <p className="text-sm text-gray-400">Premium streetwear for the bold and the fearless.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase mb-6 text-gray-400">SHOP</h4>
              <div className="flex flex-col gap-4">
                <Link to="/catalog" className="hover:text-gray-300">All Products</Link>
                <Link to="/catalog?gender=MALE" className="hover:text-gray-300">Men</Link>
                <Link to="/catalog?gender=FEMALE" className="hover:text-gray-300">Women</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase mb-6 text-gray-400">ACCOUNT</h4>
              <div className="flex flex-col gap-4">
                <Link to="/profile" className="hover:text-gray-300">My Account</Link>
                <Link to="/cart" className="hover:text-gray-300">Cart</Link>
                <Link to="/profile" className="hover:text-gray-300">Order History</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wider uppercase mb-6 text-gray-400">INFO</h4>
              <div className="flex flex-col gap-4">
                <span className="cursor-pointer hover:text-gray-300">About Us</span>
                <span className="cursor-pointer hover:text-gray-300">Contact</span>
                <span className="cursor-pointer hover:text-gray-300">Shipping & Returns</span>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} RUCAS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

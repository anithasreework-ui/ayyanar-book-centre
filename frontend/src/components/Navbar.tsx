import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${search}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-blue-950 text-xs text-center py-1 text-blue-200">
        📞 Customer Care: +91 9894235330 &nbsp;|&nbsp;
        ✉️ ayyanarbookcentredgl1@gmail.com &nbsp;|&nbsp;
        🕐 Mon-Sat: 9AM - 8PM
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-bold text-lg leading-tight">
                Ayyanar Book Centre
              </p>
              <p className="text-xs text-blue-300 leading-tight">
                Dindigul, Tamil Nadu
              </p>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="flex w-full">
              <input
                type="text"
                placeholder="Search books, stationery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 rounded-l-lg text-gray-800
                           text-sm focus:outline-none"
              />
              <button type="submit"
                className="bg-yellow-400 text-gray-900 px-4 py-2
                           rounded-r-lg font-bold hover:bg-yellow-300">
                🔍
              </button>
            </div>
          </form>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/products', icon: '📚', label: 'Products' },
              { to: '/wholesale', icon: '🏭', label: 'Wholesale' },
              { to: '/orders', icon: '📦', label: 'Track Order' },
              { to: '/cart', icon: '🛒', label: 'Cart' },
            ].map((item) => (
              <Link key={item.to} to={item.to}
                className="flex flex-col items-center px-3 py-1
                           hover:bg-blue-800 rounded-lg transition-all
                           text-center min-w-14">
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}

            {token ? (
              <div className="flex flex-col items-center px-2">
                {user.role === 'admin' && (
                  <Link to="/admin"
                    className="flex flex-col items-center px-3 py-1
                               hover:bg-blue-800 rounded-lg transition-all">
                    <span className="text-lg">⚙️</span>
                    <span className="text-xs">Admin</span>
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="flex flex-col items-center px-3 py-1
                             hover:bg-red-700 rounded-lg transition-all">
                  <span className="text-lg">👤</span>
                  <span className="text-xs">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="flex flex-col items-center px-3 py-1
                           bg-yellow-400 text-gray-900 rounded-lg
                           hover:bg-yellow-300 transition-all">
                <span className="text-lg">👤</span>
                <span className="text-xs font-bold">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <form onSubmit={handleSearch} className="flex mb-3">
              <input type="text"
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-2 rounded-l text-gray-800 text-sm"
              />
              <button type="submit"
                className="bg-yellow-400 text-gray-900 px-3 rounded-r">
                🔍
              </button>
            </form>

            {[
              { to: '/', icon: '🏠', label: 'Home' },
              { to: '/products', icon: '📚', label: 'Products' },
              { to: '/wholesale', icon: '🏭', label: 'Wholesale' },
              { to: '/orders', icon: '📦', label: 'Track Order' },
              { to: '/cart', icon: '🛒', label: 'Cart' },
            ].map((item) => (
              <Link key={item.to} to={item.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2
                           hover:bg-blue-800 rounded-lg">
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}

            {token ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2
                               hover:bg-blue-800 rounded-lg">
                    <span>⚙️</span>
                    <span className="text-sm">Admin Panel</span>
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2
                             hover:bg-red-700 rounded-lg w-full">
                  <span>👤</span>
                  <span className="text-sm">Logout ({user.name})</span>
                </button>
              </>
            ) : (
              <Link to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2
                           bg-yellow-400 text-gray-900 rounded-lg">
                <span>👤</span>
                <span className="text-sm font-bold">Login / Register</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const Navbar = () => {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>({
    phone: '+91 9894235330',
    email: 'ayyanarbookcentredgl1@gmail.com',
    working_hours: 'Mon-Sat: 9AM-9PM',
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    axios.get(`${API}/settings/public`)
      .then((res) => { if (res.data) setSettings(res.data); })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${search}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    navigate('/login');
  };

  const NAV_LINKS = [
    { to: '/products', icon: '📚', label: 'Products' },
    { to: '/wholesale', icon: '🏭', label: 'Wholesale' },
    { to: '/orders', icon: '📦', label: 'Track Order' },
    { to: '/cart', icon: '🛒', label: 'Cart' },
  ];

  return (
    <nav className="text-white shadow-lg sticky top-0 z-50"
      style={{ background: '#1a3d2b' }}>

      {/* Top Info Bar — Dynamic */}
      <div className="text-xs text-center py-1 text-green-200
                      hidden md:block"
        style={{ background: '#0f2d1d' }}>
        📞 {settings.phone || '+91 9894235330'} &nbsp;|&nbsp;
        ✉️ {settings.email || 'ayyanarbookcentredgl1@gmail.com'}
        &nbsp;|&nbsp;
        🕐 {settings.working_hours || 'Mon-Sat: 9AM-9PM'} &nbsp;|&nbsp;
        📍 Dindigul, Tamil Nadu
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/"
            className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-full border-2
                            border-yellow-400 overflow-hidden
                            flex-shrink-0 bg-yellow-50">
              <img
                src="/logo.jpg"
                alt="Thiruvalluvar"
                className="w-full h-full object-cover object-top"
                onError={(e: any) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML =
                    '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:20px">📚</div>';
                }}
              />
            </div>
            <div className="hidden md:block">
              <p className="font-bold text-sm leading-tight">
                Ayyanar Book Centre
              </p>
              <p className="text-xs text-green-300 leading-tight">
                Dindigul, Tamil Nadu
              </p>
            </div>
            <div className="block md:hidden">
              <p className="font-bold text-sm">Ayyanar Books Centre </p>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md">
            <div className="flex w-full">
              <input
                type="text"
                placeholder="Search books, stationery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 rounded-l-lg text-gray-800
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-yellow-400"
              />
              <button type="submit"
                className="bg-yellow-400 text-gray-900 px-4 py-2
                           rounded-r-lg font-bold hover:bg-yellow-300
                           transition-colors">
                🔍
              </button>
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <Link key={item.to} to={item.to}
                className="flex flex-col items-center px-3 py-2
                           rounded-lg transition-all text-center min-w-14
                           hover:bg-green-800">
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-xs mt-0.5">{item.label}</span>
              </Link>
            ))}

            {token && (
              <Link to="/my-orders"
                className="flex flex-col items-center px-3 py-2
                           rounded-lg transition-all text-center min-w-14
                           hover:bg-green-800">
                <span className="text-lg leading-none">📋</span>
                <span className="text-xs mt-0.5">My Orders</span>
              </Link>
            )}

            {token && user.role === 'admin' && (
              <Link to="/admin"
                className="flex flex-col items-center px-3 py-2
                           bg-yellow-500 hover:bg-yellow-400 rounded-lg
                           transition-all text-center text-gray-900 min-w-14">
                <span className="text-lg leading-none">⚙️</span>
                <span className="text-xs mt-0.5 font-bold">Admin</span>
              </Link>
            )}

            {token ? (
              <div className="flex flex-col items-center ml-1 px-2">
                <span className="text-xs text-green-300 truncate max-w-20">
                  {user.name?.split(' ')[0]}
                </span>
                <button onClick={handleLogout}
                  className="text-xs bg-red-600 hover:bg-red-500
                             px-2 py-1 rounded transition-colors mt-0.5">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="flex flex-col items-center px-3 py-2
                           bg-yellow-400 text-gray-900 rounded-lg
                           hover:bg-yellow-300 transition-all min-w-14 ml-1">
                <span className="text-lg leading-none">👤</span>
                <span className="text-xs mt-0.5 font-bold">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart" className="text-2xl">🛒</Link>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl p-1">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-2">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 rounded-l text-gray-800
                         text-sm focus:outline-none"
            />
            <button type="submit"
              className="bg-yellow-400 text-gray-900 px-4 rounded-r
                         font-bold hover:bg-yellow-300">
              🔍
            </button>
          </form>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t pt-3"
            style={{ borderColor: '#2d5a3d' }}>

            <div className="rounded-lg p-3 mb-3 text-xs text-green-200"
              style={{ background: '#0f2d1d' }}>
              <p>📞 {settings.phone || '+91 9894235330'}</p>
              <p className="mt-0.5">
                🕐 {settings.working_hours || 'Mon-Sat: 9AM-9PM'}
              </p>
            </div>

            <div className="space-y-1">
              {NAV_LINKS.map((item) => (
                <Link key={item.to} to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3
                             hover:bg-green-800 rounded-lg transition-all">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {token && (
                <Link to="/my-orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3
                             hover:bg-green-800 rounded-lg transition-all">
                  <span className="text-xl">📋</span>
                  <span className="font-medium">My Orders</span>
                </Link>
              )}

              {token && user.role === 'admin' && (
                <Link to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3
                             bg-yellow-500 text-gray-900 rounded-lg">
                  <span className="text-xl">⚙️</span>
                  <span className="font-bold">Admin Panel</span>
                </Link>
              )}

              {token ? (
                <div>
                  <div className="px-4 py-2 text-green-300 text-sm">
                    👤 {user.name}
                  </div>
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3
                               bg-red-600 hover:bg-red-700 rounded-lg
                               w-full transition-all">
                    <span className="text-xl">🚪</span>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3
                             bg-yellow-400 text-gray-900 rounded-lg">
                  <span className="text-xl">👤</span>
                  <span className="font-bold">Login / Register</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
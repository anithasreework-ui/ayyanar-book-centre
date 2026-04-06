import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${search}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-800 text-white px-6 py-3 flex 
                    items-center justify-between shadow-lg">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold">
        📚 Ayyanar Book Centre
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search books, stationery..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1 rounded text-black w-64"
        />
        <button
          type="submit"
          className="bg-yellow-400 text-black px-4 py-1 
                     rounded font-semibold hover:bg-yellow-300"
        >
          Search
        </button>
      </form>

      {/* Nav Links */}
      <div className="flex gap-4 items-center">
        <Link to="/products" className="hover:text-yellow-300">
          Products
        </Link>
        <Link to="/cart" className="hover:text-yellow-300">
          🛒 Cart
        </Link>
        {token ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-400"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-yellow-400 text-black px-3 py-1 
                       rounded font-semibold hover:bg-yellow-300"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
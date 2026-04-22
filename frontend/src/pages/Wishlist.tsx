import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(wl);
  }, []);

  // Listen for wishlist changes
  useEffect(() => {
    const handleStorage = () => {
      const wl = JSON.parse(
        localStorage.getItem('wishlist') || '[]'
      );
      setWishlist(wl);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const clearWishlist = () => {
    localStorage.removeItem('wishlist');
    setWishlist([]);
  };

  const moveAllToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    wishlist.forEach((item) => {
      const exists = cart.find((c: any) => c.id === item.id);
      if (exists) {
        exists.quantity += 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${wishlist.length} items added to cart!`);
    navigate('/cart');
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center
                      justify-center text-center px-4"
        style={{ background: '#fafaf8' }}>
        <div className="text-8xl mb-6">🤍</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2"
          style={{ fontFamily: 'Georgia, serif' }}>
          Your wishlist is empty
        </h2>
        <p className="text-gray-400 mb-8">
          Tap ❤️ on any book to save it here!
        </p>
        <button
          onClick={() => navigate('/products')}
          className="text-white px-8 py-3 rounded-full font-bold
                     hover:opacity-90 transition-all"
          style={{ background: '#1a4a2e' }}>
          Browse Books →
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800"
              style={{ fontFamily: 'Georgia, serif' }}>
              My Wishlist
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {wishlist.length} saved items
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={moveAllToCart}
              className="text-white px-4 py-2 rounded-xl font-medium
                         text-sm hover:opacity-90 transition-all"
              style={{ background: '#1a4a2e' }}>
              🛒 Add All to Cart
            </button>
            <button
              onClick={clearWishlist}
              className="border border-red-200 text-red-500 px-4 py-2
                         rounded-xl font-medium text-sm
                         hover:bg-red-50 transition-all">
              🗑️ Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3
                        lg:grid-cols-4 gap-4">
          {wishlist.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  category: string;
  image_url: string;
  stock_qty: number;
  description?: string;
}

const CATEGORY_COLORS: any = {
  state_board: '#2d5a27',
  tnpsc: '#1e3a5f',
  cbse: '#5a2d82',
  central_competitive: '#7c2d12',
  ncert: '#c2410c',
  medical: '#0e7490',
  stationery: '#b45309',
  children: '#be185d',
  novels: '#374151',
  motivational: '#065f46',
  gifts: '#9d174d',
  projects: '#1d4ed8',
  combos: '#6b21a8',
  wholesale: '#1a4a2e',
  default: '#374151',
};

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(() => {
    const wl = JSON.parse(
      localStorage.getItem('wishlist') || '[]'
    );
    return wl.some((i: any) => i.id === product.id);
  });

  const color = CATEGORY_COLORS[product.category] ||
    CATEGORY_COLORS.default;

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wl.some((i: any) => i.id === product.id);
    const updated = exists
      ? wl.filter((i: any) => i.id !== product.id)
      : [...wl, product];
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlisted(!exists);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group bg-white rounded-2xl overflow-hidden
                 cursor-pointer flex flex-col"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        transition: 'all 0.25s ease',
        height: '100%',
        minHeight: '280px',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 8px 24px rgba(0,0,0,0.13)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 2px 8px rgba(0,0,0,0.07)';
      }}
    >
      {/* Image Container — Fixed Height */}
      <div className="relative flex-shrink-0"
        style={{
          height: '160px',
          background: '#f8f5f0',
          overflow: 'hidden',
        }}>

        <img
          src={product.image_url || ''}
          alt={product.name}
          className="w-full h-full object-cover transition-transform
                     duration-500 group-hover:scale-105"
          style={{ display: product.image_url ? 'block' : 'none' }}
          onError={(e: any) => {
            e.target.style.display = 'none';
          }}
        />

        {/* Placeholder when no image */}
        {!product.image_url && (
          <div className="w-full h-full flex items-center
                          justify-center flex-col gap-1"
            style={{ background: '#f0f7f0' }}>
            <span className="text-4xl">📚</span>
            <span className="text-xs text-gray-400">No Image</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="text-white text-xs px-2 py-0.5 rounded-full
                           font-medium"
            style={{
              background: color,
              fontSize: '10px',
              letterSpacing: '0.5px',
            }}>
            {product.category.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-10">
            <span className="text-white text-xs px-1.5 py-0.5
                             rounded-full font-bold"
              style={{ background: '#dc2626', fontSize: '10px' }}>
              -{discount}%
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full
                     flex items-center justify-center transition-all
                     hover:scale-110 active:scale-90"
          style={{
            background: wishlisted
              ? '#fee2e2'
              : 'rgba(255,255,255,0.9)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
          <span className="text-sm">
            {wishlisted ? '❤️' : '🤍'}
          </span>
        </button>

        {/* Out of Stock Overlay */}
        {product.stock_qty === 0 && (
          <div className="absolute inset-0 flex items-center
                          justify-center"
            style={{ background: 'rgba(0,0,0,0.45)' }}>
            <span className="text-white font-bold text-xs
                             px-3 py-1 rounded-full"
              style={{ background: '#dc2626' }}>
              Out of Stock
            </span>
          </div>
        )}

        {/* Low Stock */}
        {product.stock_qty > 0 && product.stock_qty <= 5 && (
          <div className="absolute bottom-2 left-2">
            <span className="text-white text-xs px-2 py-0.5
                             rounded-full"
              style={{ background: '#f97316', fontSize: '10px' }}>
              Only {product.stock_qty} left!
            </span>
          </div>
        )}
      </div>

      {/* Content — Fixed Layout */}
      <div className="p-3 flex flex-col flex-1">

        {/* Product Name — Fixed 2 lines */}
        <h3 className="text-gray-800 text-sm font-semibold
                       leading-snug mb-2"
          style={{
            fontFamily: 'Georgia, serif',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '40px',
          }}>
          {product.name}
        </h3>

        {/* Price Row */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-lg"
              style={{
                color: '#1a4a2e',
                fontFamily: 'Georgia, serif',
              }}>
              ₹{product.price}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-gray-400 text-xs line-through">
                ₹{product.mrp}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-medium"
                style={{ color: '#dc2626' }}>
                {discount}% off
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={addToCart}
            disabled={product.stock_qty === 0}
            className="w-full text-white text-sm py-2 rounded-xl
                       font-semibold disabled:opacity-50
                       transition-all duration-200 active:scale-95"
            style={{
              background: added
                ? '#16a34a'
                : product.stock_qty === 0
                ? '#9ca3af'
                : color,
            }}>
            {added ? '✓ Added to Cart!' : '+ Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
  stock_qty: number;
  description?: string;
}

const CATEGORY_COLORS: any = {
  state_board: '#2d5a27',
  tnpsc: '#1e3a5f',
  cbse: '#5a2d82',
  ncert: '#c2410c',
  medical: '#0e7490',
  stationery: '#b45309',
  children: '#be185d',
  novels: '#374151',
  motivational: '#065f46',
  gifts: '#9d174d',
  projects: '#1d4ed8',
  combos: '#7c2d12',
  wholesale: '#1a4a2e',
  default: '#374151',
};

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const color = CATEGORY_COLORS[product.category] ||
    CATEGORY_COLORS.default;

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

    // Visual feedback
    const btn = e.currentTarget as HTMLButtonElement;
    const original = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.style.background = '#16a34a';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = color;
    }, 1500);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group relative bg-white rounded-2xl overflow-hidden
                 cursor-pointer flex flex-col"
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 12px 28px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 2px 8px rgba(0,0,0,0.08)';
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden"
        style={{ height: '180px', background: '#f8f5f0' }}>
        <img
          src={product.image_url ||
            'https://via.placeholder.com/300x180?text=📚'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform
                     duration-500 group-hover:scale-105"
          onError={(e: any) => {
            e.target.src =
              'https://via.placeholder.com/300x180/f8f5f0/1a4a2e?text=📚';
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="text-white text-xs px-2 py-1 rounded-full
                           font-medium"
            style={{ background: color, opacity: 0.92 }}>
            {product.category.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Out of Stock */}
        {product.stock_qty === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50
                          flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-red-600
                             px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Low Stock */}
        {product.stock_qty > 0 && product.stock_qty <= 5 && (
          <div className="absolute top-2 right-2">
            <span className="text-white text-xs px-2 py-1 rounded-full
                             font-medium bg-orange-500">
              Only {product.stock_qty} left!
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight
                       mb-1 line-clamp-2 flex-1"
          style={{ fontFamily: 'Georgia, serif' }}>
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="font-bold text-xl"
              style={{ color: '#1a4a2e',
                fontFamily: 'Georgia, serif' }}>
              ₹{product.price}
            </p>
          </div>

          <button
            onClick={addToCart}
            disabled={product.stock_qty === 0}
            className="text-white text-xs px-3 py-2 rounded-xl
                       font-semibold disabled:bg-gray-300
                       transition-all duration-200 active:scale-95"
            style={{ background: product.stock_qty === 0
              ? '#d1d5db' : color }}
          >
            + Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
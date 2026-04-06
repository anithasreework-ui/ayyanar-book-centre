import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
  stock_qty: number;
}

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();

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
    alert(`"${product.name}" added to cart! 🛒`);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-xl shadow-md overflow-hidden 
                 cursor-pointer hover:shadow-xl transition-all 
                 hover:-translate-y-1 border border-gray-100"
    >
      {/* Product Image */}
      <img
        src={product.image_url || 'https://via.placeholder.com/300x200'}
        alt={product.name}
        className="w-full h-48 object-cover"
      />

      {/* Product Info */}
      <div className="p-4">
        <span className="text-xs bg-blue-100 text-blue-700 
                         px-2 py-1 rounded-full font-medium">
          {product.category}
        </span>
        <h3 className="font-semibold text-gray-800 mt-2 
                       text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-green-600 font-bold text-lg mt-1">
          ₹{product.price}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {product.stock_qty > 0
            ? `${product.stock_qty} in stock`
            : '❌ Out of stock'}
        </p>

        <button
          onClick={addToCart}
          disabled={product.stock_qty === 0}
          className="w-full mt-3 bg-blue-800 text-white py-2 
                     rounded-lg font-semibold hover:bg-blue-700 
                     disabled:bg-gray-300 transition-colors"
        >
          Add to Cart 🛒
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
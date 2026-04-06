import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getRecommendations } from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(Number(id))
      .then((res) => {
        setProduct(res.data);
        return getRecommendations(Number(id));
      })
      .then((res) => setRecommendations(res.data.recommendations || []))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
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

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400 text-lg">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📭</p>
        <p className="text-gray-500 text-lg">Product not found!</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 bg-blue-800 text-white px-6 py-2 rounded-lg"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/products')}
        className="text-blue-700 hover:underline text-sm mb-6 flex items-center gap-1"
      >
        Back to Products
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8">
        <img
          src={product.image_url || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="w-full md:w-64 h-72 object-cover rounded-xl flex-shrink-0"
        />

        <div className="flex-1">
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {product.category}
          </span>

          <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-2">
            {product.name}
          </h1>

          <p className="text-gray-500 text-sm mb-4 leading-relaxed">
            {product.description || 'No description available.'}
          </p>

          <p className="text-4xl font-bold text-green-600 mb-2">
            Rs.{product.price}
          </p>

          <p className="text-sm mb-6">
            {product.stock_qty > 0 ? (
              <span className="text-green-600 font-medium">
                In Stock ({product.stock_qty} available)
              </span>
            ) : (
              <span className="text-red-500 font-medium">Out of Stock</span>
            )}
          </p>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={addToCart}
              disabled={product.stock_qty === 0}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-800 text-white hover:bg-blue-700'
              } disabled:bg-gray-300`}
            >
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </button>

            <button
              onClick={() => { addToCart(); navigate('/cart'); }}
              disabled={product.stock_qty === 0}
              className="px-8 py-3 rounded-xl font-bold border-2 border-blue-800 text-blue-800 hover:bg-blue-50 transition-all disabled:border-gray-300 disabled:text-gray-300"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-6 bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-sm text-gray-600">
              Free delivery on orders above Rs.500
            </p>
            <p className="text-sm text-gray-600">
              Store pickup available at Dindigul
            </p>
            <p className="text-sm text-gray-600">
              Worldwide delivery available
            </p>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            You might also like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((rec: any) => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
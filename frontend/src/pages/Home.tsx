import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { label: '📋 TNPSC Books', value: 'tnpsc' },
  { label: '📘 NCERT Books', value: 'ncert' },
  { label: '💪 Motivational', value: 'motivational' },
  { label: '📖 Novels', value: 'novels' },
  { label: '✏️ Stationery', value: 'stationery' },
  { label: '🎒 School Accessories', value: 'school_accessories' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 
                      text-white text-center py-16 px-4">
        <h1 className="text-4xl font-bold mb-2">
          📚 Ayyanar Book Centre
        </h1>
        <p className="text-lg opacity-90 mb-1">
          Dindigul's Trusted Bookshop
        </p>
        <p className="text-sm opacity-75 mb-6">
          Books • Stationery • School Accessories • Worldwide Delivery
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-yellow-400 text-black px-8 py-3 rounded-full 
                     font-bold text-lg hover:bg-yellow-300 transition"
        >
          Shop Now →
        </button>
      </div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Browse Categories
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => navigate(`/products?category=${cat.value}`)}
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 
                         rounded-xl p-3 text-center text-sm font-medium 
                         text-blue-800 transition-all hover:-translate-y-1"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Products */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Featured Products
        </h2>
        {loading ? (
          <p className="text-center text-gray-400 py-10">
            Loading products...
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Why Choose Us */}
      <div className="bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 
                        md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🚚', title: 'Free Delivery', desc: 'Orders above ₹500' },
            { icon: '🌍', title: 'Worldwide', desc: 'International shipping' },
            { icon: '🏪', title: 'Store Pickup', desc: 'Collect at Dindigul' },
            { icon: '📦', title: 'Wholesale', desc: 'For schools & colleges' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-3xl mb-2">{item.icon}</p>
              <p className="font-bold text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
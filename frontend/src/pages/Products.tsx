import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts, searchProducts } from '../services/api';

const CATEGORIES = [
  { label: '📋 All', value: '' },
  { label: '📘 TNPSC', value: 'tnpsc' },
  { label: '📗 NCERT', value: 'ncert' },
  { label: '💪 Motivational', value: 'motivational' },
  { label: '📖 Novels', value: 'novels' },
  { label: '✏️ Stationery', value: 'stationery' },
  { label: '🎒 School Accessories', value: 'school_accessories' },
  { label: '👶 Children Books', value: 'children' },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  useEffect(() => {
    setLoading(true);
    if (searchParam) {
      searchProducts(searchParam)
        .then((res) => setProducts(res.data))
        .finally(() => setLoading(false));
    } else {
      getProducts(selectedCategory)
        .then((res) => setProducts(res.data))
        .finally(() => setLoading(false));
    }
  }, [selectedCategory, searchParam]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {searchParam ? `Search: "${searchParam}"` : '📚 All Products'}
      </h1>
      <p className="text-gray-500 mb-6">{products.length} products found</p>

      {!searchParam && (
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium 
                         transition-all border ${
                selectedCategory === cat.value
                  ? 'bg-blue-800 text-white border-blue-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-500 text-lg">No products found!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
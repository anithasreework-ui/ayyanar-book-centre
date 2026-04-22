import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getProducts, searchProducts } from '../services/api';

const CATEGORIES = [
  { label: 'All', value: '', icon: '📦' },
  { label: 'State Board & Guide', value: 'state_board', icon: '📗' },
  { label: 'TNPSC Competitive', value: 'tnpsc', icon: '📋' },
  { label: 'CBSE & Guide', value: 'cbse', icon: '📘' },
  { label: 'Central Competitive', value: 'central_competitive',
    icon: '🏆' },
  { label: 'NCERT / NEET', value: 'ncert', icon: '📕' },
  { label: 'Medical Books', value: 'medical', icon: '🏥' },
  { label: 'Stationery', value: 'stationery', icon: '✏️' },
  { label: 'Children Books', value: 'children', icon: '👶' },
  { label: 'Novels', value: 'novels', icon: '📖' },
  { label: 'Motivational', value: 'motivational', icon: '💪' },
  { label: 'Gifts & Hampers', value: 'gifts', icon: '🎁' },
  { label: 'School Projects', value: 'projects', icon: '🔬' },
  { label: 'Combos', value: 'combos', icon: '🎯' },
  { label: 'Wholesale', value: 'wholesale', icon: '🏭' },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] =
    useState(categoryParam);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    setLoading(true);
    const fetch = searchParam
      ? searchProducts(searchParam)
      : getProducts(selectedCategory);

    fetch
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchParam]);

  const sortedProducts = [...products].sort((a: any, b: any) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-1"
          style={{ fontFamily: 'Georgia, serif' }}>
          {searchParam
            ? `Search: "${searchParam}"`
            : selectedCategory
            ? CATEGORIES.find(c => c.value === selectedCategory)?.label
              || 'Products'
            : 'All Products'}
        </h1>
        <p className="text-gray-500 text-sm">
          {sortedProducts.length} products found
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar — Categories */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl p-4 sticky top-24"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p className="font-bold text-gray-700 mb-3 text-sm
                            uppercase tracking-wide">
                Categories
              </p>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl
                               text-sm transition-all flex items-center
                               gap-2 ${
                      selectedCategory === cat.value
                        ? 'text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    style={selectedCategory === cat.value
                      ? { background: '#1a4a2e' }
                      : {}}>
                    <span>{cat.icon}</span>
                    <span className="leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">

            {/* Sort Bar */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                Showing {sortedProducts.length} items
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2
                           text-sm focus:outline-none bg-white"
                style={{ color: '#1a4a2e' }}>
                <option value="default">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3
                              lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i}
                    className="bg-white rounded-2xl overflow-hidden
                               animate-pulse">
                    <div className="h-44 bg-gray-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-6xl mb-4">📭</p>
                <p className="text-gray-500 text-lg font-medium">
                  No products found!
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Try a different category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3
                              lg:grid-cols-4 gap-4">
                {sortedProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
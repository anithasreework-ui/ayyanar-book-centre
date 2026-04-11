import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { label: 'State Board', icon: '📗', value: 'state_board' },
  { label: 'CBSE Books', icon: '📘', value: 'cbse' },
  { label: 'TN Textbooks', icon: '📙', value: 'tn_textbook' },
  { label: 'TNPSC', icon: '📋', value: 'tnpsc' },
  { label: 'NCERT', icon: '📕', value: 'ncert' },
  { label: 'Medical Books', icon: '🏥', value: 'medical' },
  { label: 'Notebooks', icon: '📓', value: 'notebooks' },
  { label: 'Stationery', icon: '✏️', value: 'stationery' },
  { label: 'Children Books', icon: '👶', value: 'children' },
  { label: 'Novels', icon: '📖', value: 'novels' },
  { label: 'Motivational', icon: '💪', value: 'motivational' },
  { label: 'Gifts & Hampers', icon: '🎁', value: 'gifts' },
  { label: 'School Projects', icon: '🔬', value: 'projects' },
  { label: 'School Bags', icon: '🎒', value: 'school_accessories' },
  { label: 'Combos', icon: '🎯', value: 'combos' },
  { label: 'Wholesale', icon: '🏭', value: 'wholesale' },
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
    <div className="min-h-screen bg-gray-50">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800
                      to-blue-700 text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center
                          justify-center gap-6 mb-6">

            {/* Thiruvalluvar Logo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-4
                              border-yellow-400 overflow-hidden
                              shadow-xl bg-yellow-50">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Thiruvalluvar_statue.jpg/200px-Thiruvalluvar_statue.jpg"
                  alt="Thiruvalluvar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-1">
                Ayyanar Book Centre
              </h1>
              <p className="text-yellow-300 text-sm md:text-base
                            italic mb-1">
                "கற்றதனால் ஆய பயனென்கொல்" — திருவள்ளுவர்
              </p>
              <p className="text-blue-200 text-sm">
                Dindigul's Most Trusted Bookshop
              </p>
            </div>
          </div>

          <p className="text-center text-blue-100 mb-2">
            Books • Stationery • School Accessories • Worldwide Delivery
          </p>

          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => navigate('/products')}
              className="bg-yellow-400 text-gray-900 px-8 py-3
                         rounded-full font-bold text-lg
                         hover:bg-yellow-300 transition-all
                         hover:scale-105">
              Shop Now →
            </button>
            <button
              onClick={() => navigate('/wholesale')}
              className="bg-transparent border-2 border-white
                         text-white px-6 py-3 rounded-full
                         font-bold hover:bg-white
                         hover:text-blue-900 transition-all">
              Wholesale
            </button>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="bg-blue-800 text-white py-3 px-4">
        <div className="max-w-5xl mx-auto flex justify-center
                        flex-wrap gap-6 text-xs md:text-sm">
          {[
            { icon: '🆓', text: 'Free Delivery under 1kg' },
            { icon: '🌍', text: 'Worldwide Shipping' },
            { icon: '🏪', text: 'Store Pickup Available' },
            { icon: '📦', text: 'Wholesale for Schools' },
          ].map((item) => (
            <div key={item.text}
              className="flex items-center gap-1">
              <span>{item.icon}</span>
              <span className="text-blue-100">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Categories */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Browse Categories
            </h2>
            <button
              onClick={() => navigate('/products')}
              className="text-blue-700 text-sm hover:underline">
              View All →
            </button>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() =>
                  navigate(`/products?category=${cat.value}`)
                }
                className="flex flex-col items-center bg-white
                           hover:bg-blue-50 border border-gray-100
                           hover:border-blue-300 rounded-xl p-2
                           text-center transition-all hover:-translate-y-1
                           shadow-sm group">
                <span className="text-2xl mb-1 group-hover:scale-110
                                 transition-transform">
                  {cat.icon}
                </span>
                <span className="text-xs font-medium text-gray-600
                                 leading-tight">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Featured Products
            </h2>
            <button
              onClick={() => navigate('/products')}
              className="text-blue-700 text-sm hover:underline">
              View All →
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">
                Loading products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📚</p>
              <p className="text-gray-500">
                Products coming soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 8).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Why Choose Us */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Why Choose Ayyanar Book Centre?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: '📚',
                title: 'Huge Collection',
                desc: 'State Board, CBSE, TNPSC & more'
              },
              {
                icon: '🆓',
                title: 'Free Delivery',
                desc: 'Under 1kg — FREE across India'
              },
              {
                icon: '🌍',
                title: 'Worldwide',
                desc: 'International shipping available'
              },
              {
                icon: '🏪',
                title: 'Store Pickup',
                desc: 'Collect at Dindigul shop'
              },
              {
                icon: '📦',
                title: 'Wholesale',
                desc: 'MOU for schools & colleges'
              },
              {
                icon: '🎁',
                title: 'Custom Gifts',
                desc: 'Personalised hampers'
              },
              {
                icon: '🤖',
                title: 'AI Assistant',
                desc: '24/7 chatbot support'
              },
              {
                icon: '⚡',
                title: 'Fast Orders',
                desc: 'Quick processing & dispatch'
              },
            ].map((item) => (
              <div key={item.title}
                className="bg-white rounded-xl p-4 shadow-sm
                           border border-gray-100 text-center
                           hover:shadow-md transition-shadow">
                <p className="text-3xl mb-2">{item.icon}</p>
                <p className="font-bold text-gray-800 text-sm">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300
                        rounded-2xl p-6 text-center mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Schools & Colleges — Special Wholesale Pricing!
          </h2>
          <p className="text-gray-700 text-sm mb-4">
            MOU agreements available. Contact us for bulk orders.
          </p>
          <button
            onClick={() => navigate('/wholesale')}
            className="bg-blue-800 text-white px-6 py-2 rounded-full
                       font-bold hover:bg-blue-700 transition">
            Enquire Now →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2
                        md:grid-cols-4 gap-6 text-sm mb-8">

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full border-2
                              border-yellow-400 overflow-hidden">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Thiruvalluvar_statue.jpg/200px-Thiruvalluvar_statue.jpg"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-bold">Ayyanar Book Centre</p>
            </div>
            <p className="text-blue-300 text-xs">
              Dindigul, Tamil Nadu
            </p>
            <p className="text-blue-300 text-xs">India - 624 001</p>
          </div>

          <div>
            <p className="font-bold mb-3">Contact Us</p>
            <div className="space-y-1 text-blue-300 text-xs">
              <p>📞 +91 9894235330</p>
              <p>✉️ ayyanarbookcentredgl1@gmail.com</p>
              <p>📸 @ayyanarbookcentre</p>
              <p>🕐 Mon-Sat: 9AM - 8PM</p>
            </div>
          </div>

          <div>
            <p className="font-bold mb-3">Quick Links</p>
            <div className="space-y-1">
              {[
                { href: '/products', label: '📚 Products' },
                { href: '/wholesale', label: '🏭 Wholesale' },
                { href: '/orders', label: '📦 Track Order' },
                { href: '/terms', label: '📋 Terms & Conditions' },
              ].map((link) => (
                <a key={link.href} href={link.href}
                  className="block text-blue-300 hover:text-white
                             text-xs transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-bold mb-3">Delivery Info</p>
            <div className="space-y-1 text-blue-300 text-xs">
              <p>🆓 Under 1kg — FREE</p>
              <p>🏠 Tamil Nadu — Rs.80</p>
              <p>📦 Other States — Rs.150</p>
              <p>✈️ International — Rs.800+</p>
              <a href="/terms"
                className="text-yellow-400 hover:underline block mt-2">
                Full delivery policy →
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 pt-4 text-center">
          <p className="text-blue-400 text-xs">
            © 2025 Ayyanar Book Centre, Dindigul. All rights reserved.
          </p>
          <p className="text-blue-500 text-xs mt-1 italic">
            "கற்றதனால் ஆய பயனென்கொல்" — திருவள்ளுவர்
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
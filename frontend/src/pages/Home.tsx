import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const CATEGORIES = [
  { label: 'State Board Textbooks & Guide', icon: '📗', value: 'state_board' },
  { label: 'State Board TNPSC Competitive', icon: '📋', value: 'tnpsc' },
  { label: 'CBSE Textbooks & Guide', icon: '📘', value: 'cbse' },
  { label: 'Central Board Competitive', icon: '🏆', value: 'central_competitive' },
  { label: 'NCERT / NEET Books', icon: '📕', value: 'ncert' },
  { label: 'Medical Books', icon: '🏥', value: 'medical' },
  { label: 'Stationery', icon: '✏️', value: 'stationery' },
  { label: 'Children Books', icon: '👶', value: 'children' },
  { label: 'Novels', icon: '📖', value: 'novels' },
  { label: 'Motivational Books', icon: '💪', value: 'motivational' },
  { label: 'Gifts & Hampers', icon: '🎁', value: 'gifts' },
  { label: 'School Projects', icon: '🔬', value: 'projects' },
  { label: 'Combos', icon: '🎯', value: 'combos' },
  { label: 'Wholesale', icon: '🏭', value: 'wholesale' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({
    shop_name: 'Ayyanar Book Centre',
    phone: '+91 9894235330',
    customer_care: '+91 9894235330',
    email: 'ayyanarbookcentredgl1@gmail.com',
    instagram: '@ayyanarbookcentre',
    shop_address: 'Dindigul, Tamil Nadu, India - 624 001',
    working_hours: 'Monday to Saturday, 9:00 AM to 8:00 PM',
    tagline: 'Knowledge is the floor of success',
    branch_2_name: '',
    branch_2_address: '',
    branch_2_phone: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Products load
    getProducts()
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));

    // Settings load from DB
    axios.get(`${API}/settings/public`)
      .then((res) => {
        if (res.data) setSettings(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Banner — Dark Green Theme */}
      <div className="text-white py-14 px-4"
        style={{
          background: 'linear-gradient(135deg, #1a4a2e 0%, #2d7a4f 50%, #1a4a2e 100%)'
        }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center
                          justify-center gap-6 mb-6">

            {/* Thiruvalluvar Logo */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-full border-4
                              border-yellow-400 overflow-hidden
                              shadow-2xl bg-yellow-50">
                <img
                  src="/logo.jpg"
                  alt="Thiruvalluvar"
                  className="w-full h-full object-cover object-top"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML =
                      '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:48px">📚</div>';
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-1">
                {settings.shop_name || 'Ayyanar Book Centre'}
              </h1>
              <p className="text-yellow-300 text-sm md:text-base
                            italic mb-1">
                "{settings.tagline || 'Knowledge is the floor of success'}"
              </p>
              <p className="text-green-200 text-sm">
                Dindigul's Most Trusted Bookshop
              </p>
            </div>
          </div>

          <p className="text-center text-green-100 mb-2">
            Books • Stationery • School Accessories • Worldwide Delivery
          </p>

          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => navigate('/products')}
              className="bg-yellow-400 text-gray-900 px-8 py-3
                         rounded-full font-bold text-lg
                         hover:bg-yellow-300 transition-all
                         hover:scale-105 shadow-lg">
              Shop Now →
            </button>
            <button
              onClick={() => navigate('/wholesale')}
              className="bg-transparent border-2 border-yellow-400
                         text-yellow-400 px-6 py-3 rounded-full
                         font-bold hover:bg-yellow-400
                         hover:text-gray-900 transition-all">
              Wholesale
            </button>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <div className="text-white py-3 px-4"
        style={{ background: '#1a4a2e' }}>
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
              <span className="text-green-100">{item.text}</span>
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
              className="text-green-700 text-sm hover:underline font-medium">
              View All →
            </button>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => navigate(`/products?category=${cat.value}`)}
                className="flex flex-col items-center bg-white
                           hover:bg-green-50 border border-gray-100
                           hover:border-green-400 rounded-xl p-2
                           text-center transition-all
                           hover:-translate-y-1 shadow-sm group">
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
              className="text-green-700 text-sm hover:underline font-medium">
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
              <p className="text-gray-500">Products coming soon!</p>
              <button
                onClick={() => navigate('/admin')}
                className="mt-4 bg-green-700 text-white px-6 py-2
                           rounded-lg text-sm hover:bg-green-600">
                Add Products (Admin)
              </button>
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
              { icon: '📚', title: 'Huge Collection',
                desc: 'State Board, CBSE, TNPSC & more' },
              { icon: '🆓', title: 'Free Delivery',
                desc: 'Under 1kg — FREE across India' },
              { icon: '🌍', title: 'Worldwide',
                desc: 'International shipping available' },
              { icon: '🏪', title: 'Store Pickup',
                desc: 'Collect at Dindigul shop' },
              { icon: '📦', title: 'Wholesale',
                desc: 'MOU for schools & colleges' },
              { icon: '🎁', title: 'Custom Gifts',
                desc: 'Personalised hampers' },
              { icon: '🤖', title: 'AI Assistant',
                desc: '24/7 chatbot support' },
              { icon: '⚡', title: 'Fast Orders',
                desc: 'Quick processing & dispatch' },
            ].map((item) => (
              <div key={item.title}
                className="bg-white rounded-xl p-4 shadow-sm
                           border border-gray-100 text-center
                           hover:shadow-md hover:border-green-200
                           transition-all">
                <p className="text-3xl mb-2">{item.icon}</p>
                <p className="font-bold text-gray-800 text-sm">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-2xl p-6 text-center mb-10 text-white"
          style={{ background: 'linear-gradient(135deg, #1a4a2e, #2d7a4f)' }}>
          <h2 className="text-xl font-bold mb-1">
            Schools & Colleges — Special Wholesale Pricing!
          </h2>
          <p className="text-green-100 text-sm mb-4">
            MOU agreements available. Contact us for bulk orders.
          </p>
          <button
            onClick={() => navigate('/wholesale')}
            className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full
                       font-bold hover:bg-yellow-300 transition">
            Enquire Now →
          </button>
        </div>
      </div>

      {/* Footer — Dark Green */}
      <footer className="text-white py-10 px-4"
        style={{ background: '#1a3d2b' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2
                        md:grid-cols-4 gap-6 text-sm mb-8">

          {/* Logo + Name */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full border-2
                              border-yellow-400 overflow-hidden
                              bg-yellow-50">
                <img
                  src="/logo.jpg"
                  alt="Logo"
                  className="w-full h-full object-cover object-top"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '📚';
                  }}
                />
              </div>
              <p className="font-bold">
                {settings.shop_name || 'Ayyanar Book Centre'}
              </p>
            </div>
            <p className="text-green-300 text-xs">
              {settings.shop_address || 'Dindigul, Tamil Nadu'}
            </p>
            {settings.branch_2_name && (
              <div className="mt-2">
                <p className="text-green-400 text-xs font-medium">
                  Branch 2:
                </p>
                <p className="text-green-300 text-xs">
                  {settings.branch_2_name}
                </p>
                <p className="text-green-300 text-xs">
                  {settings.branch_2_address}
                </p>
              </div>
            )}
          </div>

          {/* Contact — Dynamic from Settings */}
          <div>
            <p className="font-bold mb-3">Contact Us</p>
            <div className="space-y-1 text-green-300 text-xs">
              <p>📞 {settings.phone || '+91 9894235330'}</p>
              {settings.branch_2_phone && (
                <p>📞 Branch 2: {settings.branch_2_phone}</p>
              )}
              <p>✉️ {settings.email || 'ayyanarbookcentredgl1@gmail.com'}</p>
              <p>📸 {settings.instagram || '@ayyanarbookcentre'}</p>
              <p>🕐 {settings.working_hours || 'Mon-Sat: 9AM-8PM'}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-bold mb-3">Quick Links</p>
            <div className="space-y-1">
              {[
                { href: '/products', label: '📚 Products' },
                { href: '/wholesale', label: '🏭 Wholesale' },
                { href: '/orders', label: '📦 Track Order' },
                { href: '/my-orders', label: '📋 My Orders' },
                { href: '/terms', label: '📋 Terms & Conditions' },
              ].map((link) => (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className="block text-green-300 hover:text-yellow-400
                             text-xs transition-colors text-left">
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <p className="font-bold mb-3">Delivery Info</p>
            <div className="space-y-1 text-green-300 text-xs">
              <p>🆓 Under 1kg — FREE</p>
              <p>🏠 Tamil Nadu — Rs.80</p>
              <p>📦 Other States — Rs.150</p>
              <p>✈️ International — Rs.800+</p>
              <button
                onClick={() => navigate('/terms')}
                className="text-yellow-400 hover:underline block mt-2
                           text-left">
                Full delivery policy →
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 text-center"
          style={{ borderColor: '#2d5a3d' }}>
          <p className="text-green-400 text-xs">
            © 2025 {settings.shop_name || 'Ayyanar Book Centre'}.
            All rights reserved.
          </p>
          <p className="text-green-500 text-xs mt-1 italic">
            "{settings.tagline || 'Knowledge is the floor of success'}"
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
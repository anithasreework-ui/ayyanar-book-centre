import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const CATEGORIES = [
  'state_board', 'tnpsc', 'cbse', 'central_competitive',
  'ncert', 'medical', 'stationery', 'children', 'novels',
  'motivational', 'gifts', 'projects', 'combos', 'wholesale',
];

const STATUS_OPTIONS = [
  'pending', 'confirmed', 'packed', 'shipped',
  'delivered', 'cancelled',
];

const TABS = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'orders', icon: '📦', label: 'Orders' },
  { key: 'payments', icon: '💳', label: 'Payments' },
  { key: 'products', icon: '📚', label: 'Products' },
  { key: 'add_product', icon: '➕', label: 'Add Product' },
  { key: 'discounts', icon: '🏷️', label: 'Discounts' },
  { key: 'excel_upload', icon: '📊', label: 'Excel Upload' },
  { key: 'wholesale', icon: '🏭', label: 'Wholesale' },
  { key: 'shop_settings', icon: '⚙️', label: 'Shop Settings' },
];

// ===== DISCOUNT ROW COMPONENT =====
const DiscountRow = ({
  product, headers, onSaved, API
}: any) => {
  const [mrp, setMrp] = useState(
    product.mrp ? String(product.mrp) : ''
  );
  const [price, setPrice] = useState(String(product.price));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const discount = mrp && parseFloat(mrp) > parseFloat(price)
    ? Math.round(
        ((parseFloat(mrp) - parseFloat(price)) /
          parseFloat(mrp)) * 100
      )
    : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API}/admin/products/${product.id}`,
        {
          name: product.name,
          price: parseFloat(price),
          mrp: mrp ? parseFloat(mrp) : null,
          stock_qty: product.stock_qty,
          category: product.category,
          subcategory: product.subcategory,
          description: product.description,
          image_url: product.image_url,
          is_available: product.is_available,
        },
        { headers }
      );
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('Save failed!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3 max-w-48">
        <p className="font-medium text-gray-800 truncate text-sm">
          {product.name}
        </p>
      </td>
      <td className="p-3">
        <span className="bg-green-100 text-green-800 px-2 py-0.5
                         rounded text-xs whitespace-nowrap">
          {product.category.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="p-3">
        <input
          type="number"
          value={mrp}
          onChange={(e) => setMrp(e.target.value)}
          placeholder="No MRP"
          className="border rounded-lg px-2 py-1 text-sm w-24
                     focus:outline-none focus:border-green-500"
        />
      </td>
      <td className="p-3">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border rounded-lg px-2 py-1 text-sm w-24
                     focus:outline-none focus:border-green-500"
        />
      </td>
      <td className="p-3">
        {discount > 0 ? (
          <div>
            <span className="bg-red-100 text-red-600 text-xs
                             font-bold px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
            <p className="text-xs text-gray-400 mt-1">
              Save Rs.{(parseFloat(mrp) -
                parseFloat(price)).toFixed(0)}
            </p>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">
            No discount
          </span>
        )}
      </td>
      <td className="p-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-white text-xs px-3 py-1.5 rounded-lg
                     font-medium transition-all disabled:opacity-50"
          style={{
            background: saved
              ? '#16a34a'
              : '#1a4a2e',
          }}>
          {saving ? '...' : saved ? '✓ Saved' : 'Save'}
        </button>
      </td>
    </tr>
  );
};

// ===== CATEGORY BULK DISCOUNT =====
const CategoryBulkDiscount = ({
  products, headers, onSaved, API
}: any) => {
  const [selectedCat, setSelectedCat] = useState('');
  const [discountPct, setDiscountPct] = useState('');
  const [applying, setApplying] = useState(false);

  const CATS = [
    'state_board', 'tnpsc', 'cbse', 'central_competitive',
    'ncert', 'medical', 'stationery', 'children', 'novels',
    'motivational', 'gifts', 'projects', 'combos', 'wholesale',
  ];

  const handleApply = async () => {
    if (!selectedCat || !discountPct) {
      alert('Select category and enter discount %!');
      return;
    }
    const pct = parseFloat(discountPct);
    if (pct <= 0 || pct >= 100) {
      alert('Enter valid discount (1-99)%!');
      return;
    }
    if (!window.confirm(
      `Apply ${pct}% discount to ALL ${selectedCat} products?`
    )) return;

    setApplying(true);
    const catProducts = products.filter(
      (p: any) => p.category === selectedCat
    );

    let updated = 0;
    for (const p of catProducts) {
      try {
        const mrp = p.mrp || p.price;
        const newPrice = parseFloat(
          (mrp * (1 - pct / 100)).toFixed(2)
        );
        await axios.put(
          `${API}/admin/products/${p.id}`,
          {
            name: p.name,
            price: newPrice,
            mrp: mrp,
            stock_qty: p.stock_qty,
            category: p.category,
            subcategory: p.subcategory,
            description: p.description,
            image_url: p.image_url,
            is_available: p.is_available,
          },
          { headers }
        );
        updated++;
      } catch { }
    }
    setApplying(false);
    alert(`✅ Discount applied to ${updated} products!`);
    onSaved();
    setDiscountPct('');
  };

  const catProducts = products.filter(
    (p: any) => p.category === selectedCat
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border
                    border-gray-100 p-6">
      <h3 className="text-lg font-bold mb-1">
        Apply Bulk Discount by Category
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Set same discount % for all products in a category at once
      </p>

      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <label className="text-sm font-medium text-gray-700
                             block mb-1">
            Category
          </label>
          <select value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:border-green-500">
            <option value="">Select Category</option>
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ').toUpperCase()}
                {' '}({products.filter(
                  (p: any) => p.category === c
                ).length} products)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700
                             block mb-1">
            Discount %
          </label>
          <input
            type="number"
            value={discountPct}
            onChange={(e) => setDiscountPct(e.target.value)}
            placeholder="e.g. 10"
            min="1" max="99"
            className="border rounded-lg px-3 py-2 text-sm w-28
                       focus:outline-none focus:border-green-500"
          />
        </div>

        <button
          onClick={handleApply}
          disabled={applying || !selectedCat || !discountPct}
          className="text-white px-5 py-2 rounded-lg font-bold
                     text-sm disabled:opacity-50 transition-all"
          style={{ background: '#1a4a2e' }}>
          {applying ? 'Applying...' : 'Apply Discount'}
        </button>
      </div>

      {selectedCat && catProducts.length > 0 && (
        <div className="mt-4 p-3 rounded-xl text-sm"
          style={{ background: '#f0f7f4',
                   border: '1px solid #a8d5b5' }}>
          <p style={{ color: '#1a4a2e' }} className="font-medium">
            Preview: {catProducts.length} products in{' '}
            {selectedCat.replace(/_/g, ' ')}
          </p>
          {discountPct && (
            <p className="text-gray-600 mt-1">
              Discount {discountPct}% will be applied to all
              {catProducts.length} products
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterType, setFilterType] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [editProduct, setEditProduct] = useState<any>(null);
  const [shopSettings, setShopSettings] = useState<any>({});
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(
    new Set(['dashboard'])
  );
  const [tabLoading, setTabLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '',
    mrp: '', category: '', subcategory: '',
    stock_qty: '', image_url: '',
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { Authorization: `Bearer ${token}` };

  // ===== FETCH FUNCTIONS — Lazy Load =====
  const fetchStats = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        axios.get(`${API}/products/`),
        axios.get(`${API}/admin/stats`, { headers }),
      ]);
      setProducts(pRes.data);
      setStats(sRes.data);
    } catch (err) {
      console.log('Stats fetch error', err);
    }
  };

  const fetchOrders = async () => {
    setTabLoading(true);
    try {
      const res = await axios.get(
        `${API}/admin/orders`, { headers }
      );
      setOrders(res.data);
    } catch (err) {
      console.log('Orders fetch error', err);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchPayments = async () => {
    setTabLoading(true);
    try {
      const res = await axios.get(
        `${API}/payment/admin/all`, { headers }
      );
      setPayments(res.data);
    } catch {
      setPayments([]);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    setTabLoading(true);
    try {
      const res = await axios.get(
        `${API}/admin/wholesale-enquiries`, { headers }
      );
      setEnquiries(res.data);
    } catch {
      setEnquiries([]);
    } finally {
      setTabLoading(false);
    }
  };

  const fetchSettings = async () => {
    setTabLoading(true);
    try {
      const res = await axios.get(
        `${API}/settings/all`, { headers }
      );
      const obj: any = {};
      res.data.forEach((s: any) => { obj[s.key] = s.value; });
      setShopSettings(obj);
    } catch { }
    finally {
      setTabLoading(false);
    }
  };

  // Initial load — Dashboard only
  useEffect(() => {
    if (!token || user.role !== 'admin') {
      alert('Admin access only!');
      navigate('/login');
      return;
    }
    fetchStats();
  }, []);

  // Tab change — Lazy load
  useEffect(() => {
    if (loadedTabs.has(activeTab)) return;
    setLoadedTabs(prev => new Set([...prev, activeTab]));

    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'wholesale') fetchEnquiries();
    if (activeTab === 'shop_settings') fetchSettings();
    if (activeTab === 'products' && products.length === 0) {
      fetchStats();
    }
  }, [activeTab]);

  // ===== ACTION FUNCTIONS =====
  const updateOrderStatus = async (
    orderId: number, status: string
  ) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status`,
        { status }, { headers }
      );
      setOrders(orders.map((o: any) =>
        o.id === orderId ? { ...o, status } : o
      ));
    } catch {
      alert('Update failed!');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(
        `${API}/admin/products/${id}`, { headers }
      );
      setProducts(products.filter((p: any) => p.id !== id));
    } catch {
      alert('Delete failed!');
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price ||
        !newProduct.category) {
      alert('Name, price and category are required!');
      return;
    }
    try {
      await axios.post(
        `${API}/admin/products`,
        {
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          mrp: newProduct.mrp
            ? parseFloat(newProduct.mrp)
            : null,
          category: newProduct.category,
          subcategory: newProduct.subcategory,
          stock_qty: parseInt(newProduct.stock_qty) || 0,
          image_url: newProduct.image_url,
        },
        { headers }
      );
      alert('✅ Product added!');
      setNewProduct({
        name: '', description: '', price: '',
        mrp: '', category: '', subcategory: '',
        stock_qty: '', image_url: '',
      });
      // Refresh products
      fetchStats();
      setActiveTab('products');
    } catch {
      alert('Failed to add product!');
    }
  };

  const saveEditProduct = async () => {
    if (!editProduct) return;
    try {
      await axios.put(
        `${API}/admin/products/${editProduct.id}`,
        {
          name: editProduct.name,
          price: parseFloat(editProduct.price),
          mrp: editProduct.mrp
            ? parseFloat(editProduct.mrp)
            : null,
          stock_qty: parseInt(editProduct.stock_qty),
          category: editProduct.category,
          subcategory: editProduct.subcategory,
          description: editProduct.description,
          image_url: editProduct.image_url,
          is_available: editProduct.is_available,
        },
        { headers }
      );
      alert('✅ Product updated!');
      setEditProduct(null);
      fetchStats();
    } catch {
      alert('Update failed!');
    }
  };

  const handleExcelUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(
        `${API}/admin/upload-excel`, formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert(`✅ ${res.data.message}`);
      fetchStats();
    } catch {
      alert('Upload failed! Check Excel format.');
    }
    e.target.value = '';
  };

  const saveSettings = async () => {
    try {
      await axios.put(
        `${API}/settings/bulk-update`,
        { settings: shopSettings },
        { headers }
      );
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch {
      alert('Save failed!');
    }
  };

  // ===== COMPUTED VALUES =====
  const filteredOrders = orders.filter((o: any) => {
    if (filterType === 'pickup')
      return o.delivery_type === 'store_pickup';
    if (filterType === 'online')
      return o.delivery_type === 'home_delivery';
    return true;
  });

  const filteredPayments = payments.filter((p: any) => {
    if (paymentFilter === 'upi')
      return p.payment_method === 'upi';
    if (paymentFilter === 'cod')
      return p.payment_method === 'cash_on_delivery';
    if (paymentFilter === 'pickup')
      return p.payment_method === 'store_pickup';
    if (paymentFilter === 'success')
      return p.status === 'success';
    if (paymentFilter === 'pending')
      return p.status === 'pending';
    return true;
  });

  const totalRevenue = payments
    .filter((p: any) => p.status === 'success')
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  const getDiscount = (price: number, mrp: number) => {
    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  // ===== TAB LOADING SPINNER =====
  const TabLoader = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200
                        mx-auto mb-3 animate-spin"
          style={{ borderTopColor: '#1a4a2e' }} />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== HEADER ===== */}
      <div className="text-white px-6 py-4 flex justify-between
                      items-center"
        style={{ background: '#1a3d2b' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2
                          border-yellow-400 overflow-hidden bg-yellow-50">
            <img src="/logo.jpg" alt="Logo"
              className="w-full h-full object-cover object-top"
              onError={(e: any) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs" style={{ color: '#86efac' }}>
              Ayyanar Book Centre — Dindigul
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-yellow-300">Shop Owner</p>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="bg-white border-b border-gray-200 px-4
                      overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm
                         font-medium whitespace-nowrap border-b-2
                         transition-all ${
                activeTab === tab.key
                  ? 'border-green-700 text-green-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <span>{tab.icon}</span>
              {tab.label}
              {tab.key === 'wholesale' &&
               enquiries.length > 0 && (
                <span className="bg-red-500 text-white text-xs
                                 rounded-full px-1.5 py-0.5 min-w-5
                                 text-center">
                  {enquiries.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ===== DASHBOARD ===== */}
        {activeTab === 'dashboard' && (
          <div>
            {!stats ? (
              <TabLoader />
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4
                                gap-4 mb-6">
                  {[
                    {
                      label: 'Products',
                      value: stats.total_products,
                      icon: '📚',
                      action: () => setActiveTab('products'),
                    },
                    {
                      label: 'Total Orders',
                      value: stats.total_orders,
                      icon: '📦',
                      action: () => setActiveTab('orders'),
                    },
                    {
                      label: 'Customers',
                      value: stats.total_users,
                      icon: '👥',
                      action: null,
                    },
                    {
                      label: 'Pending Orders',
                      value: stats.pending_orders,
                      icon: '⏳',
                      action: () => setActiveTab('orders'),
                    },
                  ].map((stat) => (
                    <button key={stat.label}
                      onClick={stat.action || undefined}
                      className={`bg-white rounded-xl shadow-sm
                                 border border-gray-100 p-5
                                 text-left transition-all ${
                        stat.action
                          ? 'hover:shadow-md cursor-pointer'
                          : 'cursor-default'
                      }`}>
                      <p className="text-3xl mb-2">{stat.icon}</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {stat.label}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Revenue */}
                <div className="bg-white rounded-xl shadow-sm border
                                border-gray-100 p-6 mb-4">
                  <p className="text-sm text-gray-500 mb-1">
                    Total Revenue
                  </p>
                  <p className="text-4xl font-bold"
                    style={{ color: '#1a4a2e' }}>
                    Rs.{(stats.total_revenue || 0).toFixed(2)}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4
                                gap-4">
                  {[
                    {
                      label: 'Add Product', icon: '➕',
                      action: () => setActiveTab('add_product'),
                      bg: '#1a4a2e',
                    },
                    {
                      label: 'View Orders', icon: '📦',
                      action: () => setActiveTab('orders'),
                      bg: '#065f46',
                    },
                    {
                      label: 'Payments', icon: '💳',
                      action: () => setActiveTab('payments'),
                      bg: '#1e40af',
                    },
                    {
                      label: 'Shop Settings', icon: '⚙️',
                      action: () => setActiveTab('shop_settings'),
                      bg: '#7c3aed',
                    },
                  ].map((item) => (
                    <button key={item.label}
                      onClick={item.action}
                      className="text-white rounded-xl p-4 text-left
                                 hover:opacity-90 transition-all"
                      style={{ background: item.bg }}>
                      <p className="text-2xl mb-1">{item.icon}</p>
                      <p className="font-bold text-sm">{item.label}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== ORDERS ===== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border
                          border-gray-100">
            <div className="p-4 border-b flex justify-between
                            items-center flex-wrap gap-3">
              <h2 className="text-lg font-bold">
                Orders ({filteredOrders.length})
              </h2>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all', label: '📋 All' },
                  { key: 'online', label: '🚚 Online' },
                  { key: 'pickup', label: '🏪 Pickup' },
                ].map((f) => (
                  <button key={f.key}
                    onClick={() => setFilterType(f.key)}
                    className={`px-3 py-1 rounded-full text-sm
                               font-medium transition-all ${
                      filterType === f.key
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={filterType === f.key
                      ? { background: '#1a4a2e' } : {}}>
                    {f.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setLoadedTabs(new Set(['dashboard']));
                    fetchOrders();
                  }}
                  className="px-3 py-1 rounded-full text-sm
                             bg-gray-100 text-gray-600
                             hover:bg-gray-200">
                  🔄 Refresh
                </button>
              </div>
            </div>

            {tabLoading ? <TabLoader /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Order ID', 'Amount', 'Type',
                        'OTP/Track', 'Phone',
                        'Status', 'Update'].map((h) => (
                        <th key={h}
                          className="text-left p-3 text-gray-600
                                     font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o: any) => (
                      <tr key={o.id}
                        className="border-t hover:bg-gray-50">
                        <td className="p-3 font-bold"
                          style={{ color: '#1a4a2e' }}>
                          #{o.id}
                        </td>
                        <td className="p-3 font-bold
                                       text-green-600
                                       whitespace-nowrap">
                          Rs.{o.total_amount}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded
                                           text-xs font-medium
                                           whitespace-nowrap ${
                            o.delivery_type === 'store_pickup'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {o.delivery_type === 'store_pickup'
                              ? '🏪 Pickup'
                              : '🚚 Online'}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold
                                       text-sm text-gray-700">
                          {o.otp_code || o.tracking_id || '-'}
                        </td>
                        <td className="p-3 text-gray-600">
                          {o.phone || '-'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded
                                           text-xs font-medium ${
                            o.status === 'delivered'
                              ? 'bg-green-100 text-green-700'
                              : o.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : o.status === 'shipped'
                              ? 'bg-blue-100 text-blue-700'
                              : o.status === 'confirmed'
                              ? 'bg-teal-100 text-teal-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              updateOrderStatus(
                                o.id, e.target.value
                              )
                            }
                            className="border rounded px-2 py-1
                                       text-xs focus:outline-none">
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-gray-400">No orders yet!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== PAYMENTS ===== */}
        {activeTab === 'payments' && (
          <div>
            {/* Payment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4
                            gap-4 mb-4">
              {[
                {
                  label: 'Total Revenue',
                  value: `Rs.${totalRevenue.toFixed(0)}`,
                  icon: '💰',
                  bg: '#1a4a2e',
                },
                {
                  label: 'UPI Payments',
                  value: payments.filter(
                    (p: any) => p.payment_method === 'upi'
                      && p.status === 'success'
                  ).length,
                  icon: '📱',
                  bg: '#1e40af',
                },
                {
                  label: 'COD Orders',
                  value: payments.filter(
                    (p: any) =>
                      p.payment_method === 'cash_on_delivery'
                  ).length,
                  icon: '💵',
                  bg: '#92400e',
                },
                {
                  label: 'Store Pickup',
                  value: payments.filter(
                    (p: any) =>
                      p.payment_method === 'store_pickup'
                  ).length,
                  icon: '🏪',
                  bg: '#4c1d95',
                },
              ].map((stat) => (
                <div key={stat.label}
                  className="rounded-xl p-4 text-white"
                  style={{ background: stat.bg }}>
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs opacity-80 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border
                            border-gray-100">
              <div className="p-4 border-b flex justify-between
                              items-center flex-wrap gap-3">
                <h2 className="text-lg font-bold">
                  💳 Payments ({filteredPayments.length})
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'upi', label: '📱 UPI' },
                    { key: 'cod', label: '💵 COD' },
                    { key: 'pickup', label: '🏪 Pickup' },
                    { key: 'success', label: '✅ Paid' },
                    { key: 'pending', label: '⏳ Pending' },
                  ].map((f) => (
                    <button key={f.key}
                      onClick={() => setPaymentFilter(f.key)}
                      className={`px-3 py-1 rounded-full text-xs
                                 font-medium transition-all ${
                        paymentFilter === f.key
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      style={paymentFilter === f.key
                        ? { background: '#1a4a2e' } : {}}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {tabLoading ? <TabLoader /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['#', 'Order', 'Amount', 'Method',
                          'Status', 'Transaction ID',
                          'Date'].map((h) => (
                          <th key={h}
                            className="text-left p-3 text-gray-600
                                       font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((p: any) => (
                        <tr key={p.id}
                          className="border-t hover:bg-gray-50">
                          <td className="p-3 text-gray-400 text-xs">
                            {p.id}
                          </td>
                          <td className="p-3 font-bold"
                            style={{ color: '#1a4a2e' }}>
                            #{p.order_id}
                          </td>
                          <td className="p-3 font-bold
                                         text-green-600
                                         whitespace-nowrap">
                            Rs.{p.amount}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded
                                             text-xs font-medium ${
                              p.payment_method ===
                              'cash_on_delivery'
                                ? 'bg-orange-100 text-orange-700'
                                : p.payment_method === 'upi'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {p.payment_method ===
                              'cash_on_delivery'
                                ? '💵 COD'
                                : p.payment_method === 'upi'
                                ? '📱 UPI'
                                : '🏪 Pickup'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded
                                             text-xs font-medium ${
                              p.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : p.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {p.status === 'success'
                                ? '✅ Paid'
                                : p.status === 'pending'
                                ? '⏳ Pending'
                                : '❌ Failed'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-xs
                                         text-gray-400 max-w-32
                                         truncate">
                            {p.transaction_id || '-'}
                          </td>
                          <td className="p-3 text-gray-400 text-xs
                                         whitespace-nowrap">
                            {new Date(p.created_at)
                              .toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPayments.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-4xl mb-2">💳</p>
                      <p className="text-gray-400">
                        No payments yet!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== PRODUCTS ===== */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border
                          border-gray-100">
            <div className="p-4 border-b flex justify-between
                            items-center">
              <h2 className="text-lg font-bold">
                Products ({products.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchStats}
                  className="border border-gray-200 text-gray-500
                             px-3 py-2 rounded-lg text-sm
                             hover:bg-gray-50">
                  🔄 Refresh
                </button>
                <button
                  onClick={() => setActiveTab('add_product')}
                  className="text-white px-4 py-2 rounded-lg
                             text-sm font-medium hover:opacity-90"
                  style={{ background: '#1a4a2e' }}>
                  ➕ Add New
                </button>
              </div>
            </div>

            {/* Edit Modal */}
            {editProduct && (
              <div className="fixed inset-0 bg-black bg-opacity-50
                              z-50 flex items-center justify-center
                              p-4">
                <div className="bg-white rounded-2xl p-6 w-full
                                max-w-md max-h-screen overflow-y-auto
                                shadow-2xl">
                  <h3 className="text-lg font-bold mb-4">
                    ✏️ Edit Product
                  </h3>
                  <div className="space-y-3">

                    {/* Text Fields */}
                    {[
                      { key: 'name', label: 'Product Name',
                        type: 'text' },
                      { key: 'price',
                        label: 'Selling Price (Rs.) *',
                        type: 'number' },
                      { key: 'mrp',
                        label: 'MRP / Original Price (Rs.)',
                        type: 'number' },
                      { key: 'stock_qty', label: 'Stock Qty',
                        type: 'number' },
                      { key: 'subcategory',
                        label: 'Sub Category', type: 'text' },
                      { key: 'image_url', label: 'Image URL',
                        type: 'text' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-sm font-medium
                                          text-gray-700">
                          {f.label}
                        </label>
                        <input type={f.type}
                          value={editProduct[f.key] || ''}
                          onChange={(e) => setEditProduct({
                            ...editProduct,
                            [f.key]: e.target.value
                          })}
                          className="w-full border rounded-lg
                                     px-3 py-2 mt-1 text-sm
                                     focus:outline-none
                                     focus:border-green-500"
                        />
                      </div>
                    ))}

                    {/* Live Discount Preview */}
                    {editProduct.mrp && editProduct.price &&
                     parseFloat(editProduct.mrp) >
                     parseFloat(editProduct.price) && (
                      <div className="rounded-xl p-3 text-sm"
                        style={{
                          background: '#f0f7f4',
                          border: '1px solid #a8d5b5'
                        }}>
                        <p className="font-medium text-sm mb-1"
                          style={{ color: '#1a4a2e' }}>
                          🏷️ Discount Preview:
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400
                                           line-through text-sm">
                            Rs.{editProduct.mrp}
                          </span>
                          <span className="font-bold text-lg"
                            style={{ color: '#1a4a2e' }}>
                            Rs.{editProduct.price}
                          </span>
                          <span className="bg-red-100 text-red-600
                                           text-xs font-bold px-2
                                           py-0.5 rounded-full">
                            {getDiscount(
                              parseFloat(editProduct.price),
                              parseFloat(editProduct.mrp)
                            )}% OFF
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Customer saves Rs.{(
                            parseFloat(editProduct.mrp) -
                            parseFloat(editProduct.price)
                          ).toFixed(0)}
                        </p>
                      </div>
                    )}

                    {/* Image Preview */}
                    {editProduct.image_url && (
                      <div>
                        <p className="text-sm font-medium
                                      text-gray-700 mb-1">
                          Image Preview
                        </p>
                        <img src={editProduct.image_url}
                          alt="Preview"
                          className="w-20 h-20 object-cover
                                     rounded-lg border"
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Category */}
                    <div>
                      <label className="text-sm font-medium
                                        text-gray-700">
                        Category
                      </label>
                      <select value={editProduct.category || ''}
                        onChange={(e) => setEditProduct({
                          ...editProduct,
                          category: e.target.value
                        })}
                        className="w-full border rounded-lg px-3
                                   py-2 mt-1 text-sm
                                   focus:outline-none">
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-sm font-medium
                                        text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={editProduct.description || ''}
                        onChange={(e) => setEditProduct({
                          ...editProduct,
                          description: e.target.value
                        })}
                        rows={3}
                        className="w-full border rounded-lg px-3
                                   py-2 mt-1 text-sm
                                   focus:outline-none resize-none"
                      />
                    </div>

                    {/* Available Toggle */}
                    <label className="flex items-center gap-3
                                      cursor-pointer p-3 rounded-xl
                                      bg-gray-50">
                      <input type="checkbox"
                        checked={editProduct.is_available}
                        onChange={(e) => setEditProduct({
                          ...editProduct,
                          is_available: e.target.checked
                        })}
                        className="w-4 h-4 accent-green-700"
                      />
                      <div>
                        <p className="text-sm font-medium
                                      text-gray-700">
                          Available on website
                        </p>
                        <p className="text-xs text-gray-400">
                          Uncheck to hide from customers
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button onClick={saveEditProduct}
                      className="flex-1 text-white py-2.5
                                 rounded-xl font-bold
                                 hover:opacity-90 transition"
                      style={{ background: '#1a4a2e' }}>
                      ✅ Save Changes
                    </button>
                    <button onClick={() => setEditProduct(null)}
                      className="flex-1 border border-gray-200
                                 py-2.5 rounded-xl text-gray-600
                                 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Image', 'Name', 'Price / MRP',
                      'Category', 'Stock', 'Status',
                      'Actions'].map((h) => (
                      <th key={h}
                        className="text-left p-3 text-gray-600
                                   font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p: any) => (
                    <tr key={p.id}
                      className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div className="w-12 h-12 rounded-lg
                                        overflow-hidden border
                                        border-gray-100 bg-gray-50
                                        flex items-center
                                        justify-center">
                          {p.image_url ? (
                            <img src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML =
                                  '<span class="text-xl">📚</span>';
                              }}
                            />
                          ) : (
                            <span className="text-xl">📚</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 max-w-48">
                        <p className="font-medium text-gray-800
                                       truncate text-sm">
                          {p.name}
                        </p>
                        {p.subcategory && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {p.subcategory}
                          </p>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <p className="font-bold text-green-600">
                          Rs.{p.price}
                        </p>
                        {p.mrp && p.mrp > p.price && (
                          <div className="flex items-center gap-1
                                          mt-0.5">
                            <span className="text-xs
                                             text-gray-400
                                             line-through">
                              Rs.{p.mrp}
                            </span>
                            <span className="text-xs text-red-500
                                             font-medium">
                              -{getDiscount(p.price, p.mrp)}%
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-800
                                         px-2 py-0.5 rounded text-xs
                                         whitespace-nowrap">
                          {p.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold text-sm ${
                          p.stock_qty > 10
                            ? 'text-green-600'
                            : p.stock_qty > 0
                            ? 'text-yellow-600'
                            : 'text-red-500'
                        }`}>
                          {p.stock_qty}
                          {p.stock_qty === 0 && ' ⚠️'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded
                                         text-xs font-medium ${
                          p.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {p.is_available ? '✅ Live' : '❌ Hidden'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditProduct(p)}
                            className="text-xs font-medium border
                                       border-blue-200 text-blue-600
                                       px-2 py-1 rounded-lg
                                       hover:bg-blue-50">
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="text-xs font-medium border
                                       border-red-200 text-red-500
                                       px-2 py-1 rounded-lg
                                       hover:bg-red-50">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-4xl mb-2">📚</p>
                  <p className="text-gray-400">No products yet!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ADD PRODUCT ===== */}
        {activeTab === 'add_product' && (
          <div className="bg-white rounded-xl shadow-sm border
                          border-gray-100 p-6 max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              ➕ Add New Product
            </h2>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Product Name *',
                  type: 'text',
                  ph: 'e.g. TNPSC Group 2 Complete Guide' },
                { key: 'price', label: 'Selling Price (Rs.) *',
                  type: 'number', ph: 'e.g. 180' },
                { key: 'mrp',
                  label: 'MRP / Original Price (Optional)',
                  type: 'number', ph: 'e.g. 200' },
                { key: 'stock_qty', label: 'Stock Qty *',
                  type: 'number', ph: 'e.g. 50' },
                { key: 'subcategory', label: 'Sub Category',
                  type: 'text', ph: 'e.g. Group 2, Class 10' },
                { key: 'image_url', label: 'Image URL',
                  type: 'text',
                  ph: 'https://... or Google Drive link' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-medium
                                    text-gray-700">
                    {f.label}
                  </label>
                  <input type={f.type}
                    value={(newProduct as any)[f.key]}
                    placeholder={f.ph}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      [f.key]: e.target.value
                    })}
                    className="w-full border rounded-lg px-3 py-2
                               mt-1 text-sm focus:outline-none
                               focus:border-green-500"
                  />
                </div>
              ))}

              {/* Live Discount Preview — Add Product */}
              {newProduct.mrp && newProduct.price &&
               parseFloat(newProduct.mrp) >
               parseFloat(newProduct.price) && (
                <div className="rounded-xl p-3 text-sm"
                  style={{
                    background: '#f0f7f4',
                    border: '1px solid #a8d5b5'
                  }}>
                  <p className="font-medium mb-1"
                    style={{ color: '#1a4a2e' }}>
                    🏷️ Discount Preview:
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400
                                     line-through text-sm">
                      Rs.{newProduct.mrp}
                    </span>
                    <span className="font-bold text-lg"
                      style={{ color: '#1a4a2e' }}>
                      Rs.{newProduct.price}
                    </span>
                    <span className="bg-red-100 text-red-600
                                     text-xs font-bold px-2 py-0.5
                                     rounded-full">
                      {getDiscount(
                        parseFloat(newProduct.price),
                        parseFloat(newProduct.mrp)
                      )}% OFF
                    </span>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {newProduct.image_url && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Preview:
                  </p>
                  <img src={newProduct.image_url}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg
                               border"
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select value={newProduct.category}
                  onChange={(e) => setNewProduct({
                    ...newProduct, category: e.target.value
                  })}
                  className="w-full border rounded-lg px-3 py-2
                             mt-1 text-sm focus:outline-none
                             focus:border-green-500">
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea value={newProduct.description}
                  onChange={(e) => setNewProduct({
                    ...newProduct, description: e.target.value
                  })}
                  placeholder="Describe the product..."
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2
                             mt-1 text-sm focus:outline-none
                             focus:border-green-500 resize-none"
                />
              </div>

              <button onClick={addProduct}
                className="w-full text-white py-3 rounded-xl
                           font-bold hover:opacity-90 text-base
                           transition-all"
                style={{ background: '#1a4a2e' }}>
                ✅ Add Product
              </button>
            </div>
          </div>
        )}

        {/* ===== EXCEL UPLOAD ===== */}
        {activeTab === 'excel_upload' && (
          <div className="bg-white rounded-xl shadow-sm border
                          border-gray-100 p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-2">
              📊 Upload via Excel / Google Sheets
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Google Sheets → File → Download → Excel (.xlsx)
              → Upload here
            </p>

            {/* Format Guide */}
            <div className="rounded-xl p-4 mb-4"
              style={{
                background: '#f0f7f4',
                border: '1px solid #a8d5b5'
              }}>
              <p className="font-medium mb-2 text-sm"
                style={{ color: '#1a4a2e' }}>
                📋 Required Columns:
              </p>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse w-full">
                  <thead>
                    <tr className="bg-green-100">
                      {['name *', 'category *', 'price *',
                        'stock_qty *', 'mrp', 'description',
                        'image_url', 'subcategory'].map((h) => (
                        <th key={h}
                          className="border border-green-200
                                     px-2 py-1 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {['TNPSC Guide', 'tnpsc', '180', '50',
                        '200', 'Best guide', 'https://...',
                        'Group 2'].map((v) => (
                        <td key={v}
                          className="border border-green-200
                                     px-2 py-1 text-gray-600">
                          {v}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="font-medium text-gray-700 mb-2 text-sm">
                Valid Category Values:
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <span key={c}
                    className="bg-white border border-gray-200
                               px-2 py-1 rounded text-xs
                               text-gray-600 font-mono">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Upload */}
            <label className="block w-full border-2 border-dashed
                              rounded-xl p-10 text-center
                              cursor-pointer hover:bg-green-50
                              transition-all"
              style={{ borderColor: '#86efac' }}>
              <input type="file" accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
              />
              <p className="text-5xl mb-3">📊</p>
              <p className="font-bold text-gray-700">
                Click to upload Excel file
              </p>
              <p className="text-xs text-gray-400 mt-1">
                .xlsx or .xls files only
              </p>
            </label>
          </div>
        )}

        {/* ===== DISCOUNTS ===== */}
        {activeTab === 'discounts' && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border
                            border-gray-100 p-6 mb-4">
              <h2 className="text-xl font-bold mb-1">
                🏷️ Manage Discounts
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Edit MRP and selling price for each product to
                set discount. Customers see the % off automatically.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Product', 'Category', 'MRP (Rs.)',
                        'Sell Price (Rs.)', 'Discount', 'Save'].map(
                        (h) => (
                          <th key={h}
                            className="text-left p-3 text-gray-600
                                       font-medium whitespace-nowrap">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p: any) => (
                      <DiscountRow
                        key={p.id}
                        product={p}
                        headers={headers}
                        onSaved={fetchStats}
                        API={API}
                      />
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-400">No products yet!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Bulk Discount */}
            <CategoryBulkDiscount
              products={products}
              headers={headers}
              onSaved={fetchStats}
              API={API}
            />
          </div>
        )}

        {/* ===== WHOLESALE ===== */}
        {activeTab === 'wholesale' && (
          <div className="bg-white rounded-xl shadow-sm border
                          border-gray-100">
            <div className="p-4 border-b flex justify-between
                            items-center">
              <h2 className="text-lg font-bold">
                🏭 Wholesale Enquiries ({enquiries.length})
              </h2>
              <button
                onClick={() => {
                  setLoadedTabs(new Set(['dashboard']));
                  fetchEnquiries();
                }}
                className="text-sm hover:underline"
                style={{ color: '#1a4a2e' }}>
                🔄 Refresh
              </button>
            </div>

            {tabLoading ? <TabLoader /> : (
              enquiries.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="text-gray-400">No enquiries yet!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['#', 'Store', 'Contact',
                          'Phone', 'Message', 'Date'].map((h) => (
                          <th key={h}
                            className="text-left p-3 text-gray-600
                                       font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {enquiries.map((e: any) => (
                        <tr key={e.id}
                          className="border-t hover:bg-gray-50">
                          <td className="p-3 font-bold"
                            style={{ color: '#1a4a2e' }}>
                            #{e.id}
                          </td>
                          <td className="p-3 font-medium">
                            {e.store_name || '—'}
                          </td>
                          <td className="p-3">{e.name}</td>
                          <td className="p-3">
                            <a href={`tel:${e.phone}`}
                              className="font-medium hover:underline"
                              style={{ color: '#1a4a2e' }}>
                              {e.phone}
                            </a>
                          </td>
                          <td className="p-3 text-gray-600
                                         max-w-48">
                            <p className="truncate"
                              title={e.message}>
                              {e.message || '—'}
                            </p>
                          </td>
                          <td className="p-3 text-gray-400
                                         text-xs whitespace-nowrap">
                            {new Date(e.created_at)
                              .toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}

        {/* ===== SHOP SETTINGS ===== */}
        {activeTab === 'shop_settings' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-sm border
                            border-gray-100 p-6">
              <h2 className="text-xl font-bold mb-1">
                ⚙️ Shop Settings
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Changes reflect on all pages instantly —
                chatbot, footer, terms, wholesale etc.
              </p>

              {tabLoading ? <TabLoader /> : (
                <>
                  {settingsSaved && (
                    <div className="rounded-xl p-3 mb-4 text-sm
                                    font-medium"
                      style={{
                        background: '#f0f7f4',
                        color: '#1a4a2e',
                        border: '1px solid #a8d5b5'
                      }}>
                      ✅ Settings saved successfully!
                    </div>
                  )}

                  <div className="space-y-4">

                    {/* Branch 1 */}
                    <div className="rounded-xl p-4"
                      style={{
                        background: '#f0f7f4',
                        border: '1px solid #a8d5b5'
                      }}>
                      <p className="font-bold mb-3 text-sm"
                        style={{ color: '#1a4a2e' }}>
                        🏪 Main Shop — Branch 1
                      </p>
                      <div className="space-y-3">
                        {[
                          { key: 'shop_name',
                            label: 'Shop Name' },
                          { key: 'shop_address',
                            label: 'Shop Address' },
                          { key: 'phone',
                            label: 'Phone Number' },
                          { key: 'customer_care',
                            label: 'Customer Care Number' },
                          { key: 'email', label: 'Email ID' },
                          { key: 'instagram',
                            label: 'Instagram Handle' },
                          { key: 'working_hours',
                            label: 'Working Hours' },
                          { key: 'tagline',
                            label: 'Shop Tagline' },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="text-sm font-medium
                                              text-gray-700">
                              {f.label}
                            </label>
                            <input type="text"
                              value={shopSettings[f.key] || ''}
                              onChange={(e) => setShopSettings({
                                ...shopSettings,
                                [f.key]: e.target.value
                              })}
                              className="w-full border rounded-lg
                                         px-3 py-2 mt-1 text-sm
                                         focus:outline-none
                                         focus:border-green-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Branch 2 */}
                    <div className="bg-blue-50 rounded-xl p-4
                                    border border-blue-100">
                      <p className="font-bold text-blue-800
                                     mb-1 text-sm">
                        🏪 Branch 2 (Optional)
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Fill when you open a new branch.
                        Leave blank if not applicable.
                      </p>
                      {[
                        { key: 'branch_2_name',
                          label: 'Branch 2 Name',
                          ph: 'e.g. Ayyanar Book Centre — Karur' },
                        { key: 'branch_2_address',
                          label: 'Branch 2 Address',
                          ph: 'Full address with pincode' },
                        { key: 'branch_2_phone',
                          label: 'Branch 2 Phone',
                          ph: '+91 XXXXXXXXXX' },
                      ].map((f) => (
                        <div key={f.key} className="mb-3">
                          <label className="text-sm font-medium
                                            text-gray-700">
                            {f.label}
                          </label>
                          <input type="text"
                            value={shopSettings[f.key] || ''}
                            placeholder={f.ph}
                            onChange={(e) => setShopSettings({
                              ...shopSettings,
                              [f.key]: e.target.value
                            })}
                            className="w-full border rounded-lg
                                       px-3 py-2 mt-1 text-sm
                                       focus:outline-none
                                       focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>

                    <button onClick={saveSettings}
                      className="w-full text-white py-3 rounded-xl
                                 font-bold hover:opacity-90
                                 transition-colors text-base"
                      style={{ background: '#1a4a2e' }}>
                      💾 Save All Settings
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
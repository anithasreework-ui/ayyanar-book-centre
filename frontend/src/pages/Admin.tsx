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
  { key: 'excel_upload', icon: '📊', label: 'Excel Upload' },
  { key: 'wholesale', icon: '🏭', label: 'Wholesale' },
  { key: 'shop_settings', icon: '⚙️', label: 'Shop Settings' },
];

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [enquiries, setEnquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterType, setFilterType] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [editProduct, setEditProduct] = useState<any>(null);
  const [shopSettings, setShopSettings] = useState<any>({});
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '',
    category: '', subcategory: '',
    stock_qty: '', image_url: '',
  });
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token || user.role !== 'admin') {
      alert('Admin access only!');
      navigate('/login');
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [pRes, oRes, sRes] = await Promise.all([
        axios.get(`${API}/products/`),
        axios.get(`${API}/admin/orders`, { headers }),
        axios.get(`${API}/admin/stats`, { headers }),
      ]);
      setProducts(pRes.data);
      setOrders(oRes.data);
      setStats(sRes.data);

      // Payments
      try {
        const payRes = await axios.get(
          `${API}/payment/admin/all`, { headers }
        );
        setPayments(payRes.data);
      } catch { setPayments([]); }

      // Wholesale
      try {
        const eRes = await axios.get(
          `${API}/admin/wholesale-enquiries`, { headers }
        );
        setEnquiries(eRes.data);
      } catch { setEnquiries([]); }

      // Settings
      try {
        const setRes = await axios.get(
          `${API}/settings/all`, { headers }
        );
        const obj: any = {};
        setRes.data.forEach((s: any) => { obj[s.key] = s.value; });
        setShopSettings(obj);
      } catch { }

    } catch (err) {
      console.log('Fetch error', err);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status`,
        { status }, { headers }
      );
      fetchAll();
    } catch { alert('Update failed!'); }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(
        `${API}/admin/products/${id}`, { headers }
      );
      fetchAll();
    } catch { alert('Delete failed!'); }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert('Name, price and category required!');
      return;
    }
    try {
      await axios.post(
        `${API}/admin/products`,
        {
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock_qty: parseInt(newProduct.stock_qty) || 0,
        },
        { headers }
      );
      alert('✅ Product added!');
      fetchAll();
      setNewProduct({
        name: '', description: '', price: '',
        category: '', subcategory: '',
        stock_qty: '', image_url: '',
      });
      setActiveTab('products');
    } catch { alert('Failed!'); }
  };

  const saveEditProduct = async () => {
    if (!editProduct) return;
    try {
      await axios.put(
        `${API}/admin/products/${editProduct.id}`,
        {
          name: editProduct.name,
          price: parseFloat(editProduct.price),
          stock_qty: parseInt(editProduct.stock_qty),
          category: editProduct.category,
          subcategory: editProduct.subcategory,
          description: editProduct.description,
          image_url: editProduct.image_url,
          is_available: editProduct.is_available,
        },
        { headers }
      );
      alert('✅ Updated!');
      setEditProduct(null);
      fetchAll();
    } catch { alert('Update failed!'); }
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
        { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }
      );
      alert(`✅ ${res.data.message}`);
      fetchAll();
    } catch { alert('Upload failed!'); }
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
    } catch { alert('Save failed!'); }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o: any) => {
    if (filterType === 'pickup') return o.delivery_type === 'store_pickup';
    if (filterType === 'online') return o.delivery_type === 'home_delivery';
    return true;
  });

  // Filtered payments
  const filteredPayments = payments.filter((p: any) => {
    if (paymentFilter === 'upi') return p.payment_method === 'upi';
    if (paymentFilter === 'cod')
      return p.payment_method === 'cash_on_delivery';
    if (paymentFilter === 'pickup')
      return p.payment_method === 'store_pickup';
    if (paymentFilter === 'success') return p.status === 'success';
    if (paymentFilter === 'pending') return p.status === 'pending';
    return true;
  });

  const totalRevenue = payments
    .filter((p: any) => p.status === 'success')
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="text-white px-6 py-4 flex justify-between
                      items-center" style={{ background: '#1a3d2b' }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
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

      {/* Tabs */}
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
              {tab.key === 'wholesale' && enquiries.length > 0 && (
                <span className="bg-red-500 text-white text-xs
                                 rounded-full px-1.5 py-0.5">
                  {enquiries.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ===== DASHBOARD ===== */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Products', value: stats.total_products,
                  icon: '📚', action: () => setActiveTab('products') },
                { label: 'Total Orders', value: stats.total_orders,
                  icon: '📦', action: () => setActiveTab('orders') },
                { label: 'Customers', value: stats.total_users,
                  icon: '👥', action: null },
                { label: 'Pending', value: stats.pending_orders,
                  icon: '⏳', action: () => setActiveTab('orders') },
              ].map((stat) => (
                <button key={stat.label}
                  onClick={stat.action || undefined}
                  className={`bg-white rounded-xl shadow-sm border
                             border-gray-100 p-5 text-left
                             transition-all ${
                    stat.action
                      ? 'hover:shadow-md cursor-pointer hover:-translate-y-0.5'
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

            <div className="bg-white rounded-xl shadow-sm border
                            border-gray-100 p-6 mb-4">
              <p className="text-sm text-gray-500 mb-1">
                Total Revenue (Paid Orders)
              </p>
              <p className="text-4xl font-bold"
                style={{ color: '#1a4a2e' }}>
                Rs.{totalRevenue.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Add Product', icon: '➕',
                  action: () => setActiveTab('add_product'),
                  bg: '#1a4a2e' },
                { label: 'View Orders', icon: '📦',
                  action: () => setActiveTab('orders'),
                  bg: '#065f46' },
                { label: 'Payments', icon: '💳',
                  action: () => setActiveTab('payments'),
                  bg: '#1e40af' },
                { label: 'Shop Settings', icon: '⚙️',
                  action: () => setActiveTab('shop_settings'),
                  bg: '#7c3aed' },
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
                      ? { background: '#1a4a2e' }
                      : {}}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Order ID', 'Amount', 'Type', 'OTP/Tracking',
                      'Phone', 'Status', 'Update'].map((h) => (
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
                      <td className="p-3 font-bold text-green-600
                                     whitespace-nowrap">
                        Rs.{o.total_amount}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs
                                         font-medium whitespace-nowrap ${
                          o.delivery_type === 'store_pickup'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {o.delivery_type === 'store_pickup'
                            ? '🏪 Pickup' : '🚚 Online'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-sm
                                     text-gray-700">
                        {o.otp_code || o.tracking_id || '-'}
                      </td>
                      <td className="p-3 text-gray-600">
                        {o.phone || '-'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs
                                         font-medium ${
                          o.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : o.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : o.status === 'shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            updateOrderStatus(o.id, e.target.value)
                          }
                          className="border rounded px-2 py-1 text-xs
                                     focus:outline-none">
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
                  <p className="text-gray-400">No orders yet!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== PAYMENTS ===== */}
        {activeTab === 'payments' && (
          <div>
            {/* Payment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                    (p: any) => p.payment_method === 'cash_on_delivery'
                  ).length,
                  icon: '💵',
                  bg: '#92400e',
                },
                {
                  label: 'Store Pickup',
                  value: payments.filter(
                    (p: any) => p.payment_method === 'store_pickup'
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
                  <p className="text-xs opacity-80 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border
                            border-gray-100">
              <div className="p-4 border-b flex justify-between
                              items-center flex-wrap gap-3">
                <h2 className="text-lg font-bold">
                  💳 All Payments ({filteredPayments.length})
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'upi', label: '📱 UPI' },
                    { key: 'cod', label: '💵 COD' },
                    { key: 'pickup', label: '🏪 Pickup' },
                    { key: 'success', label: '✅ Success' },
                    { key: 'pending', label: '⏳ Pending' },
                  ].map((f) => (
                    <button key={f.key}
                      onClick={() => setPaymentFilter(f.key)}
                      className={`px-3 py-1 rounded-full text-xs
                                 font-medium transition-all ${
                        paymentFilter === f.key
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={paymentFilter === f.key
                        ? { background: '#1a4a2e' }
                        : {}}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['#', 'Order', 'Amount', 'Method',
                        'Status', 'Transaction ID', 'Date'].map((h) => (
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
                        <td className="p-3 text-gray-500">{p.id}</td>
                        <td className="p-3 font-bold"
                          style={{ color: '#1a4a2e' }}>
                          #{p.order_id}
                        </td>
                        <td className="p-3 font-bold text-green-600
                                       whitespace-nowrap">
                          Rs.{p.amount}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs
                                           font-medium ${
                            p.payment_method === 'cash_on_delivery'
                              ? 'bg-orange-100 text-orange-700'
                              : p.payment_method === 'upi'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {p.payment_method === 'cash_on_delivery'
                              ? '💵 COD'
                              : p.payment_method === 'upi'
                              ? '📱 UPI'
                              : '🏪 Pickup'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs
                                           font-medium ${
                            p.status === 'success'
                              ? 'bg-green-100 text-green-700'
                              : p.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {p.status === 'success' ? '✅ Paid'
                              : p.status === 'pending' ? '⏳ Pending'
                              : '❌ Failed'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs
                                       text-gray-500 max-w-32 truncate">
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
                    <p className="text-gray-400">No payments yet!</p>
                  </div>
                )}
              </div>
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
              <button onClick={() => setActiveTab('add_product')}
                className="text-white px-4 py-2 rounded-lg text-sm
                           font-medium hover:opacity-90 transition"
                style={{ background: '#1a4a2e' }}>
                ➕ Add New
              </button>
            </div>

            {/* Edit Modal */}
            {editProduct && (
              <div className="fixed inset-0 bg-black bg-opacity-50
                              z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full
                                max-w-md max-h-screen overflow-y-auto
                                shadow-2xl">
                  <h3 className="text-lg font-bold mb-4">
                    ✏️ Edit Product
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'name', label: 'Name', type: 'text' },
                      { key: 'price', label: 'Price (Rs.)', type: 'number' },
                      { key: 'stock_qty', label: 'Stock', type: 'number' },
                      { key: 'subcategory', label: 'Sub Category',
                        type: 'text' },
                      { key: 'image_url', label: 'Image URL', type: 'text' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-sm font-medium text-gray-700">
                          {f.label}
                        </label>
                        <input type={f.type}
                          value={editProduct[f.key] || ''}
                          onChange={(e) => setEditProduct({
                            ...editProduct,
                            [f.key]: e.target.value
                          })}
                          className="w-full border rounded-lg px-3 py-2
                                     mt-1 text-sm focus:outline-none
                                     focus:border-green-500"
                        />
                      </div>
                    ))}

                    {editProduct.image_url && (
                      <img src={editProduct.image_url}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg
                                   border"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select value={editProduct.category || ''}
                        onChange={(e) => setEditProduct({
                          ...editProduct, category: e.target.value
                        })}
                        className="w-full border rounded-lg px-3 py-2
                                   mt-1 text-sm focus:outline-none">
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea value={editProduct.description || ''}
                        onChange={(e) => setEditProduct({
                          ...editProduct, description: e.target.value
                        })}
                        rows={3}
                        className="w-full border rounded-lg px-3 py-2
                                   mt-1 text-sm focus:outline-none
                                   resize-none"
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input type="checkbox"
                        checked={editProduct.is_available}
                        onChange={(e) => setEditProduct({
                          ...editProduct,
                          is_available: e.target.checked
                        })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Available on website
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button onClick={saveEditProduct}
                      className="flex-1 text-white py-2.5 rounded-lg
                                 font-bold hover:opacity-90"
                      style={{ background: '#1a4a2e' }}>
                      ✅ Save
                    </button>
                    <button onClick={() => setEditProduct(null)}
                      className="flex-1 border border-gray-200 py-2.5
                                 rounded-lg text-gray-600 hover:bg-gray-50">
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
                    {['Image', 'Name', 'Category', 'Price',
                      'Stock', 'Status', 'Actions'].map((h) => (
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
                        <img
                          src={p.image_url ||
                            'https://via.placeholder.com/50x50?text=📚'}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-lg
                                     border border-gray-100"
                          onError={(e: any) => {
                            e.target.src =
                              'https://via.placeholder.com/50x50?text=📚';
                          }}
                        />
                      </td>
                      <td className="p-3 max-w-48">
                        <p className="font-medium text-gray-800 truncate">
                          {p.name}
                        </p>
                        {p.subcategory && (
                          <p className="text-xs text-gray-400">
                            {p.subcategory}
                          </p>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-800
                                         px-2 py-0.5 rounded text-xs
                                         whitespace-nowrap">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-green-600
                                     whitespace-nowrap">
                        Rs.{p.price}
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${
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
                        <span className={`px-2 py-0.5 rounded text-xs
                                         font-medium ${
                          p.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {p.is_available ? '✅ Active' : '❌ Hidden'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={() => setEditProduct(p)}
                            className="text-xs font-medium border
                                       px-2 py-1 rounded hover:bg-blue-50
                                       transition-colors text-blue-600
                                       border-blue-200">
                            ✏️ Edit
                          </button>
                          <button onClick={() => deleteProduct(p.id)}
                            className="text-xs font-medium border
                                       px-2 py-1 rounded hover:bg-red-50
                                       transition-colors text-red-500
                                       border-red-200">
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
            <h2 className="text-xl font-bold mb-4">➕ Add New Product</h2>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Product Name *', type: 'text',
                  ph: 'e.g. TNPSC Group 2 Complete Guide' },
                { key: 'price', label: 'Price (Rs.) *', type: 'number',
                  ph: 'e.g. 350' },
                { key: 'stock_qty', label: 'Stock Qty *', type: 'number',
                  ph: 'e.g. 50' },
                { key: 'subcategory', label: 'Sub Category', type: 'text',
                  ph: 'e.g. Group 2, Class 10' },
                { key: 'image_url', label: 'Image URL', type: 'text',
                  ph: 'https://... or Google Drive link' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-gray-700">
                    {f.label}
                  </label>
                  <input type={f.type}
                    value={(newProduct as any)[f.key]}
                    placeholder={f.ph}
                    onChange={(e) => setNewProduct({
                      ...newProduct, [f.key]: e.target.value
                    })}
                    className="w-full border rounded-lg px-3 py-2 mt-1
                               text-sm focus:outline-none
                               focus:border-green-500"
                  />
                </div>
              ))}

              {newProduct.image_url && (
                <img src={newProduct.image_url}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select value={newProduct.category}
                  onChange={(e) => setNewProduct({
                    ...newProduct, category: e.target.value
                  })}
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none
                             focus:border-green-500">
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

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
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none
                             focus:border-green-500 resize-none"
                />
              </div>

              <button onClick={addProduct}
                className="w-full text-white py-3 rounded-lg font-bold
                           hover:opacity-90 transition-colors text-base"
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
              📊 Upload via Excel
            </h2>
            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <p className="font-medium mb-2 text-sm"
                style={{ color: '#1a4a2e' }}>
                Required Columns:
              </p>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse w-full">
                  <thead>
                    <tr className="bg-green-100">
                      {['name *', 'category *', 'price *',
                        'stock_qty *', 'description',
                        'image_url', 'subcategory'].map((h) => (
                        <th key={h}
                          className="border border-green-200 px-2 py-1
                                     text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {['TNPSC Guide', 'tnpsc', '350', '50',
                        'Best guide', 'https://...', 'Group 2'].map((v) => (
                        <td key={v}
                          className="border border-green-200 px-2 py-1
                                     text-gray-600">
                          {v}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <label className="block w-full border-2 border-dashed
                              rounded-xl p-10 text-center cursor-pointer
                              transition-all hover:bg-green-50"
              style={{ borderColor: '#86efac' }}>
              <input type="file" accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
              />
              <p className="text-5xl mb-3">📊</p>
              <p className="font-bold text-gray-700">
                Click to upload Excel
              </p>
              <p className="text-xs text-gray-400 mt-1">
                .xlsx or .xls only
              </p>
            </label>
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
              <button onClick={fetchAll}
                className="text-sm hover:underline"
                style={{ color: '#1a4a2e' }}>
                🔄 Refresh
              </button>
            </div>
            {enquiries.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400">No enquiries yet!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['#', 'Store', 'Contact', 'Phone',
                        'Message', 'Date'].map((h) => (
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
                        <td className="p-3">{e.store_name || '—'}</td>
                        <td className="p-3">{e.name}</td>
                        <td className="p-3">
                          <a href={`tel:${e.phone}`}
                            className="font-medium hover:underline"
                            style={{ color: '#1a4a2e' }}>
                            {e.phone}
                          </a>
                        </td>
                        <td className="p-3 text-gray-600 max-w-48">
                          <p className="truncate">{e.message || '—'}</p>
                        </td>
                        <td className="p-3 text-gray-400 text-xs">
                          {new Date(e.created_at)
                            .toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                Changes here reflect on all pages — chatbot, footer,
                wholesale, terms etc.
              </p>

              {settingsSaved && (
                <div className="bg-green-50 border border-green-200
                                rounded-xl p-3 mb-4 text-sm font-medium"
                  style={{ color: '#1a4a2e' }}>
                  ✅ Settings saved successfully!
                </div>
              )}

              <div className="space-y-4">

                {/* Branch 1 */}
                <div className="rounded-xl p-4"
                  style={{ background: '#f0f7f4',
                           border: '1px solid #a8d5b5' }}>
                  <p className="font-bold mb-3 text-sm"
                    style={{ color: '#1a4a2e' }}>
                    🏪 Main Shop — Branch 1
                  </p>
                  <div className="space-y-3">
                    {[
                      { key: 'shop_name', label: 'Shop Name',
                        type: 'text' },
                      { key: 'shop_address', label: 'Shop Address',
                        type: 'text' },
                      { key: 'phone', label: 'Phone Number',
                        type: 'text' },
                      { key: 'customer_care',
                        label: 'Customer Care Number', type: 'text' },
                      { key: 'email', label: 'Email ID', type: 'email' },
                      { key: 'instagram', label: 'Instagram Handle',
                        type: 'text' },
                      { key: 'working_hours', label: 'Working Hours',
                        type: 'text' },
                      { key: 'tagline', label: 'Shop Tagline',
                        type: 'text' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-sm font-medium
                                          text-gray-700">
                          {f.label}
                        </label>
                        <input type={f.type}
                          value={shopSettings[f.key] || ''}
                          onChange={(e) => setShopSettings({
                            ...shopSettings,
                            [f.key]: e.target.value
                          })}
                          className="w-full border rounded-lg px-3 py-2
                                     mt-1 text-sm focus:outline-none
                                     focus:border-green-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branch 2 */}
                <div className="bg-blue-50 rounded-xl p-4
                                border border-blue-100">
                  <p className="font-bold text-blue-800 mb-1 text-sm">
                    🏪 Branch 2 (New Branch — Optional)
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Fill when you open a new branch. Leave blank if not.
                  </p>
                  {[
                    { key: 'branch_2_name', label: 'Branch 2 Name',
                      ph: 'e.g. Ayyanar Book Centre — Karur' },
                    { key: 'branch_2_address', label: 'Branch 2 Address',
                      ph: 'Full address with pincode' },
                    { key: 'branch_2_phone', label: 'Branch 2 Phone',
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
                        className="w-full border rounded-lg px-3 py-2
                                   mt-1 text-sm focus:outline-none
                                   focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>

                <button onClick={saveSettings}
                  className="w-full text-white py-3 rounded-xl font-bold
                             hover:opacity-90 transition-colors text-base"
                  style={{ background: '#1a4a2e' }}>
                  💾 Save All Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
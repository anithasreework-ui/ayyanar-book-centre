import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const CATEGORIES = [
  'state_board', 'cbse', 'tn_textbook', 'tnpsc', 'ncert',
  'medical', 'notebooks', 'stationery', 'children', 'novels',
  'motivational', 'gifts', 'projects', 'school_accessories',
  'combos', 'wholesale'
];

const STATUS_OPTIONS = [
  'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'
];

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterType, setFilterType] = useState('all');
  const [editProduct, setEditProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '',
    category: '', subcategory: '', stock_qty: '', image_url: ''
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
      const [pRes, oRes, sRes, eRes ] = await Promise.all([
        axios.get(`${API}/products/`),
        axios.get(`${API}/admin/orders`, { headers }),
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/wholesale-enquiries`, { headers }),
      ]);
      setProducts(pRes.data);
      setOrders(oRes.data);
      setStats(sRes.data);
      setEnquiries(eRes.data);

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
    } catch {
      alert('Update failed!');
    }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    await axios.delete(`${API}/admin/products/${id}`, { headers });
    fetchAll();
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert('Fill name, price and category!');
      return;
    }
    try {
      await axios.post(
        `${API}/admin/products`,
        {
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock_qty: parseInt(newProduct.stock_qty) || 0
        },
        { headers }
      );
      alert('Product added!');
      fetchAll();
      setNewProduct({
        name: '', description: '', price: '',
        category: '', subcategory: '', stock_qty: '', image_url: ''
      });
      setActiveTab('products');
    } catch {
      alert('Failed!');
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
          stock_qty: parseInt(editProduct.stock_qty),
          category: editProduct.category,
          description: editProduct.description,
          image_url: editProduct.image_url,
          is_available: editProduct.is_available
        },
        { headers }
      );
      alert('Product updated!');
      setEditProduct(null);
      fetchAll();
    } catch {
      alert('Update failed!');
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(
        `${API}/admin/upload-excel`, formData,
        { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }
      );
      alert(res.data.message);
      fetchAll();
    } catch {
      alert('Upload failed!');
    }
  };

  const filteredOrders = orders.filter((o: any) => {
    if (filterType === 'all') return true;
    if (filterType === 'pickup') return o.delivery_type === 'store_pickup';
    if (filterType === 'online') return o.delivery_type === 'home_delivery';
    return true;
  });

  const TABS = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'orders', icon: '📦', label: 'Orders' },
    { key: 'products', icon: '📚', label: 'Products' },
    { key: 'add_product', icon: '➕', label: 'Add Product' },
    { key: 'excel_upload', icon: '📊', label: 'Excel Upload' },
    { key: 'wholesale', icon: '🏭', label: 'Wholesale Enquiries' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-blue-900 text-white px-6 py-4 flex
                      justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">⚙️ Admin Panel</h1>
          <p className="text-blue-300 text-xs">Ayyanar Book Centre</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-blue-300">Administrator</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm
                         font-medium whitespace-nowrap border-b-2
                         transition-all ${
                activeTab === tab.key
                  ? 'border-blue-800 text-blue-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Dashboard */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Products', value: stats.total_products,
                  icon: '📚', color: 'blue' },
                { label: 'Total Orders', value: stats.total_orders,
                  icon: '📦', color: 'green' },
                { label: 'Total Customers', value: stats.total_users,
                  icon: '👥', color: 'purple' },
                { label: 'Pending Orders', value: stats.pending_orders,
                  icon: '⏳', color: 'yellow' },
              ].map((stat) => (
                <div key={stat.label}
                  className="bg-white rounded-xl shadow-sm border
                             border-gray-100 p-5">
                  <p className="text-3xl mb-2">{stat.icon}</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border
                            border-gray-100 p-6">
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-4xl font-bold text-green-600">
                Rs.{(stats.total_revenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border
                          border-gray-100">
            <div className="p-4 border-b flex justify-between
                            items-center flex-wrap gap-3">
              <h2 className="text-lg font-bold">
                All Orders ({filteredOrders.length})
              </h2>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'online', label: '🚚 Online' },
                  { key: 'pickup', label: '🏪 Pickup' },
                ].map((f) => (
                  <button key={f.key}
                    onClick={() => setFilterType(f.key)}
                    className={`px-3 py-1 rounded-full text-sm
                               font-medium ${
                      filterType === f.key
                        ? 'bg-blue-800 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
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
                        className="text-left p-3 text-gray-600 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o: any) => (
                    <tr key={o.id}
                      className="border-t hover:bg-gray-50">
                      <td className="p-3 font-bold text-blue-800">
                        #{o.id}
                      </td>
                      <td className="p-3 font-bold text-green-600">
                        Rs.{o.total_amount}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs
                                         font-medium ${
                          o.delivery_type === 'store_pickup'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {o.delivery_type === 'store_pickup'
                            ? '🏪 Pickup' : '🚚 Online'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-gray-700">
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
                            updateOrderStatus(o.id, e.target.value)}
                          className="border rounded px-2 py-1 text-xs
                                     focus:outline-none focus:border-blue-500">
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
                <p className="text-center text-gray-400 py-10">
                  No orders yet!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border
                          border-gray-100">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">
                Products ({products.length})
              </h2>
              <button onClick={() => setActiveTab('add_product')}
                className="bg-blue-800 text-white px-4 py-2 rounded-lg
                           text-sm font-medium hover:bg-blue-700">
                ➕ Add New
              </button>
            </div>

            {/* Edit Modal */}
            {editProduct && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50
                              flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md
                                max-h-screen overflow-y-auto">
                  <h3 className="text-lg font-bold mb-4">Edit Product</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'name', label: 'Name', type: 'text' },
                      { key: 'price', label: 'Price', type: 'number' },
                      { key: 'stock_qty', label: 'Stock', type: 'number' },
                      { key: 'image_url', label: 'Image URL', type: 'text' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-sm text-gray-600">
                          {f.label}
                        </label>
                        <input type={f.type}
                          value={editProduct[f.key] || ''}
                          onChange={(e) => setEditProduct({
                            ...editProduct, [f.key]: e.target.value
                          })}
                          className="w-full border rounded-lg px-3 py-2
                                     mt-1 text-sm focus:outline-none"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-sm text-gray-600">Category</label>
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
                      <label className="text-sm text-gray-600">
                        Description
                      </label>
                      <textarea
                        value={editProduct.description || ''}
                        onChange={(e) => setEditProduct({
                          ...editProduct, description: e.target.value
                        })}
                        rows={3}
                        className="w-full border rounded-lg px-3 py-2
                                   mt-1 text-sm focus:outline-none resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox"
                        checked={editProduct.is_available}
                        onChange={(e) => setEditProduct({
                          ...editProduct, is_available: e.target.checked
                        })}
                      />
                      <label className="text-sm text-gray-600">
                        Available
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={saveEditProduct}
                      className="flex-1 bg-blue-800 text-white py-2
                                 rounded-lg font-bold hover:bg-blue-700">
                      Save Changes
                    </button>
                    <button onClick={() => setEditProduct(null)}
                      className="flex-1 border border-gray-200 py-2
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
                        className="text-left p-3 text-gray-600 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p: any) => (
                    <tr key={p.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <img
                          src={p.image_url ||
                            'https://via.placeholder.com/50'}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      </td>
                      <td className="p-3 font-medium max-w-48">
                        <p className="truncate">{p.name}</p>
                      </td>
                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-700
                                         px-2 py-0.5 rounded text-xs">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-green-600">
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
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          p.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {p.is_available ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={() => setEditProduct(p)}
                            className="text-blue-600 hover:text-blue-800
                                       text-xs font-medium border border-blue-200
                                       px-2 py-1 rounded">
                            ✏️ Edit
                          </button>
                          <button onClick={() => deleteProduct(p.id)}
                            className="text-red-500 hover:text-red-700
                                       text-xs font-medium border border-red-200
                                       px-2 py-1 rounded">
                            🗑️ Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product */}
        {activeTab === 'add_product' && (
          <div className="bg-white rounded-xl shadow-sm border
                          border-gray-100 p-6 max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Product Name *', type: 'text' },
                { key: 'price', label: 'Price (Rs.) *', type: 'number' },
                { key: 'stock_qty', label: 'Stock Qty *', type: 'number' },
                { key: 'image_url', label: 'Image URL', type: 'text' },
                { key: 'subcategory', label: 'Sub Category', type: 'text' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-sm text-gray-600 font-medium">
                    {f.label}
                  </label>
                  <input type={f.type}
                    value={(newProduct as any)[f.key]}
                    onChange={(e) => setNewProduct({
                      ...newProduct, [f.key]: e.target.value
                    })}
                    className="w-full border rounded-lg px-3 py-2 mt-1
                               text-sm focus:outline-none
                               focus:border-blue-500"
                  />
                </div>
              ))}

              <div>
                <label className="text-sm text-gray-600 font-medium">
                  Category *
                </label>
                <select value={newProduct.category}
                  onChange={(e) => setNewProduct({
                    ...newProduct, category: e.target.value
                  })}
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none focus:border-blue-500">
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium">
                  Description
                </label>
                <textarea value={newProduct.description}
                  onChange={(e) => setNewProduct({
                    ...newProduct, description: e.target.value
                  })}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none
                             focus:border-blue-500 resize-none"
                />
              </div>

              <button onClick={addProduct}
                className="w-full bg-blue-800 text-white py-3 rounded-lg
                           font-bold hover:bg-blue-700">
                Add Product ✅
              </button>
            </div>
          </div>
        )}

        {/* Excel Upload */}
        {activeTab === 'excel_upload' && (
          <div className="bg-white rounded-xl shadow-sm border
                          border-gray-100 p-6 max-w-lg">
            <h2 className="text-xl font-bold mb-2">
              Upload Products via Excel
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Excel must have columns: name, category, price, stock_qty
              (description, image_url optional)
            </p>

            <div className="bg-blue-50 rounded-xl p-4 mb-4 text-sm">
              <p className="font-medium text-blue-800 mb-2">
                Sample Excel Format:
              </p>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-blue-100">
                    {['name', 'category', 'price', 'stock_qty'].map((h) => (
                      <th key={h}
                        className="border border-blue-200 px-2 py-1 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {['TNPSC Guide', 'tnpsc', '350', '50'].map((v) => (
                      <td key={v}
                        className="border border-blue-200 px-2 py-1">
                        {v}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <label className="block w-full border-2 border-dashed
                              border-gray-300 rounded-xl p-8 text-center
                              cursor-pointer hover:border-blue-400
                              transition-colors">
              <input type="file" accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
              />
              <p className="text-4xl mb-2">📊</p>
              <p className="font-medium text-gray-700">
                Click to upload Excel file
              </p>
              <p className="text-xs text-gray-400 mt-1">
                .xlsx or .xls files only
              </p>
            </label>
          </div>
        )}
        {/* Wholesale update */}
        {activeTab === 'wholesale' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
           <div className="p-4 border-b">
             <h2 className="text-lg font-bold">
               Wholesale Enquiries ({enquiries.length})
             </h2>
           </div>
           {enquiries.length === 0 ? (
             <p className="text-center text-gray-400 py-10">
              No enquiries yet!
             </p>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead className="bg-gray-50">
                  <tr>
                    {['#', 'Store Name', 'Contact', 'Phone',
                      'Message', 'Date'].map((h) => (
                       <th key={h}
                        className="text-left p-3 text-gray-600 font-medium">
                        {h}
                      </th>
                     ))}
                     </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((e: any) => (
                      <tr key={e.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-bold text-blue-800">#{e.id}</td>
                        <td className="p-3 font-medium">
                          {e.store_name || '-'}
                        </td>
                        <td className="p-3">{e.name}</td>
                        <td className="p-3 text-blue-700 font-medium">
                          {e.phone}
                        </td>
                        <td className="p-3 text-gray-600 max-w-48">
                          <p className="truncate">{e.message || '-'}</p>
                        </td>
                        <td className="p-3 text-gray-400 text-xs">
                          {new Date(e.created_at).toLocaleDateString()}
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
           )}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Admin;
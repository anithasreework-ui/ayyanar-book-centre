import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '',
    category: '', stock_qty: '', image_url: ''
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
    } catch (err) {
      console.log('Fetch error', err);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    await axios.put(
      `${API}/admin/orders/${orderId}/status`,
      { status },
      { headers }
    );
    fetchAll();
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
        category: '', stock_qty: '', image_url: ''
      });
      setActiveTab('products');
    } catch {
      alert('Failed to add product!');
    }
  };

  const TABS = ['dashboard', 'products', 'orders', 'add_product'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <span className="bg-blue-100 text-blue-800 px-3 py-1
                         rounded-full text-sm font-medium">
          {user.name}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize text-sm ${
              activeTab === tab
                ? 'bg-blue-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Products', value: stats.total_products, color: 'blue' },
              { label: 'Total Orders', value: stats.total_orders, color: 'green' },
              { label: 'Total Users', value: stats.total_users, color: 'purple' },
              { label: 'Pending Orders', value: stats.pending_orders, color: 'yellow' },
            ].map((stat) => (
              <div key={stat.label}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-4xl font-bold text-green-600">
              Rs.{stats.total_revenue.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              All Products ({products.length})
            </h2>
            <button
              onClick={() => setActiveTab('add_product')}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg
                         text-sm font-medium hover:bg-blue-700"
            >
              Add New
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-700 px-2
                                       py-0.5 rounded text-xs">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 text-green-600 font-bold">
                      Rs.{p.price}
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${
                        p.stock_qty > 10 ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {p.stock_qty}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-red-500 hover:text-red-700
                                   text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xl font-bold mb-4">
            All Orders ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No orders yet!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Order ID</th>
                    <th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-bold">#{o.id}</td>
                      <td className="p-3 text-green-600 font-bold">
                        Rs.{o.total_amount}
                      </td>
                      <td className="p-3 text-gray-500">
                        {o.delivery_type}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          o.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : o.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
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
                                     focus:outline-none focus:border-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Product Tab */}
      {activeTab === 'add_product' && (
        <div className="bg-white rounded-xl shadow-sm border
                        border-gray-100 p-6 max-w-lg">
          <h2 className="text-xl font-bold mb-4">Add New Product</h2>
          <div className="space-y-3">
            {[
              { key: 'name', label: 'Product Name', type: 'text' },
              { key: 'price', label: 'Price (Rs.)', type: 'number' },
              { key: 'stock_qty', label: 'Stock Quantity', type: 'number' },
              { key: 'image_url', label: 'Image URL', type: 'text' },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-sm text-gray-600 font-medium">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={(newProduct as any)[field.key]}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      [field.key]: e.target.value
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Category
              </label>
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 mt-1
                           focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Category</option>
                <option value="tnpsc">TNPSC</option>
                <option value="ncert">NCERT</option>
                <option value="motivational">Motivational</option>
                <option value="novels">Novels</option>
                <option value="stationery">Stationery</option>
                <option value="school_accessories">School Accessories</option>
                <option value="children">Children Books</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">
                Description
              </label>
              <textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description: e.target.value
                  })
                }
                rows={3}
                className="w-full border rounded-lg px-3 py-2 mt-1
                           focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={addProduct}
              className="w-full bg-blue-800 text-white py-3
                         rounded-lg font-bold hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
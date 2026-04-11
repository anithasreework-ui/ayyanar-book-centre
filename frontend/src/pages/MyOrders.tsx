import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const STATUS_COLORS: any = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-teal-100 text-teal-700',
  packed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    axios.get(`${API}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📭</p>
        <p className="text-gray-500 text-lg mb-4">No orders yet!</p>
        <button onClick={() => navigate('/products')}
          className="bg-blue-800 text-white px-6 py-3 rounded-xl
                     font-bold hover:bg-blue-700">
          Start Shopping →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        My Orders
      </h1>

      <div className="space-y-4">
        {orders.map((order: any) => (
          <div key={order.id}
            className="bg-white rounded-2xl shadow-sm border
                       border-gray-100 p-5">

            {/* Order Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-gray-800">
                  Order #{order.id}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 text-lg">
                  Rs.{order.total_amount}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full
                                 font-medium ${
                  STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'
                }`}>
                  {order.status?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Delivery Type */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                order.delivery_type === 'store_pickup'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {order.delivery_type === 'store_pickup'
                  ? '🏪 Store Pickup'
                  : '🚚 Home Delivery'}
              </span>
            </div>

            {/* OTP Card — Store Pickup */}
            {order.otp_code && (
              <div className="bg-purple-50 border-2 border-purple-200
                              rounded-xl p-4 mb-3">
                <p className="text-xs text-purple-600 font-medium mb-1">
                  🏪 YOUR STORE PICKUP OTP
                </p>
                <p className="text-3xl font-bold text-purple-800
                              tracking-widest">
                  {order.otp_code}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Show this at Ayyanar Book Centre counter, Dindigul
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  📞 +91 9894235330 | Mon-Sat: 9AM-8PM
                </p>
              </div>
            )}

            {/* Tracking ID — Online */}
            {order.tracking_id && (
              <div className="bg-green-50 border border-green-200
                              rounded-xl p-4 mb-3">
                <p className="text-xs text-green-600 font-medium mb-1">
                  🚚 TRACKING ID
                </p>
                <p className="text-2xl font-bold text-green-700
                              tracking-widest">
                  {order.tracking_id}
                </p>
                <button
                  onClick={() => navigate(`/orders?track=${order.tracking_id}`)}
                  className="text-xs text-green-700 hover:underline mt-1
                             block">
                  Track this order →
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {order.tracking_id && (
                <button
                  onClick={() => navigate(`/orders`)}
                  className="flex-1 border border-blue-200 text-blue-700
                             py-2 rounded-lg text-sm font-medium
                             hover:bg-blue-50 transition-colors">
                  📦 Track Order
                </button>
              )}
              <button
                onClick={() => navigate('/products')}
                className="flex-1 bg-blue-800 text-white py-2 rounded-lg
                           text-sm font-medium hover:bg-blue-700
                           transition-colors">
                🛍️ Shop Again
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
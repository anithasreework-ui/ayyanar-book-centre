import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const STEPS = [
  { label: 'Order Placed', icon: '📋' },
  { label: 'Confirmed', icon: '✅' },
  { label: 'Packed', icon: '📦' },
  { label: 'Shipped', icon: '🚚' },
  { label: 'Delivered', icon: '🎉' },
];

const STATUS_MAP: any = {
  pending: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  delivered: 4
};

const OrderTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError('Please enter tracking ID!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/orders/track/${trackingId}`);
      setOrder(res.data);
    } catch {
      setError('Tracking ID not found! Please check and try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? (STATUS_MAP[order.status] ?? 0) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Track Your Order
      </h1>
      <p className="text-gray-500 mb-8">
        Enter your tracking ID to see order status
      </p>

      {/* Search Box */}
      <div className="bg-white rounded-2xl shadow-sm border
                      border-gray-100 p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            placeholder="OL-1234 (Online) or SP-4582 (Store Pickup)"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3
                       text-sm focus:outline-none focus:border-blue-500"
          />
          <button onClick={handleTrack} disabled={loading}
            className="bg-blue-800 text-white px-6 py-3 rounded-lg
                       font-bold hover:bg-blue-700 disabled:bg-gray-300">
            {loading ? '...' : 'Track'}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Result */}
      {order && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border
                          border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-500">
                  {order.delivery_type === 'store_pickup'
                    ? 'OTP Code'
                  : 'Tracking ID'}
                </p>

                <p className="font-bold text-gray-800 text-lg">
                  {order.otp_code || order.tracking_id}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'delivered'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            {/*Store Pickup Special Card */}
            {order.delivery_type === 'store_pickup' && (
              <div className="bg-purple-50 border border-purple-200
                        rounded-xl p-4 mb-4 text-center">
                <p className="text-xs text-purple-600 font-medium mb-1">
                   🏪 STORE PICKUP OTP
                </p>
                <p className="text-3xl font-bold text-purple-800
                              tracking-widest">
                   {order.otp_code}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Show this at Ayyanar Book Centre, Dindigul
                </p>
             </div>
           )}

            {/* Progress */}
            <div className="flex justify-between relative">
              <div className="absolute top-6 left-0 right-0 h-0.5
                              bg-gray-100 z-0" />
              <div className="absolute top-6 left-0 h-0.5 bg-blue-800
                              z-0 transition-all"
                style={{
                  width: `${(currentStep / (STEPS.length - 1)) * 100}%`
                }} />
              {STEPS.map((step, index) => (
                <div key={step.label}
                  className="flex flex-col items-center text-center
                             w-16 relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center
                                  justify-center text-xl mb-2 border-2 ${
                    index <= currentStep
                      ? 'bg-blue-800 border-blue-800'
                      : 'bg-white border-gray-200'
                  }`}>
                    {step.icon}
                  </div>
                  <p className={`text-xs font-medium ${
                    index <= currentStep
                      ? 'text-blue-800' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">{STEPS[currentStep].icon}</p>
              <p className="font-bold text-blue-800">
                {STEPS[currentStep].label}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border
                          border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">
              Delivery Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Date</span>
                <span className="font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Type</span>
                <span className="font-medium">
                  {order.delivery_type === 'store_pickup'
                    ? '🏪 Store Pickup'
                    : '🚚 Home Delivery'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">
                  {order.delivery_type === 'store_pickup'
                    ? 'Pickup Location' : 'Address'}
                </span>
                <span className="font-medium text-right max-w-48">
                  {order.delivery_address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-bold text-green-600">
                  Rs.{order.total_amount}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-sm text-center">
            <p className="font-medium text-gray-700">Need help?</p>
            <p className="text-gray-500 mt-1">
              Call us: +91 9894235330
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
import { useState } from 'react';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const ONLINE_STEPS = [
  { label: 'Order Placed', icon: '📋' },
  { label: 'Confirmed', icon: '✅' },
  { label: 'Packed', icon: '📦' },
  { label: 'Shipped', icon: '🚚' },
  { label: 'Delivered', icon: '🎉' },
];

const PICKUP_STEPS = [
  { label: 'Order Placed', icon: '📋' },
  { label: 'Confirmed', icon: '✅' },
  { label: 'Ready for Pickup', icon: '🏪' },
  { label: 'Collected', icon: '🎉' },
];

const STATUS_MAP_ONLINE: any = {
  pending: 0, confirmed: 1, packed: 2, shipped: 3, delivered: 4
};

const STATUS_MAP_PICKUP: any = {
  pending: 0, confirmed: 1, packed: 2, delivered: 3
};

const OrderTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setError('Please enter tracking ID or OTP!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(
        `${API}/orders/track/${trackingId.trim().toUpperCase()}`
      );
      setOrder(res.data);
    } catch {
      setError('ID not found! Please check and try again.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const isPickup = order?.delivery_type === 'store_pickup';
  const STEPS = isPickup ? PICKUP_STEPS : ONLINE_STEPS;
  const STATUS_MAP = isPickup ? STATUS_MAP_PICKUP : STATUS_MAP_ONLINE;
  const currentStep = order ? (STATUS_MAP[order.status] ?? 0) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Track Your Order
      </h1>
      <p className="text-gray-500 mb-8">
        Enter your Tracking ID (OL-XXXX) or Store OTP (SP-XXXX)
      </p>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border
                      border-gray-100 p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            placeholder="OL-1234 or SP-4582"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3
                       text-sm focus:outline-none focus:border-blue-500
                       font-mono"
          />
          <button onClick={handleTrack} disabled={loading}
            className="bg-blue-800 text-white px-6 py-3 rounded-lg
                       font-bold hover:bg-blue-700 disabled:bg-gray-300">
            {loading ? '...' : 'Track'}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-3 bg-red-50
                        rounded-lg px-3 py-2">
            ❌ {error}
          </p>
        )}
      </div>

      {/* Result */}
      {order && (
        <div className="space-y-4">

          {/* Store Pickup Card */}
          {isPickup && (
            <div className="bg-purple-50 border-2 border-purple-200
                            rounded-2xl p-6 text-center">
              <p className="text-xs text-purple-600 font-medium mb-1">
                🏪 STORE PICKUP OTP
              </p>
              <p className="text-4xl font-bold text-purple-800
                            tracking-widest mb-1">
                {order.otp_code}
              </p>
              <p className="text-xs text-gray-500">
                Show this OTP at Ayyanar Book Centre, Dindigul
              </p>
              <p className="text-xs text-gray-400 mt-1">
                📞 +91 9894235330 | Mon-Sat: 9AM-8PM
              </p>
            </div>
          )}

          {/* Online Tracking Card */}
          {!isPickup && order.tracking_id && (
            <div className="bg-green-50 border-2 border-green-200
                            rounded-2xl p-4 text-center">
              <p className="text-xs text-green-600 font-medium mb-1">
                🚚 TRACKING ID
              </p>
              <p className="text-2xl font-bold text-green-700
                            tracking-widest">
                {order.tracking_id}
              </p>
            </div>
          )}

          {/* Status Progress */}
          <div className="bg-white rounded-2xl shadow-sm border
                          border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-6">
              Order Status
            </h2>

            <div className="flex justify-between relative">
              <div className="absolute top-6 left-0 right-0 h-0.5
                              bg-gray-100 z-0" />
              <div
                className="absolute top-6 left-0 h-0.5 bg-blue-800
                            z-0 transition-all"
                style={{
                  width: `${(currentStep / (STEPS.length - 1)) * 100}%`
                }}
              />
              {STEPS.map((step, index) => (
                <div key={step.label}
                  className="flex flex-col items-center text-center
                             relative z-10"
                  style={{ width: `${100 / STEPS.length}%` }}>
                  <div className={`w-12 h-12 rounded-full flex items-center
                                  justify-center text-xl mb-2 border-2 ${
                    index <= currentStep
                      ? 'bg-blue-800 border-blue-800'
                      : 'bg-white border-gray-200'
                  }`}>
                    {step.icon}
                  </div>
                  <p className={`text-xs font-medium leading-tight ${
                    index <= currentStep
                      ? 'text-blue-800' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">{STEPS[currentStep].icon}</p>
              <p className="font-bold text-blue-800">
                {STEPS[currentStep].label}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-sm border
                          border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">
              Order Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Date</span>
                <span className="font-medium">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">
                  {isPickup ? '🏪 Store Pickup' : '🚚 Home Delivery'}
                </span>
              </div>
              {!isPickup && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Address</span>
                  <span className="font-medium text-right max-w-48 text-xs">
                    {order.delivery_address}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t
                              border-gray-100 pt-3">
                <span className="text-gray-500 font-medium">
                  Total Amount
                </span>
                <span className="font-bold text-green-600">
                  Rs.{order.total_amount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 text-sm text-center">
            <p className="font-medium text-gray-700">Need help?</p>
            <p className="text-gray-500 mt-1">
              📞 +91 9894235330 &nbsp;|&nbsp;
              ✉️ ayyanarbookcentredgl1@gmail.com
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
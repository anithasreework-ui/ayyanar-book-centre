import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DELIVERY_CHARGES = {
  free: 0,
  tn: 50,
  other: 150,
  international: 500
};

const Checkout = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [deliveryType, setDeliveryType] = useState('home_delivery');
  const [country, setCountry] = useState('India');
  const [form, setForm] = useState({
    address: '', pincode: '', phone: '',
    alt_phone: '', country_code: '+91', email: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (!stored || JSON.parse(stored).length === 0) {
      navigate('/cart');
      return;
    }
    setCartItems(JSON.parse(stored));
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  const getDeliveryCharge = () => {
    if (deliveryType === 'store_pickup') return 0;
    if (country !== 'India') return DELIVERY_CHARGES.international;
    if (subtotal >= 1000) return DELIVERY_CHARGES.free;
    return DELIVERY_CHARGES.tn;
  };

  const grandTotal = subtotal + getDeliveryCharge();

  const handlePlaceOrder = async () => {
    if (deliveryType === 'store_pickup' && !form.phone) {
      alert('Phone number mandatory for store pickup!');
      return;
    }
    if (deliveryType === 'home_delivery') {
      if (!form.phone || !form.address || !form.pincode) {
        alert('Address, pincode and phone are required!');
        return;
      }
      if (country !== 'India' && !form.email) {
        alert('Email mandatory for international orders!');
        return;
      }
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `${API}/orders/`,
        {
          items: cartItems.map(i => ({ id: i.id, quantity: i.quantity })),
          delivery_type: deliveryType,
          delivery_address: form.address,
          phone: form.phone,
          alt_phone: form.alt_phone,
          pincode: form.pincode,
          country,
          country_code: form.country_code,
          email: form.email
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem('cart');
      setOrderResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Order failed!');
    } finally {
      setLoading(false);
    }
  };

  // Order Success Screen
  if (orderResult) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 mb-6">
          Order ID: #{orderResult.order_id}
        </p>

        {orderResult.otp_code && (
          <div className="bg-blue-50 border-2 border-blue-300
                          rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">
              Store Pickup OTP
            </p>
            <p className="text-4xl font-bold text-blue-800 tracking-widest">
              {orderResult.otp_code}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Show this OTP at the store to collect your order
            </p>
          </div>
        )}

        {orderResult.tracking_id && (
          <div className="bg-green-50 border-2 border-green-300
                          rounded-2xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">
              Tracking ID
            </p>
            <p className="text-4xl font-bold text-green-700 tracking-widest">
              {orderResult.tracking_id}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Use this to track your order
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-left">
          <p className="font-medium text-gray-700 mb-2">Order Details</p>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Paid</span>
            <span className="font-bold text-green-600">
              Rs.{orderResult.total}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-500">Delivery</span>
            <span>{orderResult.delivery_type === 'store_pickup'
              ? 'Store Pickup' : 'Home Delivery'}</span>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 mb-6 text-sm">
          <p className="font-medium text-gray-700">Need help?</p>
          <p className="text-gray-500 mt-1">
            Call us: +91 XXXXXXXXXX
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-blue-800 text-white py-3 rounded-xl
                     font-bold hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">

          {/* Delivery Type */}
          <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">
              Delivery Option
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: 'home_delivery',
                  icon: '🚚',
                  label: 'Home Delivery',
                  desc: 'Delivered to your address'
                },
                {
                  value: 'store_pickup',
                  icon: '🏪',
                  label: 'Store Pickup',
                  desc: 'Collect at Dindigul (Prepaid)'
                },
              ].map((opt) => (
                <label key={opt.value}
                  className={`flex flex-col items-center p-4 rounded-xl
                             border-2 cursor-pointer transition-all ${
                    deliveryType === opt.value
                      ? 'border-blue-800 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  <input type="radio" name="delivery"
                    value={opt.value}
                    checked={deliveryType === opt.value}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="hidden" />
                  <span className="text-3xl mb-2">{opt.icon}</span>
                  <p className="font-medium text-gray-800 text-sm">
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {opt.desc}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* Store Pickup Info */}
          {deliveryType === 'store_pickup' && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h2 className="font-bold text-gray-800 mb-3">
                📍 Store Address
              </h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>🏪 Ayyanar Book Centre</p>
                <p>📍 Dindigul, Tamil Nadu - 624 001</p>
                <p>📞 +91 XXXXXXXXXX</p>
                <p>🕐 Mon-Sat: 9AM - 8PM</p>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number (Mandatory) *
                </label>
                <input type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Home Delivery Form */}
          {deliveryType === 'home_delivery' && (
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-6 space-y-3">
              <h2 className="font-bold text-gray-800 mb-2">
                Delivery Details
              </h2>

              {/* Country */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none">
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="UAE">UAE</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Code *
                  </label>
                  <input type="text"
                    value={form.country_code}
                    onChange={(e) =>
                      setForm({ ...form, country_code: e.target.value })}
                    placeholder="+91"
                    className="w-full border rounded-lg px-3 py-2 mt-1
                               text-sm focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone *
                  </label>
                  <input type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full border rounded-lg px-3 py-2 mt-1
                               text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Alt Phone */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Alternate Phone
                </label>
                <input type="tel"
                  value={form.alt_phone}
                  onChange={(e) =>
                    setForm({ ...form, alt_phone: e.target.value })}
                  placeholder="Alternative number (optional)"
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none"
                />
              </div>

              {/* Email - International only */}
              {country !== 'India' && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email ID * (International orders)
                  </label>
                  <input type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full border rounded-lg px-3 py-2 mt-1
                               text-sm focus:outline-none"
                  />
                </div>
              )}

              {/* Address */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Address *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })}
                  placeholder="Door no, Street, Area, City..."
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none resize-none"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Pincode *
                </label>
                <input type="text"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value })}
                  placeholder="6-digit pincode"
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Delivery Charges Info */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <h3 className="font-medium text-gray-700 mb-3">
              🚚 Delivery Charges
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Orders above Rs.1000', charge: 'FREE 🎉' },
                { label: 'Tamil Nadu', charge: 'Rs.50' },
                { label: 'Other States', charge: 'Rs.150' },
                { label: 'International', charge: 'Rs.500+' },
              ].map((item) => (
                <div key={item.label}
                  className="flex justify-between">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium">{item.charge}</span>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-2">
                * Final cost may vary based on weight
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-72">
          <div className="bg-white rounded-2xl shadow-sm border
                          border-gray-100 p-6 sticky top-4">
            <h2 className="font-bold text-gray-800 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <div key={item.id}
                  className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate flex-1 mr-2">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    Rs.{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>Rs.{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className={getDeliveryCharge() === 0
                  ? 'text-green-600 font-medium' : ''}>
                  {getDeliveryCharge() === 0
                    ? 'FREE'
                    : `Rs.${getDeliveryCharge()}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg
                              border-t border-gray-100 pt-3">
                <span>Total</span>
                <span className="text-green-600">
                  Rs.{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={loading}
              className="w-full bg-blue-800 text-white py-3 rounded-xl
                         font-bold hover:bg-blue-700 mt-6
                         disabled:bg-gray-300 transition-colors">
              {loading ? 'Placing Order...' : 'Place Order ✅'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
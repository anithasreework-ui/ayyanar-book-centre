import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const Checkout = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [deliveryType, setDeliveryType] = useState('home_delivery');
  const [country, setCountry] = useState('India');
  const [step, setStep] = useState(1);
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
    if (country !== 'India') return 500;
    if (subtotal >= 1000) return 0;
    return 50;
  };

  const grandTotal = subtotal + getDeliveryCharge();

  // Step 1 Validate
  const validateStep1 = () => {
    if (deliveryType === 'store_pickup') {
      if (!form.phone) { alert('Phone number required!'); return false; }
    } else {
      if (!form.phone) { alert('Phone number required!'); return false; }
      if (!form.address) { alert('Address required!'); return false; }
      if (!form.pincode) { alert('Pincode required!'); return false; }
      if (country !== 'India' && !form.email) {
        alert('Email required for international orders!');
        return false;
      }
    }
    return true;
  };

  // Place Order
  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first!');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/orders/`,
        {
          items: cartItems.map(i => ({
            id: i.id,
            quantity: i.quantity
          })),
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
      setStep(3); // Go to success screen

    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Order failed! Try again.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // ORDER SUCCESS SCREEN
  if (step === 3 && orderResult) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <p className="text-6xl mb-4">🎉</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Order Placed!
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Order #{orderResult.order_id}
          </p>

          {/* OTP Card */}
          {orderResult.otp_code && (
            <div className="bg-purple-50 border-2 border-purple-300
                            rounded-2xl p-5 mb-4">
              <p className="text-xs text-purple-600 font-medium mb-1">
                🏪 STORE PICKUP OTP
              </p>
              <p className="text-4xl font-bold text-purple-800
                            tracking-widest mb-1">
                {orderResult.otp_code}
              </p>
              <p className="text-xs text-gray-500">
                Show this OTP at Ayyanar Book Centre, Dindigul
              </p>
            </div>
          )}

          {/* Tracking Card */}
          {orderResult.tracking_id && (
            <div className="bg-green-50 border-2 border-green-300
                            rounded-2xl p-5 mb-4">
              <p className="text-xs text-green-600 font-medium mb-1">
                🚚 TRACKING ID
              </p>
              <p className="text-4xl font-bold text-green-700
                            tracking-widest mb-1">
                {orderResult.tracking_id}
              </p>
              <p className="text-xs text-gray-500">
                Use this ID to track your order
              </p>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Subtotal</span>
              <span>Rs.{orderResult.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Delivery</span>
              <span className={orderResult.delivery_charge === 0
                ? 'text-green-600' : ''}>
                {orderResult.delivery_charge === 0
                  ? 'FREE'
                  : `Rs.${orderResult.delivery_charge}`}
              </span>
            </div>
            <div className="flex justify-between font-bold border-t
                            border-gray-200 pt-2 mt-2">
              <span>Total Paid</span>
              <span className="text-green-600">
                Rs.{orderResult.total?.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 mb-6 text-sm">
            <p className="text-gray-600">
              📞 Need help? Call{' '}
              <span className="font-bold text-blue-800">
                +91 9894235330
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 border border-blue-800 text-blue-800
                         py-3 rounded-xl font-bold hover:bg-blue-50">
              Track Order
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-800 text-white py-3 rounded-xl
                         font-bold hover:bg-blue-700">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PAYMENT SCREEN (Step 2)
  if (step === 2) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep(1)}
            className="text-blue-700 hover:underline text-sm">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Payment
          </h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-800 mb-3">Order Summary</h2>
          <div className="space-y-2 mb-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  Rs.{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>Rs.{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span className={getDeliveryCharge() === 0
                ? 'text-green-600 font-medium' : ''}>
                {getDeliveryCharge() === 0
                  ? 'FREE 🎉'
                  : `Rs.${getDeliveryCharge()}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg
                            border-t border-gray-100 pt-2 mt-1">
              <span>Total</span>
              <span className="text-green-600">
                Rs.{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method - COD for now */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-800 mb-3">Payment Method</h2>

          <div className="space-y-3">
            {/* COD */}
            <label className="flex items-center gap-3 p-4 rounded-xl
                              border-2 border-blue-800 bg-blue-50
                              cursor-pointer">
              <input type="radio" name="payment"
                defaultChecked className="accent-blue-800" />
              <div>
                <p className="font-medium text-gray-800">
                  💵 Cash on Delivery
                </p>
                <p className="text-xs text-gray-500">
                  Pay when you receive
                </p>
              </div>
            </label>

            {/* UPI */}
            <label className="flex items-center gap-3 p-4 rounded-xl
                              border-2 border-gray-100 cursor-pointer
                              hover:border-gray-200 opacity-60">
              <input type="radio" name="payment"
                disabled className="accent-blue-800" />
              <div>
                <p className="font-medium text-gray-800">
                  📱 UPI / Online Payment
                </p>
                <p className="text-xs text-gray-500">
                  Coming soon — Razorpay integration
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-3 mb-4 text-sm text-center">
          <p className="text-gray-600">
            📍 Delivery to:{' '}
            <span className="font-medium">
              {deliveryType === 'store_pickup'
                ? 'Ayyanar Book Centre, Dindigul'
                : form.address}
            </span>
          </p>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-green-600 text-white py-4 rounded-xl
                     font-bold text-lg hover:bg-green-700
                     disabled:bg-gray-300 transition-all">
          {loading
            ? '⏳ Placing Order...'
            : `✅ Confirm Order — Rs.${grandTotal.toFixed(2)}`}
        </button>
      </div>
    );
  }

  // DELIVERY DETAILS SCREEN (Step 1)
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Checkout
      </h1>

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
                  desc: 'Delivered to your door'
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

          {/* Store Pickup */}
          {deliveryType === 'store_pickup' && (
            <div className="bg-purple-50 rounded-2xl border
                            border-purple-100 p-5">
              <h2 className="font-bold text-gray-800 mb-3">
                📍 Store Address
              </h2>
              <div className="text-sm text-gray-700 space-y-1 mb-4">
                <p>🏪 Ayyanar Book Centre</p>
                <p>📍 Dindigul, Tamil Nadu - 624 001</p>
                <p>📞 +91 9894235330</p>
                <p>🕐 Mon-Sat: 9AM - 8PM</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Your Phone Number *
                </label>
                <input type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none
                             focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Home Delivery Form */}
          {deliveryType === 'home_delivery' && (
            <div className="bg-white rounded-2xl border border-gray-100
                            shadow-sm p-5 space-y-3">
              <h2 className="font-bold text-gray-800">
                Delivery Details
              </h2>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none">
                  <option value="India">🇮🇳 India</option>
                  <option value="USA">🇺🇸 USA</option>
                  <option value="UK">🇬🇧 UK</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Australia">🇦🇺 Australia</option>
                  <option value="UAE">🇦🇪 UAE</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="Other">🌍 Other</option>
                </select>
              </div>

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

              {country !== 'India' && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email ID * (International)
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

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Address *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })}
                  placeholder="Door no, Street, Area, City, State..."
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none resize-none"
                />
              </div>

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

          {/* Delivery Charges */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <h3 className="font-medium text-gray-700 mb-2 text-sm">
              🚚 Delivery Charges
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: '🎉 Above Rs.1000', charge: 'FREE' },
                { label: '🏠 Tamil Nadu', charge: 'Rs.50' },
                { label: '📦 Other States', charge: 'Rs.150' },
                { label: '✈️ International', charge: 'Rs.500+' },
              ].map((item) => (
                <div key={item.label}
                  className="flex justify-between bg-white rounded-lg p-2">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium">{item.charge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-72">
          <div className="bg-white rounded-2xl shadow-sm border
                          border-gray-100 p-5 sticky top-20">
            <h2 className="font-bold text-gray-800 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id}
                  className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate flex-1 mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    Rs.{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>Rs.{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className={getDeliveryCharge() === 0
                  ? 'text-green-600 font-medium' : ''}>
                  {getDeliveryCharge() === 0
                    ? 'FREE 🎉'
                    : `Rs.${getDeliveryCharge()}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg
                              border-t border-gray-100 pt-2">
                <span>Total</span>
                <span className="text-green-600">
                  Rs.{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="w-full bg-blue-800 text-white py-3 rounded-xl
                         font-bold hover:bg-blue-700 mt-4 transition-all">
              Proceed to Payment →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
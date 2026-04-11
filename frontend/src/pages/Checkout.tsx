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
    address: '',
    pincode: '',
    phone: '',
    alt_phone: '',
    country_code: '+91',
    email: '',
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
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const getDeliveryCharge = () => {
    if (deliveryType === 'store_pickup') return 0;
    if (country !== 'India') return 800;
    return 0; // Under 1kg free — backend calculates exact
  };

  const grandTotal = subtotal + getDeliveryCharge();

  const validateStep1 = () => {
    if (!form.phone) {
      alert('Phone number is required!');
      return false;
    }
    if (deliveryType === 'home_delivery') {
      if (!form.address) {
        alert('Delivery address is required!');
        return false;
      }
      if (!form.pincode) {
        alert('Pincode is required!');
        return false;
      }
      if (country !== 'India' && !form.email) {
        alert('Email is required for international orders!');
        return false;
      }
    }
    return true;
  };

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
          items: cartItems.map((i) => ({
            id: i.id,
            quantity: i.quantity,
          })),
          delivery_type: deliveryType,
          delivery_address: form.address,
          phone: form.phone,
          alt_phone: form.alt_phone,
          pincode: form.pincode,
          country,
          country_code: form.country_code,
          email: form.email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.removeItem('cart');
      setOrderResult(res.data);
      setStep(3);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || 'Order failed! Please try again.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // ===== SUCCESS SCREEN =====
  if (step === 3 && orderResult) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <p className="text-6xl mb-4">🎉</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Order #{orderResult.order_id}
          </p>

          {/* Store Pickup OTP */}
          {orderResult.otp_code && (
            <div className="bg-purple-50 border-2 border-purple-300
                            rounded-2xl p-5 mb-4">
              <p className="text-xs text-purple-600 font-medium mb-1">
                🏪 STORE PICKUP OTP
              </p>
              <p className="text-5xl font-bold text-purple-800
                            tracking-widest mb-2">
                {orderResult.otp_code}
              </p>
              <p className="text-xs text-gray-500">
                Show this OTP at Ayyanar Book Centre counter, Dindigul
              </p>
              <p className="text-xs text-gray-400 mt-1">
                📞 +91 9894235330 | Mon–Sat: 9AM–8PM
              </p>
              <div className="mt-3 bg-yellow-50 border border-yellow-200
                              rounded-lg p-2">
                <p className="text-xs text-yellow-700 font-medium">
                  ⚠️ Save this OTP! You can also find it in My Orders.
                </p>
              </div>
            </div>
          )}

          {/* Online Tracking ID */}
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
                Use this ID to track your order delivery
              </p>
              <div className="mt-3 bg-yellow-50 border border-yellow-200
                              rounded-lg p-2">
                <p className="text-xs text-yellow-700 font-medium">
                  ⚠️ Save this ID! You can also find it in My Orders.
                </p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
            <p className="font-medium text-gray-700 mb-2 text-sm">
              Order Summary
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>Rs.{orderResult.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className={
                  orderResult.delivery_charge === 0
                    ? 'text-green-600 font-medium'
                    : ''
                }>
                  {orderResult.delivery_charge === 0
                    ? 'FREE 🎉'
                    : `Rs.${orderResult.delivery_charge}`}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t
                              border-gray-200 pt-2 mt-1">
                <span>Total Paid</span>
                <span className="text-green-600">
                  Rs.{orderResult.total?.toFixed(2)}
                </span>
              </div>
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
              onClick={() => navigate('/my-orders')}
              className="flex-1 border-2 border-blue-800 text-blue-800
                         py-3 rounded-xl font-bold hover:bg-blue-50
                         transition-colors">
              📋 My Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-800 text-white py-3 rounded-xl
                         font-bold hover:bg-blue-700 transition-colors">
              🛍️ Shop More
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PAYMENT SCREEN (Step 2) =====
  if (step === 2) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-blue-800 text-white
                            text-xs flex items-center justify-center
                            font-bold">
              1
            </div>
            <span className="text-xs text-gray-500">Details</span>
          </div>
          <div className="flex-1 h-0.5 bg-blue-800" />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-blue-800 text-white
                            text-xs flex items-center justify-center
                            font-bold">
              2
            </div>
            <span className="text-xs font-medium text-blue-800">
              Payment
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500
                            text-xs flex items-center justify-center
                            font-bold">
              3
            </div>
            <span className="text-xs text-gray-400">Done</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep(1)}
            className="text-blue-700 hover:underline text-sm">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Payment</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-800 mb-3">Order Summary</h2>
          <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.id}
                className="flex justify-between text-sm">
                <span className="text-gray-600 truncate flex-1 mr-2">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium whitespace-nowrap">
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
              <span className={
                getDeliveryCharge() === 0
                  ? 'text-green-600 font-medium'
                  : ''
              }>
                {getDeliveryCharge() === 0
                  ? 'FREE 🎉'
                  : `Rs.${getDeliveryCharge()}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base
                            border-t border-gray-100 pt-2 mt-1">
              <span>Total</span>
              <span className="text-green-600">
                Rs.{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
          <p className="text-gray-600">
            {deliveryType === 'store_pickup'
              ? '🏪 Pickup: Ayyanar Book Centre, Dindigul'
              : `🚚 Delivering to: ${form.address}, ${form.pincode}`}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            📞 {form.phone}
          </p>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-800 mb-3">
            Payment Method
          </h2>

          {/* Store Pickup — Prepaid Notice */}
          {deliveryType === 'store_pickup' && (
            <div className="bg-purple-50 border border-purple-200
                            rounded-xl p-3 mb-3">
              <p className="text-purple-800 font-medium text-sm">
                🏪 Store Pickup — Prepaid Orders Only
              </p>
              <p className="text-purple-600 text-xs mt-1">
                Complete payment here. Collect at store with OTP.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {/* COD — Home Delivery Only */}
            {deliveryType === 'home_delivery' && (
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
                    Pay when you receive your order
                  </p>
                </div>
              </label>
            )}

            {/* Online Payment */}
            <label className={`flex items-center gap-3 p-4 rounded-xl
                              border-2 cursor-pointer ${
              deliveryType === 'store_pickup'
                ? 'border-blue-800 bg-blue-50'
                : 'border-gray-200 opacity-60'
            }`}>
              <input type="radio" name="payment"
                defaultChecked={deliveryType === 'store_pickup'}
                disabled={deliveryType === 'home_delivery'}
                className="accent-blue-800"
              />
              <div>
                <p className="font-medium text-gray-800">
                  📱 UPI / Online Payment
                </p>
                <p className="text-xs text-gray-500">
                  {deliveryType === 'store_pickup'
                    ? 'Pay online — collect at store with OTP'
                    : 'Coming soon — Razorpay integration'}
                </p>
              </div>
            </label>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-green-600 text-white py-4 rounded-xl
                     font-bold text-lg hover:bg-green-700
                     disabled:bg-gray-300 transition-all shadow-md">
          {loading
            ? '⏳ Placing Order...'
            : deliveryType === 'store_pickup'
            ? `✅ Confirm & Pay — Rs.${grandTotal.toFixed(2)}`
            : `✅ Confirm Order — Rs.${grandTotal.toFixed(2)}`}
        </button>
      </div>
    );
  }

  // ===== DELIVERY DETAILS (Step 1) =====
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-6 max-w-xs">
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-blue-800 text-white
                          text-xs flex items-center justify-center
                          font-bold">
            1
          </div>
          <span className="text-xs font-medium text-blue-800">
            Details
          </span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500
                          text-xs flex items-center justify-center
                          font-bold">
            2
          </div>
          <span className="text-xs text-gray-400">Payment</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200" />
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500
                          text-xs flex items-center justify-center
                          font-bold">
            3
          </div>
          <span className="text-xs text-gray-400">Done</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">

          {/* Delivery Type Selection */}
          <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">
              Select Delivery Option
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: 'home_delivery',
                  icon: '🚚',
                  label: 'Home Delivery',
                  desc: 'Delivered to your door',
                  badge: null,
                },
                {
                  value: 'store_pickup',
                  icon: '🏪',
                  label: 'Store Pickup',
                  desc: 'Collect at Dindigul',
                  badge: 'Prepaid Only',
                },
              ].map((opt) => (
                <label key={opt.value}
                  className={`flex flex-col items-center p-4 rounded-xl
                             border-2 cursor-pointer transition-all
                             relative ${
                    deliveryType === opt.value
                      ? 'border-blue-800 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  {opt.badge && (
                    <span className="absolute top-2 right-2 bg-purple-600
                                     text-white text-xs px-1.5 py-0.5
                                     rounded-full">
                      {opt.badge}
                    </span>
                  )}
                  <input type="radio" name="delivery"
                    value={opt.value}
                    checked={deliveryType === opt.value}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="hidden"
                  />
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
            <div className="bg-purple-50 rounded-2xl border
                            border-purple-100 p-5">
              <h2 className="font-bold text-gray-800 mb-3">
                📍 Store Address
              </h2>
              <div className="text-sm text-gray-700 space-y-1 mb-4">
                <p className="font-medium">🏪 Ayyanar Book Centre</p>
                <p>📍 Dindigul, Tamil Nadu – 624 001</p>
                <p>📞 +91 9894235330</p>
                <p>🕐 Mon–Sat: 9:00 AM – 8:00 PM</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200
                              rounded-xl p-3 mb-4">
                <p className="text-xs text-yellow-700 font-medium">
                  ⚠️ Store pickup is for PREPAID orders only.
                  You will receive an OTP after payment to collect
                  your order.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Your Phone Number *
                </label>
                <input type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="+91 9894235330"
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

              {/* Country */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none
                             focus:border-blue-500">
                  <option value="India">🇮🇳 India</option>
                  <option value="USA">🇺🇸 USA</option>
                  <option value="UK">🇬🇧 UK</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Australia">🇦🇺 Australia</option>
                  <option value="UAE">🇦🇪 UAE</option>
                  <option value="Singapore">🇸🇬 Singapore</option>
                  <option value="Malaysia">🇲🇾 Malaysia</option>
                  <option value="Other">🌍 Other Country</option>
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
                      setForm({ ...form, country_code: e.target.value })
                    }
                    placeholder="+91"
                    className="w-full border rounded-lg px-3 py-2 mt-1
                               text-sm focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="Phone number"
                    className="w-full border rounded-lg px-3 py-2 mt-1
                               text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Alt Phone */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Alternate Phone (Optional)
                </label>
                <input type="tel"
                  value={form.alt_phone}
                  onChange={(e) =>
                    setForm({ ...form, alt_phone: e.target.value })
                  }
                  placeholder="Alternative contact number"
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none"
                />
              </div>

              {/* Email — International */}
              {country !== 'India' && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email ID * (Required for international)
                  </label>
                  <input type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    className="w-full border rounded-lg px-3 py-2 mt-1
                               text-sm focus:outline-none"
                  />
                </div>
              )}

              {/* Address */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Delivery Address *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Door no, Street, Area, City, State..."
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
                    setForm({ ...form, pincode: e.target.value })
                  }
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Delivery Charges Info */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100
                          p-4">
            <h3 className="font-medium text-gray-700 mb-2 text-sm">
              🚚 Delivery Charges
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: '🆓 Under 1kg — India', charge: 'FREE' },
                { label: '📦 1–2 kg', charge: 'Rs.80' },
                { label: '📦 2–5 kg', charge: 'Rs.150' },
                { label: '✈️ International', charge: 'Rs.800+' },
              ].map((item) => (
                <div key={item.label}
                  className="flex justify-between bg-white rounded-lg
                             px-3 py-2 border border-gray-100">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-blue-700">
                    {item.charge}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">
              * Final charge calculated at checkout based on weight
            </p>
          </div>
        </div>

        {/* Order Summary Sidebar */}
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
                <span className="text-green-600 font-medium">
                  Calculated at next step
                </span>
              </div>
              <div className="flex justify-between font-bold text-base
                              border-t border-gray-100 pt-2">
                <span>Items Total</span>
                <span className="text-gray-800">
                  Rs.{subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="w-full bg-blue-800 text-white py-3 rounded-xl
                         font-bold hover:bg-blue-700 mt-4
                         transition-all text-base">
              Proceed to Payment →
            </button>

            <button
              onClick={() => navigate('/cart')}
              className="w-full border border-gray-200 text-gray-500
                         py-2 rounded-xl mt-2 text-sm
                         hover:bg-gray-50 transition-colors">
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const Checkout = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [deliveryType, setDeliveryType] = useState('home_delivery');
  const [country, setCountry] = useState('India');
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [form, setForm] = useState({
    full_name: '',
    door_number: '',
    street: '',
    area: '',
    city: '',
    state: '',
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

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (!stored || JSON.parse(stored).length === 0) {
      navigate('/cart');
      return;
    }
    setCartItems(JSON.parse(stored));

    // Auto-fill from profile
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then((res) => {
        setForm(prev => ({
          ...prev,
          phone: res.data.phone || '',
          address: res.data.address || '',
          pincode: res.data.pincode || '',
          email: '',
          country_code: '+91',
          alt_phone: '',
        }));
      }).catch(() => {});
    }

    // Store pickup → always UPI
    if (deliveryType === 'store_pickup') {
      setSelectedPayment('upi');
    }
  }, []);

  useEffect(() => {
    if (deliveryType === 'store_pickup') {
      setSelectedPayment('upi');
    } else {
      setSelectedPayment('cod');
    }
  }, [deliveryType]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const getDeliveryCharge = () => {
    if (deliveryType === 'store_pickup') return 0;
    if (country !== 'India') return 800;
    return 0;
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
      // Build full address from form fields
      const fullAddress = [
        form.door_number,
        form.street,
        form.area,
        form.city,
        form.state,
        form.pincode,
        country,
      ].filter(Boolean).join(', ');

      // Step 1: Create order in DB
      const orderRes = await axios.post(
        `${API}/orders/`,
        {
          items: cartItems.map((i) => ({
            id: i.id,
            quantity: i.quantity,
          })),
          delivery_type: deliveryType,
          delivery_address: fullAddress,
          phone: form.phone,
          alt_phone: form.alt_phone,
          pincode: form.pincode,
          country,
          country_code: form.country_code,
          email: form.email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderData = orderRes.data;

      // COD — No payment now
      if (selectedPayment === 'cod') {
        // Save COD payment record
        await axios.post(
          `${API}/payment/cod-pending`,
          { order_id: orderData.order_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        localStorage.removeItem('cart');
        setOrderResult({
          ...orderData,
          payment_method: 'cod',
          payment_status: 'pending',
        });
        setStep(3);
        setLoading(false);
        return;
      }

      // UPI / Online Payment — Razorpay
      const rzpRes = await axios.post(
        `${API}/payment/create-order`,
        {
          amount: orderData.total,
          order_id: orderData.order_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rzpData = rzpRes.data;

      const options = {
        key: rzpData.key_id,
        amount: Math.round(orderData.total * 100),
        currency: 'INR',
        name: 'Ayyanar Book Centre',
        description: `Order #${orderData.order_id} — Dindigul`,
        image: '/logo.jpg',
        order_id: rzpData.razorpay_order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await axios.post(
              `${API}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                shop_order_id: orderData.order_id,
                amount: orderData.total,
                payment_method: 'upi',
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.status === 'success') {
              localStorage.removeItem('cart');
              setOrderResult({
                ...orderData,
                payment_method: 'upi',
                payment_status: 'success',
                payment_id: response.razorpay_payment_id,
              });
              setStep(3);
            }
          } catch {
            alert(
              '⚠️ Payment done but verification failed!\n' +
              'Please contact us: +91 9894235330\n' +
              `Order ID: ${orderData.order_id}`
            );
          }
          setLoading(false);
        },
        prefill: {
          name: user?.name || '',
          contact: form.phone,
          email: form.email || '',
        },
        theme: {
          color: '#1a4a2e',
        },
        modal: {
          ondismiss: () => {
            alert(
              'Payment cancelled! Your order was not placed.\n' +
              'Please try again.'
            );
            setLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', (response: any) => {
        alert(
          `❌ Payment Failed!\n` +
          `Reason: ${response.error.description}\n` +
          `Please try again or contact +91 9894235330`
        );
        setLoading(false);
      });

      rzp.open();

    } catch (err: any) {
      const msg = err.response?.data?.detail ||
        'Order failed! Please try again.';
      alert(msg);
      setLoading(false);
    }
  };

  // ===== SUCCESS SCREEN =====
  if (step === 3 && orderResult) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-3xl shadow-lg p-8">

          {/* Payment Status */}
          {orderResult.payment_method === 'upi' &&
           orderResult.payment_status === 'success' ? (
            <>
              <p className="text-6xl mb-3">🎉</p>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Payment Successful!
              </h1>
              <p className="text-green-600 font-medium mb-1">
                ✅ Order Confirmed
              </p>
            </>
          ) : orderResult.payment_method === 'cod' ? (
            <>
              <p className="text-6xl mb-3">📦</p>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Order Placed!
              </h1>
              <div className="bg-orange-50 border border-orange-200
                              rounded-xl px-4 py-2 mb-2 inline-block">
                <p className="text-orange-700 font-medium text-sm">
                  💵 Cash on Delivery — Pay when you receive
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-6xl mb-3">🎉</p>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Order Placed!
              </h1>
            </>
          )}

          <p className="text-gray-500 text-sm mb-5">
            Order #{orderResult.order_id}
          </p>

          {/* Store Pickup OTP */}
          {orderResult.otp_code && (
            <div className="border-2 border-purple-300 rounded-2xl
                            p-5 mb-4"
              style={{ background: '#f5f0ff' }}>
              <p className="text-xs text-purple-600 font-medium mb-1">
                🏪 STORE PICKUP OTP
              </p>
              <p className="text-5xl font-bold text-purple-800
                            tracking-widest mb-2">
                {orderResult.otp_code}
              </p>
              <p className="text-xs text-gray-500">
                Show this OTP at Ayyanar Book Centre, Dindigul
              </p>
              <p className="text-xs text-gray-400 mt-1">
                📞 +91 9894235330 | Mon–Sat: 9AM–9PM
              </p>
              <div className="mt-3 bg-yellow-50 border border-yellow-200
                              rounded-lg p-2">
                <p className="text-xs text-yellow-700 font-medium">
                  ⚠️ Save this OTP! Also available in My Orders.
                </p>
              </div>
            </div>
          )}

          {/* Tracking ID */}
          {orderResult.tracking_id && (
            <div className="border-2 border-green-300 rounded-2xl
                            p-4 mb-4"
              style={{ background: '#f0fff4' }}>
              <p className="text-xs text-green-600 font-medium mb-1">
                🚚 TRACKING ID
              </p>
              <p className="text-3xl font-bold text-green-700
                            tracking-widest mb-1">
                {orderResult.tracking_id}
              </p>
              <p className="text-xs text-gray-500">
                Use this to track your delivery
              </p>
              <div className="mt-2 bg-yellow-50 border border-yellow-200
                              rounded-lg p-2">
                <p className="text-xs text-yellow-700 font-medium">
                  ⚠️ Save this ID! Also available in My Orders.
                </p>
              </div>
            </div>
          )}

          {/* COD Info */}
          {orderResult.payment_method === 'cod' && (
            <div className="bg-orange-50 border border-orange-200
                            rounded-xl p-4 mb-4 text-left">
              <p className="font-medium text-orange-800 mb-2 text-sm">
                💵 Cash on Delivery Instructions:
              </p>
              <ul className="space-y-1 text-xs text-orange-700">
                <li>• Keep exact change ready at delivery</li>
                <li>• Delivery person will enter OTP after payment</li>
                <li>• Order status updates to "Delivered" after COD OTP</li>
                <li>• Record unboxing video when you receive</li>
              </ul>
            </div>
          )}

          {/* Payment ID */}
          {orderResult.payment_id && (
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-xs
                            text-gray-500">
              Payment ID: {orderResult.payment_id}
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
                    ? 'font-medium'
                    : ''
                }
                  style={{
                    color: orderResult.delivery_charge === 0
                      ? '#1a4a2e' : 'inherit'
                  }}>
                  {orderResult.delivery_charge === 0
                    ? 'FREE 🎉'
                    : `Rs.${orderResult.delivery_charge}`}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t
                              border-gray-200 pt-2 mt-1">
                <span>Total</span>
                <span style={{ color: '#1a4a2e' }}>
                  Rs.{orderResult.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 mb-5 text-sm">
            <p className="text-gray-600">
              📞 Need help?{' '}
              <span className="font-bold" style={{ color: '#1a4a2e' }}>
                +91 9894235330
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/my-orders')}
              className="flex-1 border-2 py-3 rounded-xl font-bold
                         transition-colors"
              style={{
                borderColor: '#1a4a2e',
                color: '#1a4a2e'
              }}>
              📋 My Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 text-white py-3 rounded-xl font-bold
                         transition-colors"
              style={{ background: '#1a4a2e' }}>
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

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6 max-w-xs">
          {[
            { n: 1, label: 'Details' },
            { n: 2, label: 'Payment' },
            { n: 3, label: 'Done' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full text-xs flex
                                items-center justify-center font-bold ${
                  s.n <= step
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
                  style={s.n <= step
                    ? { background: '#1a4a2e' }
                    : {}}>
                  {s.n}
                </div>
                <span className={`text-xs ${
                  s.n === step
                    ? 'font-medium'
                    : 'text-gray-400'
                }`}
                  style={s.n === step ? { color: '#1a4a2e' } : {}}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`flex-1 h-0.5 ${
                  s.n < step ? '' : 'bg-gray-200'
                }`}
                  style={s.n < step
                    ? { background: '#1a4a2e' }
                    : {}} />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setStep(1)}
            className="text-sm hover:underline"
            style={{ color: '#1a4a2e' }}>
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
                getDeliveryCharge() === 0 ? 'font-medium' : ''
              }
                style={getDeliveryCharge() === 0
                  ? { color: '#1a4a2e' } : {}}>
                {getDeliveryCharge() === 0
                  ? 'FREE 🎉'
                  : `Rs.${getDeliveryCharge()}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base
                            border-t border-gray-100 pt-2 mt-1">
              <span>Total</span>
              <span style={{ color: '#1a4a2e' }}>
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
              : `🚚 Deliver to: ${form.address}, ${form.pincode}`}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            📞 {form.phone}
          </p>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-800 mb-3">
            Payment Method
          </h2>

          {/* Store Pickup Notice */}
          {deliveryType === 'store_pickup' && (
            <div className="rounded-xl p-3 mb-3"
              style={{ background: '#f0f7f4',
                       border: '1px solid #a8d5b5' }}>
              <p className="font-medium text-sm"
                style={{ color: '#1a4a2e' }}>
                🏪 Store Pickup — Prepaid Orders Only
              </p>
              <p className="text-xs mt-1 text-gray-600">
                Pay online now. Collect at store with your OTP.
              </p>
            </div>
          )}

          <div className="space-y-3">

            {/* COD — Home Delivery Only */}
            {deliveryType === 'home_delivery' && (
              <label className={`flex items-center gap-3 p-4 rounded-xl
                                border-2 cursor-pointer transition-all ${
                selectedPayment === 'cod'
                  ? 'bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
                style={selectedPayment === 'cod'
                  ? { borderColor: '#f97316' }
                  : {}}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={selectedPayment === 'cod'}
                  onChange={() => setSelectedPayment('cod')}
                  className="accent-orange-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    💵 Cash on Delivery
                  </p>
                  <p className="text-xs text-gray-500">
                    Pay when you receive • Delivery OTP confirmation
                  </p>
                </div>
                {selectedPayment === 'cod' && (
                  <span className="text-xs bg-orange-100 text-orange-700
                                   px-2 py-0.5 rounded-full font-medium">
                    Selected
                  </span>
                )}
              </label>
            )}

            {/* UPI / Online */}
            <label className={`flex items-center gap-3 p-4 rounded-xl
                              border-2 cursor-pointer transition-all ${
              selectedPayment === 'upi'
                ? 'bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
              style={selectedPayment === 'upi'
                ? { borderColor: '#1a4a2e' }
                : {}}>
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={selectedPayment === 'upi'}
                onChange={() => setSelectedPayment('upi')}
                className="accent-green-700"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  📱 UPI / GPay / PhonePe / Cards
                </p>
                <p className="text-xs text-gray-500">
                  {deliveryType === 'store_pickup'
                    ? 'Pay online → Get OTP → Collect at store'
                    : 'Secure online payment via Razorpay'}
                </p>
                <div className="flex gap-1 mt-1">
                  {['GPay', 'PhonePe', 'Paytm', 'UPI', 'Cards'].map((m) => (
                    <span key={m}
                      className="text-xs bg-gray-100 text-gray-600
                                 px-1.5 py-0.5 rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              {selectedPayment === 'upi' && (
                <span className="text-xs px-2 py-0.5 rounded-full
                                 font-medium text-white"
                  style={{ background: '#1a4a2e' }}>
                  Selected
                </span>
              )}
            </label>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full text-white py-4 rounded-xl font-bold
                     text-lg disabled:bg-gray-300 transition-all
                     shadow-md"
          style={loading ? {} : {
            background: selectedPayment === 'cod'
              ? '#ea580c'
              : '#1a4a2e'
          }}>
          {loading
            ? '⏳ Processing...'
            : selectedPayment === 'cod'
            ? `📦 Place COD Order — Rs.${grandTotal.toFixed(2)}`
            : `💳 Pay Rs.${grandTotal.toFixed(2)} Online`}
        </button>

        <p className="text-center text-xs text-gray-400 mt-2">
          🔒 Secured by Razorpay — 256-bit SSL Encryption
        </p>
      </div>
    );
  }

  // ===== DELIVERY DETAILS (Step 1) =====
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6 max-w-xs">
        {[
          { n: 1, label: 'Details' },
          { n: 2, label: 'Payment' },
          { n: 3, label: 'Done' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full text-xs flex
                              items-center justify-center font-bold ${
                s.n <= step
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
                style={s.n <= step
                  ? { background: '#1a4a2e' }
                  : {}}>
                {s.n}
              </div>
              <span className={`text-xs ${
                s.n === step ? 'font-medium' : 'text-gray-400'
              }`}
                style={s.n === step ? { color: '#1a4a2e' } : {}}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className={`flex-1 h-0.5 ${
                s.n < step ? '' : 'bg-gray-200'
              }`}
                style={s.n < step
                  ? { background: '#1a4a2e' }
                  : {}} />
            )}
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">

          {/* Delivery Type */}
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
                      ? 'bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={deliveryType === opt.value
                    ? { borderColor: '#1a4a2e' }
                    : {}}>
                  {opt.badge && (
                    <span className="absolute top-2 right-2 text-white
                                     text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: '#7c3aed' }}>
                      {opt.badge}
                    </span>
                  )}
                  <input
                    type="radio"
                    name="delivery"
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
            <div className="rounded-2xl border p-5"
              style={{
                background: '#f0f7f4',
                borderColor: '#a8d5b5'
              }}>
              <h2 className="font-bold text-gray-800 mb-3">
                📍 Store Address
              </h2>
              <div className="text-sm text-gray-700 space-y-1 mb-4">
                <p className="font-medium">🏪 Ayyanar Book Centre</p>
                <p>📍 14, Dudley School Building, AMC Road</p>
                <p>Dindigul, Tamil Nadu – 624 001</p>
                <p>📞 +91 9894235330</p>
                <p>🕐 Mon–Sat: 9:00 AM – 9:00 PM</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200
                              rounded-xl p-3 mb-4">
                <p className="text-xs text-yellow-700 font-medium">
                  ⚠️ Store pickup is PREPAID only.
                  Pay online now. Get OTP. Collect at store.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Your Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="+91 XXXXXXXXXX"
                  className="w-full border rounded-lg px-3 py-2 mt-1
                             text-sm focus:outline-none"
                  style={{ borderColor: '#a8d5b5' }}
                />
              </div>
            </div>
          )}

          {/* Home Delivery Form */}
          {deliveryType === 'home_delivery' && (
            <div className="bg-white rounded-2xl border border-gray-100
                    shadow-sm p-5 space-y-4">
      <h2 className="font-bold text-gray-800 text-lg">
        Delivery Address
      </h2>

      {/* Full Name */}
      <div>
        <label className="text-xs font-700 text-gray-500
                           uppercase tracking-wide block mb-1">
          Full Name *
        </label>
        <input type="text"
          value={form.full_name || ''}
          onChange={(e) => setForm({
            ...form, full_name: e.target.value
          })}
          placeholder="Enter your full name"
          className="w-full border border-gray-200 rounded-lg
                     px-4 py-2.5 text-sm focus:outline-none
                     focus:border-green-500"
        />
      </div>

      {/* Phone */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-700 text-gray-500
                             uppercase tracking-wide block mb-1">
            Country Code *
          </label>
          <select
            value={form.country_code}
            onChange={(e) => setForm({
              ...form, country_code: e.target.value
            })}
            className="w-full border border-gray-200 rounded-lg
                       px-2 py-2.5 text-sm focus:outline-none
                       focus:border-green-500">
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+61">🇦🇺 +61</option>
            <option value="+971">🇦🇪 +971</option>
            <option value="+65">🇸🇬 +65</option>
            <option value="+60">🇲🇾 +60</option>
            <option value="+94">🇱🇰 +94</option>
            <option value="+966">🇸🇦 +966</option>
            <option value="+974">🇶🇦 +974</option>
            <option value="+49">🇩🇪 +49</option>
            <option value="+33">🇫🇷 +33</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-700 text-gray-500
                             uppercase tracking-wide block mb-1">
            Phone Number *
          </label>
          <input type="tel"
            value={form.phone}
            onChange={(e) => setForm({
              ...form, phone: e.target.value
            })}
            placeholder="Phone number"
            className="w-full border border-gray-200 rounded-lg
                       px-4 py-2.5 text-sm focus:outline-none
                       focus:border-green-500"
          />
        </div>
      </div>

      {/* Door Number + Street */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-700 text-gray-500
                             uppercase tracking-wide block mb-1">
            Door / Flat Number *
          </label>
          <input type="text"
            value={form.door_number || ''}
            onChange={(e) => setForm({
              ...form, door_number: e.target.value
            })}
            placeholder="e.g. 14A, Flat 3B"
            className="w-full border border-gray-200 rounded-lg
                       px-4 py-2.5 text-sm focus:outline-none
                       focus:border-green-500"
          />
        </div>
        <div>
          <label className="text-xs font-700 text-gray-500
                             uppercase tracking-wide block mb-1">
            Street / Road Name *
          </label>
          <input type="text"
            value={form.street || ''}
            onChange={(e) => setForm({
              ...form, street: e.target.value
            })}
            placeholder="e.g. AMC Road"
            className="w-full border border-gray-200 rounded-lg
                       px-4 py-2.5 text-sm focus:outline-none
                       focus:border-green-500"
          />
        </div>
      </div>

      {/* Area / Locality */}
      <div>
        <label className="text-xs font-700 text-gray-500
                           uppercase tracking-wide block mb-1">
          Area / Locality / Nearest Landmark *
        </label>
        <input type="text"
          value={form.area || ''}
          onChange={(e) => setForm({
            ...form, area: e.target.value
          })}
          placeholder="e.g. Near Bus Stand, Gandhi Nagar"
          className="w-full border border-gray-200 rounded-lg
                     px-4 py-2.5 text-sm focus:outline-none
                     focus:border-green-500"
        />
      </div>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-700 text-gray-500
                             uppercase tracking-wide block mb-1">
            City / Town *
          </label>
          <input type="text"
            value={form.city || ''}
            onChange={(e) => setForm({
              ...form, city: e.target.value
            })}
            placeholder="e.g. Dindigul"
            className="w-full border border-gray-200 rounded-lg
                       px-4 py-2.5 text-sm focus:outline-none
                       focus:border-green-500"
          />
        </div>
        <div>
          <label className="text-xs font-700 text-gray-500
                             uppercase tracking-wide block mb-1">
            State / Province *
          </label>
          <input type="text"
            value={form.state || ''}
            onChange={(e) => setForm({
              ...form, state: e.target.value
            })}
            placeholder="e.g. Tamil Nadu"
            className="w-full border border-gray-200 rounded-lg
                       px-4 py-2.5 text-sm focus:outline-none
                       focus:border-green-500"
          />
        </div>
      </div>

      {/* Pincode + Country */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-700 text-gray-500
                             uppercase tracking-wide block mb-1">
            Pincode / ZIP Code *
          </label>
          <input type="text"
            value={form.pincode}
            onChange={(e) => setForm({
              ...form, pincode: e.target.value
            })}
            placeholder="e.g. 624001"
            maxLength={10}
            className="w-full border border-gray-200 rounded-lg
                       px-4 py-2.5 text-sm focus:outline-none
                       focus:border-green-500"
          />
        </div>
        <div>
          <label className="text-xs font-700 text-gray-500
                             uppercase tracking-wide block mb-1">
            Country *
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border border-gray-200 rounded-lg
                       px-4 py-2.5 text-sm focus:outline-none
                       focus:border-green-500">
            <option value="India">🇮🇳 India</option>
            <option value="USA">🇺🇸 United States</option>
            <option value="UK">🇬🇧 United Kingdom</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Australia">🇦🇺 Australia</option>
            <option value="UAE">🇦🇪 UAE</option>
            <option value="Singapore">🇸🇬 Singapore</option>
            <option value="Malaysia">🇲🇾 Malaysia</option>
            <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
            <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
            <option value="Qatar">🇶🇦 Qatar</option>
            <option value="Kuwait">🇰🇼 Kuwait</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="France">🇫🇷 France</option>
            <option value="Other">🌍 Other Country</option>
          </select>
        </div>
      </div>

      {/* Alt Phone */}
      <div>
        <label className="text-xs font-700 text-gray-500
                           uppercase tracking-wide block mb-1">
          Alternate Phone (Optional)
        </label>
        <input type="tel"
          value={form.alt_phone}
          onChange={(e) => setForm({
            ...form, alt_phone: e.target.value
          })}
          placeholder="Alternative contact number"
          className="w-full border border-gray-200 rounded-lg
                     px-4 py-2.5 text-sm focus:outline-none
                     focus:border-green-500"
        />
      </div>

      {/* Delivery Note */}
      <div className="bg-blue-50 rounded-xl p-3 text-xs
                      text-blue-700">
        📦 Please ensure someone is available to receive
        the package at this address.
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
                  <span className="font-medium"
                    style={{ color: '#1a4a2e' }}>
                    {item.charge}
                  </span>
                </div>
              ))}
            </div>
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
                <span className="text-sm font-medium"
                  style={{ color: '#1a4a2e' }}>
                  Calculated at payment
                </span>
              </div>
              <div className="flex justify-between font-bold text-base
                              border-t border-gray-100 pt-2">
                <span>Items Total</span>
                <span>Rs.{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="w-full text-white py-3 rounded-xl font-bold
                         mt-4 transition-all text-base"
              style={{ background: '#1a4a2e' }}>
              Proceed to Payment →
            </button>

            <button
              onClick={() => navigate('/cart')}
              className="w-full border border-gray-200 text-gray-500
                         py-2 rounded-xl mt-2 text-sm hover:bg-gray-50">
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
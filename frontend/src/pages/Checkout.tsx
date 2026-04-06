import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [deliveryType, setDeliveryType] = useState('home_delivery');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (!stored || JSON.parse(stored).length === 0) {
      navigate('/cart');
      return;
    }
    setCartItems(JSON.parse(stored));
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );
  const deliveryCharge = total >= 500 ? 0 : 50;
  const grandTotal = total + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (deliveryType === 'home_delivery' && !address.trim()) {
      alert('Please enter delivery address!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem('cart');
      alert('Order placed successfully!');
      navigate('/orders');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">Delivery Option</h2>
            <div className="space-y-3">
              {[
                { value: 'home_delivery', label: 'Home Delivery', desc: 'Delivered to your address' },
                { value: 'store_pickup', label: 'Store Pickup', desc: 'Collect at Dindigul shop' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryType === option.value
                      ? 'border-blue-800 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={option.value}
                    checked={deliveryType === option.value}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="accent-blue-800"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {deliveryType === 'home_delivery' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4">Delivery Address</h2>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full address with pincode..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          )}

          {deliveryType === 'store_pickup' && (
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <h2 className="font-bold text-gray-800 mb-2">Shop Address</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                Ayyanar Book Centre<br />
                Dindigul, Tamil Nadu<br />
                India - 624 001<br /><br />
                Mon-Sat: 9:00 AM - 8:00 PM
              </p>
            </div>
          )}
        </div>

        <div className="lg:w-72">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
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
                <span>Rs.{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryCharge === 0 ? 'FREE' : 'Rs.50'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-3 mt-2">
                <span>Grand Total</span>
                <span className="text-green-600">Rs.{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-blue-800 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors mt-6 disabled:bg-gray-300"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
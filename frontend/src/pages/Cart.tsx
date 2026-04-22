import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  category: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  const saveCart = (updated: CartItem[]) => {
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const increase = (id: number) =>
    saveCart(cartItems.map((i) =>
      i.id === id ? { ...i, quantity: i.quantity + 1 } : i
    ));

  const decrease = (id: number) =>
    saveCart(
      cartItems
        .map((i) => i.id === id
          ? { ...i, quantity: i.quantity - 1 } : i)
        .filter((i) => i.quantity > 0)
    );

  const remove = (id: number) =>
    saveCart(cartItems.filter((i) => i.id !== id));

  const total = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity, 0
  );

  const totalItems = cartItems.reduce(
    (sum, i) => sum + i.quantity, 0
  );

  const handleCheckout = () => {
    if (!localStorage.getItem('token')) {
      alert('Please login first!');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center
                      justify-center text-center px-4"
        style={{ background: '#fafaf8' }}>
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2"
          style={{ fontFamily: 'Georgia, serif' }}>
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-8">
          Add books to get started!
        </p>
        <button
          onClick={() => navigate('/products')}
          className="text-white px-8 py-3 rounded-full font-bold
                     hover:opacity-90 transition-all text-lg
                     hover:scale-105 active:scale-95"
          style={{ background: '#1a4a2e' }}>
          Browse Books →
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold text-gray-800"
            style={{ fontFamily: 'Georgia, serif' }}>
            Your Cart
          </h1>
          <span className="text-white text-sm px-3 py-1
                           rounded-full font-medium"
            style={{ background: '#1a4a2e' }}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Cart Items */}
          <div className="flex-1 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id}
                className="bg-white rounded-2xl p-4 flex gap-4
                           items-center"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden
                                flex-shrink-0"
                  style={{ background: '#f8f5f0' }}>
                  <img
                    src={item.image_url ||
                      'https://via.placeholder.com/80x80/f8f5f0/1a4a2e?text=📚'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.src =
                        'https://via.placeholder.com/80x80/f8f5f0/1a4a2e?text=📚';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm
                                 leading-tight truncate"
                    style={{ fontFamily: 'Georgia, serif' }}>
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    {item.category.replace('_', ' ')}
                  </p>
                  <p className="font-bold mt-1"
                    style={{ color: '#1a4a2e' }}>
                    ₹{item.price}
                  </p>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => decrease(item.id)}
                    className="w-8 h-8 rounded-full flex items-center
                               justify-center font-bold text-gray-600
                               transition-all hover:scale-110
                               active:scale-90"
                    style={{ background: '#f3f4f6' }}>
                    −
                  </button>
                  <span className="w-6 text-center font-bold
                                   text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => increase(item.id)}
                    className="w-8 h-8 rounded-full flex items-center
                               justify-center font-bold text-white
                               transition-all hover:scale-110
                               active:scale-90"
                    style={{ background: '#1a4a2e' }}>
                    +
                  </button>
                </div>

                {/* Subtotal + Remove */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-800">
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </p>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-xs text-red-400 hover:text-red-600
                               mt-1 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-72">
            <div className="bg-white rounded-2xl p-6 sticky top-24"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>

              <h2 className="font-bold text-gray-800 mb-4 text-lg"
                style={{ fontFamily: 'Georgia, serif' }}>
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id}
                    className="flex justify-between text-sm">
                    <span className="text-gray-500 truncate flex-1 mr-2">
                      {item.name.substring(0, 20)}
                      {item.name.length > 20 ? '...' : ''}
                      × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-700
                                     whitespace-nowrap">
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2
                              mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-medium"
                    style={{ color: total >= 1000
                      ? '#16a34a' : '#374151' }}>
                    {total >= 1000 ? 'FREE 🎉' : 'Calculated at checkout'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg
                                border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span style={{ color: '#1a4a2e' }}>
                    ₹{total.toFixed(0)}
                  </span>
                </div>
              </div>

              {total < 1000 && (
                <div className="rounded-xl p-3 mb-4 text-xs
                                text-center"
                  style={{ background: '#f0f7f4',
                           color: '#1a4a2e' }}>
                  Add ₹{(1000 - total).toFixed(0)} more for
                  FREE delivery! 🎉
                </div>
              )}

              <button
                onClick={handleCheckout}
                className="w-full text-white py-3.5 rounded-xl
                           font-bold text-base hover:opacity-90
                           transition-all active:scale-98"
                style={{ background: '#1a4a2e' }}>
                Checkout →
              </button>

              <button
                onClick={() => navigate('/products')}
                className="w-full border border-gray-200 text-gray-500
                           py-2.5 rounded-xl mt-2 text-sm
                           hover:bg-gray-50 transition-colors">
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
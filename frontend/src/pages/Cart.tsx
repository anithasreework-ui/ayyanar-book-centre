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

  // Cart data localStorage-லிருந்து எடு
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  // Cart save பண்ணு
  const saveCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Quantity increase
  const increaseQty = (id: number) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updated);
  };

  // Quantity decrease
  const decreaseQty = (id: number) => {
    const updated = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0); // 0 ஆனா remove பண்ணு
    saveCart(updated);
  };

  // Item remove
  const removeItem = (id: number) => {
    const updated = cartItems.filter((item) => item.id !== id);
    saveCart(updated);
  };

  // Total calculate
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Checkout பண்ண
  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first to place order!');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // Cart empty-ஆ இருந்தா
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col 
                      items-center justify-center text-center px-4">
        <p className="text-7xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Your cart is empty!
        </h2>
        <p className="text-gray-400 mb-6">
          Add some books to get started
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-800 text-white px-8 py-3 rounded-full 
                     font-bold hover:bg-blue-700 transition"
        >
          Browse Products →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        🛒 Your Cart
      </h1>
      <p className="text-gray-500 mb-6">
        {totalItems} item{totalItems > 1 ? 's' : ''} in your cart
      </p>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Cart Items List */}
        <div className="flex-1 space-y-3">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border 
                         border-gray-100 p-4 flex gap-4 items-center"
            >
              {/* Product Image */}
              <img
                src={item.image_url || 'https://via.placeholder.com/80'}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-sm 
                               leading-tight">
                  {item.name}
                </h3>
                <span className="text-xs bg-blue-100 text-blue-700 
                                 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {item.category}
                </span>
                <p className="text-green-600 font-bold mt-1">
                  ₹{item.price}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="w-8 h-8 rounded-full bg-gray-100 
                             hover:bg-gray-200 font-bold text-gray-600 
                             flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-gray-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => increaseQty(item.id)}
                  className="w-8 h-8 rounded-full bg-blue-800 
                             hover:bg-blue-700 font-bold text-white 
                             flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right min-w-16">
                <p className="font-bold text-gray-800">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 
                             text-xs mt-1 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-72">
          <div className="bg-white rounded-xl shadow-sm border 
                          border-gray-100 p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Order Summary
            </h2>

            {/* Items breakdown */}
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate flex-1 mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-700">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              {/* Subtotal */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">₹{total.toFixed(2)}</span>
              </div>
              {/* Delivery */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Delivery</span>
                <span className={
                  total >= 500
                    ? 'text-green-600 font-medium'
                    : 'font-medium'
                }>
                  {total >= 500 ? 'FREE 🎉' : '₹50'}
                </span>
              </div>
              {/* Total */}
              <div className="flex justify-between font-bold text-lg 
                              border-t border-gray-100 pt-3 mt-2">
                <span>Total</span>
                <span className="text-green-600">
                  ₹{(total >= 500 ? total : total + 50).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Free delivery note */}
            {total < 500 && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg 
                            p-2 mb-4 text-center">
                Add ₹{(500 - total).toFixed(2)} more for FREE delivery! 🚚
              </p>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-800 text-white py-3 rounded-xl 
                         font-bold hover:bg-blue-700 transition-colors mb-3"
            >
              Proceed to Checkout →
            </button>

            {/* Continue Shopping */}
            <button
              onClick={() => navigate('/products')}
              className="w-full border border-gray-200 text-gray-600 
                         py-3 rounded-xl font-medium hover:bg-gray-50 
                         transition-colors text-sm"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
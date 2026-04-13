import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const Terms = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>({
    phone: '+91 9894235330',
    customer_care: '+91 9894235330',
    email: 'ayyanarbookcentredgl1@gmail.com',
    shop_address: '14, Dudley School Building, AMC Road, Dindigul, Tamil Nadu 624001',
    working_hours: 'Monday to Saturday, 9:00 AM to 9:00 PM',
  });

  useEffect(() => {
    axios.get(`${API}/settings/public`)
      .then((res) => { if (res.data) setSettings(res.data); })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)}
        className="text-sm mb-4 block hover:underline"
        style={{ color: '#1a4a2e' }}>
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Terms & Conditions
      </h1>
      <p className="text-gray-500 mb-8">
        Ayyanar Book Centre — Dindigul, Tamil Nadu
      </p>

      <div className="space-y-6">

        {/* Delivery Policy */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🚚 Delivery Policy
          </h2>
          <div className="space-y-3">

            <div className="bg-green-50 rounded-xl p-4">
              <p className="font-bold mb-2" style={{ color: '#1a4a2e' }}>
                ✅ FREE Delivery
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Books and items under 1 kg — FREE delivery across India</li>
                <li>• Lightweight stationery items — FREE delivery</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="font-bold text-blue-700 mb-3">
                📦 Weight-Based Charges (Above 1 kg)
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="text-left p-2">Weight</th>
                    <th className="text-left p-2">Charge</th>
                    <th className="text-left p-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Under 1 kg', 'FREE 🎉', 'Pan India'],
                    ['1 – 2 kg', 'Rs.80', 'Approx'],
                    ['2 – 5 kg', 'Rs.150', 'Approx'],
                    ['Above 5 kg', 'Rs.200+', 'Varies by location'],
                    ['International', 'Rs.800+', 'Weight based'],
                  ].map((row) => (
                    <tr key={row[0]} className="border-t border-blue-100">
                      <td className="p-2 font-medium">{row[0]}</td>
                      <td className="p-2 font-bold text-blue-700">{row[1]}</td>
                      <td className="p-2 text-gray-500 text-xs">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2 italic">
                * Final charges may vary based on actual weight and delivery
                location. We will contact you if there is any difference
                before shipping.
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <p className="font-bold text-purple-700 mb-2">
                🏪 Store Pickup — Dindigul
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• No delivery charges for store pickup</li>
                <li>• Show your OTP at the store counter</li>
                <li>• Prepaid orders only — payment before pickup</li>
                <li>
                  • Timing:{' '}
                  {settings.working_hours ||
                    'Monday to Saturday, 9:00 AM to 9:00 PM'}
                </li>
                <li>
                  • Address:{' '}
                  {settings.shop_address ||
                    '14, Dudley School Building, AMC Road, Dindigul - 624001'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Order Policy */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📋 Order Policy
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              'Orders are processed within 1–2 business days',
              'Tamil Nadu delivery: 2–3 business days',
              'Other states: 4–7 business days',
              'International: 10–20 business days',
              'Order cancellation: Contact us within 24 hours of placing order',
              'Wholesale & bulk orders: Contact us directly for special pricing',
              'All orders are carefully packed and verified before dispatch',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0"
                  style={{ color: '#1a4a2e' }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Return & Refund Policy — Updated */}
        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🔄 Return & Refund Policy
          </h2>

          <div className="space-y-4">

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-300
                            rounded-xl p-4">
              <p className="font-bold text-yellow-800 mb-2">
                ⚠️ Important Notice
              </p>
              <p className="text-sm text-gray-700">
                All our orders are carefully checked, verified and packed
                before dispatch. We ensure you receive the correct product
                in perfect condition. So hassle-free shopping guaranteed!
              </p>
            </div>

            {/* Eligible Cases */}
            <div className="bg-green-50 rounded-xl p-4">
              <p className="font-bold mb-2" style={{ color: '#1a4a2e' }}>
                ✅ Eligible for Return / Replacement
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">
                    •
                  </span>
                  <span>
                    <strong>Print / Paper Mismatch:</strong> If the book
                    has printing defects or paper quality issues —
                    replacement will be provided
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">
                    •
                  </span>
                  <span>
                    <strong>Wrong Item Delivered:</strong> Free replacement
                    will be arranged immediately
                  </span>
                </li>
              </ul>
            </div>

            {/* NOT Eligible */}
            <div className="bg-red-50 rounded-xl p-4">
              <p className="font-bold text-red-700 mb-2">
                ❌ NOT Eligible for Return / Refund
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">
                    •
                  </span>
                  Books cannot be replaced with a different book or title
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">
                    •
                  </span>
                  No refund for change of mind or wrong selection by customer
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">
                    •
                  </span>
                  Books with normal wear or usage marks are not eligible
                </li>
              </ul>
            </div>

            {/* Mandatory Requirements */}
            <div className="rounded-xl p-4 text-white"
              style={{ background: '#1a4a2e' }}>
              <p className="font-bold mb-2">
                📹 Mandatory Requirements for Return
              </p>
              <ul className="space-y-2 text-sm text-green-100">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">📦</span>
                  <span>
                    <strong className="text-yellow-300">
                      Unboxing Video is Mandatory
                    </strong>{' '}
                    — You must record a clear video while opening the
                    package. Without unboxing video, return claims will
                    NOT be accepted
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">⏰</span>
                  <span>
                    Drop a message to our email within{' '}
                    <strong className="text-yellow-300">
                      24 hours of delivery
                    </strong>{' '}
                    with unboxing video and order details
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0">✉️</span>
                  <span>
                    Email:{' '}
                    <strong className="text-yellow-300">
                      {settings.email ||
                        'ayyanarbookcentredgl1@gmail.com'}
                    </strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* Process */}
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="font-bold text-blue-700 mb-2">
                📋 Return Process
              </p>
              <ol className="space-y-1 text-sm text-gray-700">
                {[
                  'Record unboxing video when you receive the package',
                  'Check the item within 24 hours of delivery',
                  'Email us with video + order ID within 24 hours',
                  'Our team will verify and respond within 48 hours',
                  'If eligible, replacement will be arranged',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-700 font-bold flex-shrink-0">
                      {i + 1}.
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl p-6 text-white text-center"
          style={{ background: '#1a4a2e' }}>
          <p className="font-bold text-lg mb-3">Questions? Contact Us!</p>
          <div className="space-y-1 text-green-200 text-sm">
            <p>
              📞{' '}
              {settings.customer_care || '+91 9894235330'}
            </p>
            <p>
              ✉️{' '}
              {settings.email || 'ayyanarbookcentredgl1@gmail.com'}
            </p>
            <p>
              📍{' '}
              {settings.shop_address ||
                '14, Dudley School Building, AMC Road, Dindigul - 624001'}
            </p>
            <p>
              🕐{' '}
              {settings.working_hours ||
                'Monday to Saturday, 9:00 AM to 9:00 PM'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
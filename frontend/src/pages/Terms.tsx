import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)}
        className="text-blue-700 hover:underline text-sm mb-4 block">
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Terms & Conditions
      </h1>
      <p className="text-gray-500 mb-8">
        Ayyanar Book Centre — Dindigul, Tamil Nadu
      </p>

      <div className="space-y-6">

        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🚚 Delivery Policy
          </h2>
          <div className="space-y-3">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="font-bold text-green-700 mb-2">
                ✅ FREE Delivery
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Books and items under 1 kg — FREE delivery across India</li>
                <li>• Lightweight stationery — FREE delivery</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="font-bold text-blue-700 mb-3">
                📦 Weight-Based Charges (Above 1 kg)
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="text-left p-2 rounded-tl">Weight</th>
                    <th className="text-left p-2">Charge</th>
                    <th className="text-left p-2 rounded-tr">Note</th>
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
                    <tr key={row[0]}
                      className="border-t border-blue-100">
                      <td className="p-2 font-medium">{row[0]}</td>
                      <td className="p-2 text-blue-700 font-bold">
                        {row[1]}
                      </td>
                      <td className="p-2 text-gray-500 text-xs">
                        {row[2]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2 italic">
                * Final charges may vary based on actual weight and
                delivery location. We will contact you if there is
                any difference before shipping.
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <p className="font-bold text-purple-700 mb-2">
                🏪 Store Pickup — Dindigul
              </p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• No delivery charges for store pickup</li>
                <li>• Show your OTP at the counter</li>
                <li>• Prepaid orders only</li>
                <li>• Timing: Mon–Sat, 9:00 AM – 8:00 PM</li>
                <li>• Address: Dindigul, Tamil Nadu – 624 001</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📋 Order Policy
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              'Orders processed within 1–2 business days',
              'Tamil Nadu delivery: 2–3 business days',
              'Other states: 4–7 business days',
              'International: 10–20 business days',
              'Cancellation: Contact us within 24 hours of order',
              'Wholesale & bulk orders: WhatsApp us for pricing',
            ].map((item) => (
              <li key={item}
                className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🔄 Return & Refund Policy
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              'Damaged items: Full replacement or refund',
              'Wrong item: Free replacement',
              'Return window: 7 days from delivery',
              'Books must be in original condition',
              'Contact us: +91 9894235330',
            ].map((item) => (
              <li key={item}
                className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-800 rounded-2xl p-6 text-white text-center">
          <p className="font-bold text-lg mb-2">Questions? Contact Us!</p>
          <p className="text-blue-200 text-sm">
            📞 +91 9894235330
          </p>
          <p className="text-blue-200 text-sm">
            ✉️ ayyanarbookcentredgl1@gmail.com
          </p>
          <p className="text-blue-200 text-sm mt-1">
            📍 Dindigul, Tamil Nadu – 624 001
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
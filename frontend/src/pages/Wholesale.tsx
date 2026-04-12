import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const Wholesale = () => {
  const [form, setForm] = useState({
    store_name: '', name: '', phone: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({
    shop_name: 'Ayyanar Book Centre',
    phone: '+91 9894235330',
    customer_care: '+91 9894235330',
    email: 'ayyanarbookcentredgl1@gmail.com',
    instagram: '@ayyanarbookcentre',
    shop_address: 'Dindigul, Tamil Nadu, India - 624 001',
    working_hours: 'Monday to Saturday, 9:00 AM to 8:00 PM',
    branch_2_name: '',
    branch_2_address: '',
    branch_2_phone: '',
  });

  useEffect(() => {
    axios.get(`${API}/settings/public`)
      .then((res) => { if (res.data) setSettings(res.data); })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      alert('Name and phone are required!');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/wholesale/enquiry`, form);
      setSubmitted(true);
    } catch {
      alert('Failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Wholesale & Bulk Orders
      </h1>
      <p className="text-gray-500 mb-8">
        Special pricing for schools, colleges and institutions
      </p>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Shop Info — Dynamic */}
        <div className="space-y-4">
          <div className="rounded-2xl border p-6 text-white"
            style={{ background: 'linear-gradient(135deg, #1a4a2e, #2d7a4f)' }}>
            <h2 className="font-bold mb-4 text-lg">
              🏪 Shop Details
            </h2>
            <div className="space-y-2 text-sm">
              {[
                { icon: '🏪', value: settings.shop_name },
                { icon: '📍', value: settings.shop_address },
                { icon: '📞', value: settings.phone },
                { icon: '📱', value: `Customer Care: ${settings.customer_care}` },
                { icon: '✉️', value: settings.email },
                { icon: '📸', value: settings.instagram },
                { icon: '🕐', value: settings.working_hours },
              ].map((item) => (
                item.value ? (
                  <div key={item.icon}
                    className="flex items-start gap-2">
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="text-green-100">{item.value}</span>
                  </div>
                ) : null
              ))}
            </div>

            {/* Branch 2 */}
            {settings.branch_2_name && (
              <div className="mt-4 pt-4 border-t border-green-600">
                <p className="font-bold text-yellow-400 mb-2">
                  🏪 Branch 2
                </p>
                <div className="space-y-1 text-sm text-green-100">
                  <p>🏪 {settings.branch_2_name}</p>
                  <p>📍 {settings.branch_2_address}</p>
                  <p>📞 {settings.branch_2_phone}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-green-50 rounded-2xl border
                          border-green-100 p-5">
            <h2 className="font-bold text-gray-800 mb-3">
              Why Choose Us?
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'MOU agreements available for schools & colleges',
                'Bulk discount on all categories',
                'State Board & CBSE textbooks available',
                'TNPSC & competitive exam books',
                'Customised school projects',
                'Teacher training materials',
                'Dedicated customer support',
                'Worldwide delivery available',
              ].map((item) => (
                <li key={item}
                  className="flex items-center gap-2">
                  <span className="text-green-600 font-bold
                                   flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="bg-white rounded-2xl shadow-sm border
                        border-gray-100 p-6">
          {submitted ? (
            <div className="text-center py-8">
              <p className="text-5xl mb-4">🎉</p>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Enquiry Submitted!
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                We will contact you within 24 hours.
              </p>
              <p className="text-sm font-medium" style={{ color: '#1a4a2e' }}>
                Call us: {settings.customer_care || '+91 9894235330'}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm text-gray-500 hover:underline">
                Send another enquiry
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-bold text-gray-800 mb-4">
                Send Enquiry
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'store_name', label: 'School / Store Name',
                    placeholder: 'Optional' },
                  { key: 'name', label: 'Contact Name *',
                    placeholder: 'Your name' },
                  { key: 'phone', label: 'Phone Number *',
                    placeholder: '+91 XXXXXXXXXX' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={(form as any)[field.key]}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      className="w-full border rounded-lg px-3 py-2 mt-1
                                 text-sm focus:outline-none
                                 focus:border-green-500"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="What books do you need? Quantity etc."
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 mt-1
                               text-sm focus:outline-none
                               focus:border-green-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full text-white py-3 rounded-lg font-bold
                             disabled:bg-gray-300 transition-colors"
                  style={{ background: loading ? '' : '#1a4a2e' }}>
                  {loading ? 'Sending...' : 'Send Enquiry 📤'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wholesale;
import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Wholesale = () => {
  const [form, setForm] = useState({
    store_name: '', name: '', phone: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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

        {/* Info Card */}
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">
              Shop Details
            </h2>
            <div className="space-y-3 text-sm">
              {[
                { icon: '🏪', label: 'Ayyanar Book Centre' },
                { icon: '📍', label: 'Dindigul, Tamil Nadu - 624 001' },
                { icon: '📞', label: '+91 9894235330' },
                { icon: '📱', label: 'Customer Care: +91 9894235330' },
                { icon: '✉️', label: 'ayyanarbookcentredgl1@gmail.com' },
                { icon: '📸', label: '@ayyanarbookcentre' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span className="text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl border border-green-100 p-6">
            <h2 className="font-bold text-gray-800 mb-3">
              Why Choose Us?
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                'MOU agreements available for schools',
                'Bulk discount on all categories',
                'All Tamil Nadu board textbooks',
                'CBSE & NCERT books available',
                'Customised school projects',
                'Teacher training materials',
                'Dedicated customer support',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span>
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
              <p className="text-gray-500">
                We will contact you within 24 hours.
              </p>
              <p className="text-sm text-blue-700 mt-4 font-medium">
                Call us: +91 9894235330
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-bold text-gray-800 mb-4">
                Send Enquiry
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'store_name', label: 'School/Store Name',
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
                        setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full border rounded-lg px-3 py-2 mt-1
                                 text-sm focus:outline-none
                                 focus:border-blue-500"
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
                      setForm({ ...form, message: e.target.value })}
                    placeholder="What do you need? (books, quantity etc.)"
                    rows={4}
                    className="w-full border rounded-lg px-3 py-2 mt-1
                               text-sm focus:outline-none
                               focus:border-blue-500 resize-none"
                  />
                </div>
                <button onClick={handleSubmit} disabled={loading}
                  className="w-full bg-blue-800 text-white py-3
                             rounded-lg font-bold hover:bg-blue-700
                             disabled:bg-gray-300">
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
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Please fill all required fields!');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerUser(form);
      // Auto login after register
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        name: res.data.name,
        role: res.data.role
      }));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">📚</p>
          <h1 className="text-2xl font-bold text-gray-800">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Join Ayyanar Book Centre
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600
                          rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {[
            { label: 'Full Name *', name: 'name',
              type: 'text', placeholder: 'Your name' },
            { label: 'Email *', name: 'email',
              type: 'email', placeholder: 'your@email.com' },
            { label: 'Password *', name: 'password',
              type: 'password', placeholder: 'Min 6 characters' },
            { label: 'Phone', name: 'phone',
              type: 'tel', placeholder: 'Optional' },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={(form as any)[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                className="w-full border border-gray-200 rounded-lg
                           px-4 py-3 text-sm focus:outline-none
                           focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        <button onClick={handleRegister} disabled={loading}
          className="w-full bg-blue-800 text-white py-3 rounded-lg
                     font-bold hover:bg-blue-700 disabled:bg-gray-300
                     mt-6 transition-colors">
          {loading ? 'Creating Account...' : 'Register 🚀'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login"
            className="text-blue-700 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
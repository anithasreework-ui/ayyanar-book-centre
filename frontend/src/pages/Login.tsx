import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Empty check
    if (!email || !password) {
      setError('Please enter email and password!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await loginUser({ email, password });

      // Token + user info save பண்ணு
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        name: res.data.name,
        role: res.data.role,
      }));

      // Admin-ஆ இருந்தா admin page-ku போ
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Login failed! Check email & password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">📚</p>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome Back!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Login to Ayyanar Book Centre
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 
                          rounded-lg px-4 py-3 text-sm mb-4">
            ❌ {error}
          </div>
        )}

        {/* Email Input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 
                       text-sm focus:outline-none focus:border-blue-500 
                       transition-colors"
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 
                       text-sm focus:outline-none focus:border-blue-500 
                       transition-colors"
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-800 text-white py-3 rounded-lg 
                     font-bold text-sm hover:bg-blue-700 
                     disabled:bg-gray-300 transition-colors"
        >
          {loading ? 'Logging in...' : 'Login 🚀'}
        </button>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-blue-700 font-semibold hover:underline"
          >
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
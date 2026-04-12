import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotResult, setForgotResult] = useState<any>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        name: res.data.name,
        role: res.data.role,
      }));
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Wrong email or password!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      alert('Please enter your email!');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await axios.post(
        `${API}/auth/forgot-password`,
        { email: forgotEmail }
      );
      setForgotResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed! Try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Forgot Password Modal
  if (showForgot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center
                      justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8
                        w-full max-w-md">

          {!forgotResult ? (
            <>
              <div className="text-center mb-6">
                <p className="text-4xl mb-2">🔑</p>
                <h1 className="text-2xl font-bold text-gray-800">
                  Forgot Password?
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your email to reset password
                </p>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                  className="w-full border border-gray-200 rounded-lg
                             px-4 py-3 text-sm focus:outline-none
                             focus:border-green-500"
                />
              </div>

              <button
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="w-full text-white py-3 rounded-lg font-bold
                           disabled:bg-gray-300 transition-colors mb-3"
                style={{ background: forgotLoading ? '' : '#1a4a2e' }}>
                {forgotLoading ? 'Processing...' : 'Reset Password'}
              </button>

              <button
                onClick={() => setShowForgot(false)}
                className="w-full border border-gray-200 text-gray-600
                           py-3 rounded-lg text-sm hover:bg-gray-50">
                ← Back to Login
              </button>
            </>
          ) : (
            /* Reset Success */
            <div className="text-center">
              <p className="text-5xl mb-4">✅</p>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Password Reset Done!
              </h2>

              {forgotResult.temp_password && (
                <div className="bg-yellow-50 border-2 border-yellow-300
                                rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Your temporary password:
                  </p>
                  <p className="text-2xl font-bold tracking-widest"
                    style={{ color: '#1a4a2e' }}>
                    {forgotResult.temp_password}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ Save this password! Use it to login now.
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-500 mb-4">
                {forgotResult.note}
              </p>

              <button
                onClick={() => {
                  setShowForgot(false);
                  setForgotResult(null);
                  setForgotEmail('');
                  if (forgotResult.temp_password) {
                    setPassword(forgotResult.temp_password);
                    setEmail(forgotEmail);
                  }
                }}
                className="w-full text-white py-3 rounded-lg font-bold"
                style={{ background: '#1a4a2e' }}>
                Login with Temp Password →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Login Form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-yellow-400
                          overflow-hidden mx-auto mb-3 bg-yellow-50">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-full h-full object-cover object-top"
              onError={(e: any) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML =
                  '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:32px">📚</div>';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome Back!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Login to Ayyanar Book Centre
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600
                          rounded-lg px-4 py-3 text-sm mb-4">
            ❌ {error}
          </div>
        )}

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
                       text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        <div className="mb-2">
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
                       text-sm focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Forgot Password Link */}
        <div className="text-right mb-6">
          <button
            onClick={() => {
              setShowForgot(true);
              setForgotEmail(email);
            }}
            className="text-sm hover:underline"
            style={{ color: '#1a4a2e' }}>
            Forgot Password?
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full text-white py-3 rounded-lg font-bold
                     disabled:bg-gray-300 transition-colors mb-4"
          style={{ background: loading ? '' : '#1a4a2e' }}>
          {loading ? 'Logging in...' : 'Login 🚀'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register"
            className="font-semibold hover:underline"
            style={{ color: '#1a4a2e' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
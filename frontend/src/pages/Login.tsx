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
  const navigate = useNavigate();

  // States for forgot password flow
  const [forgotStep, setForgotStep] = useState<
    'email' | 'otp' | 'newpassword' | 'done'
  >('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [screenOtp, setScreenOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginUser({ email, password });

      // Both tokens save பண்ணு
      localStorage.setItem('token', res.data.token);
      localStorage.setItem(
        'refresh_token',
        res.data.refresh_token || ''
      );
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

  const handleForgotEmail = async () => {
    if (!forgotEmail) {
      alert('Enter your email!'); return;
    }
    setForgotLoading(true);
    try {
      const res = await axios.post(
        `${API}/auth/forgot-password`,
        { email: forgotEmail }
      );
      if (res.data.temp_password) {
        setScreenOtp(res.data.temp_password); // Email failed fallback
      }
      setForgotStep('otp');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed!');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || otpValue.length < 6) {
      alert('Enter OTP or temp password!'); return;
    }
    setForgotLoading(true);
    try {
      const res = await axios.get(
        `${API}/auth/verify-reset-token/${otpValue}`
      );
      setResetToken(otpValue);
      setForgotStep('newpassword');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Invalid token!');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPwd || newPwd.length < 8) {
      alert('Minimum 8 characters!'); return;
    }
    if (newPwd !== confirmPwd) {
      alert('Passwords do not match!'); return;
    }
    setForgotLoading(true);
    try {
      await axios.post(
        `${API}/auth/reset-password`,
        {
          token: resetToken,
          new_password: newPwd,
          confirm_password: confirmPwd
        }
      );
      setForgotStep('done');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed!');
    } finally {
      setForgotLoading(false);
    }
  };


  {showForgot && (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100,
      padding: '24px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        padding: '32px', maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }}>

        {/* Step 1 — Email */}
        {forgotStep === 'email' && (
          <>
            <h2 style={{
              fontSize: '20px', fontWeight: '700',
              margin: '0 0 8px',
            }}>
              Forgot Password?
            </h2>
            <p style={{
              color: '#6b7280', fontSize: '14px',
              margin: '0 0 20px',
            }}>
              Enter your registered email to receive OTP
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%', border: '1px solid #e8e4df',
                borderRadius: '8px', padding: '11px 14px',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', marginBottom: '12px',
              }}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleForgotEmail()
              }
            />
            <button
              onClick={handleForgotEmail}
              disabled={forgotLoading}
              style={{
                background: '#1a4a2e', color: '#fff',
                border: 'none', padding: '12px',
                borderRadius: '8px', fontSize: '14px',
                fontWeight: '700', cursor: 'pointer',
                width: '100%', marginBottom: '8px',
                opacity: forgotLoading ? 0.7 : 1,
              }}>
              {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <button
              onClick={() => {
                setShowForgot(false);
                setForgotStep('email');
              }}
              style={{
                background: 'none', border: 'none',
                color: '#6b7280', fontSize: '13px',
                cursor: 'pointer', width: '100%',
              }}>
              ← Back to Login
            </button>
          </>
        )}

        {/* Step 2 — OTP */}
        {forgotStep === 'otp' && (
          <>
            <h2 style={{
              fontSize: '20px', fontWeight: '700',
              margin: '0 0 8px',
            }}>
              Enter OTP
            </h2>
            <p style={{
              color: '#6b7280', fontSize: '14px',
              margin: '0 0 20px',
            }}>
              {screenOtp
                ? 'Email failed. Your OTP is shown below:'
                : `OTP sent to ${forgotEmail}`}
            </p>

            {/* Screen OTP display (email fallback) */}
            {screenOtp && (
              <div style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '10px', padding: '16px',
                textAlign: 'center', marginBottom: '16px',
              }}>
                <p style={{
                  color: '#92400e', fontSize: '12px',
                  margin: '0 0 8px', fontWeight: '700',
                }}>
                  YOUR OTP (Email unavailable)
                </p>
                <p style={{
                  color: '#78350f', fontSize: '36px',
                  fontWeight: '700', letterSpacing: '8px',
                  margin: 0, fontFamily: 'monospace',
                }}>
                  {screenOtp}
                </p>
                <p style={{
                  color: '#92400e', fontSize: '11px',
                  margin: '8px 0 0',
                }}>
                  ⚠️ Valid for 10 minutes only
                </p>
              </div>
            )}

            {/* OTP Input */}
            <input
              type="text"
              value={otpValue}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                if (v.length <= 6) setOtpValue(v);
              }}
              placeholder="000000"
              maxLength={6}
              style={{
                width: '100%', border: '1px solid #e8e4df',
                borderRadius: '8px', padding: '14px',
                fontSize: '28px', outline: 'none',
                boxSizing: 'border-box',
                textAlign: 'center',
                letterSpacing: '12px',
                fontFamily: 'monospace',
                fontWeight: '700',
                marginBottom: '12px',
              }}
            />

            <button
              onClick={handleVerifyOtp}
              disabled={forgotLoading || otpValue.length !== 6}
              style={{
                background: '#1a4a2e', color: '#fff',
                border: 'none', padding: '12px',
                borderRadius: '8px', fontSize: '14px',
                fontWeight: '700', cursor: 'pointer',
                width: '100%', marginBottom: '8px',
                opacity: (forgotLoading ||
                  otpValue.length !== 6) ? 0.5 : 1,
              }}>
              {forgotLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              onClick={() => {
                setForgotStep('email');
                setOtpValue('');
                setScreenOtp('');
              }}
              style={{
                background: 'none', border: 'none',
                color: '#6b7280', fontSize: '13px',
                cursor: 'pointer', width: '100%',
              }}>
              ← Resend OTP
            </button>
          </>
        )}

        {/* Step 3 — New Password */}
        {forgotStep === 'newpassword' && (
          <>
            <h2 style={{
              fontSize: '20px', fontWeight: '700',
              margin: '0 0 8px',
            }}>
              Create New Password
            </h2>
            <p style={{
              color: '#6b7280', fontSize: '14px',
              margin: '0 0 20px',
            }}>
              Choose a strong password (min 8 characters)
            </p>

            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="New password (min 8 chars)"
              style={{
                width: '100%', border: '1px solid #e8e4df',
                borderRadius: '8px', padding: '11px 14px',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', marginBottom: '10px',
              }}
            />
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Confirm new password"
              style={{
                width: '100%',
                border: `1px solid ${
                  confirmPwd && newPwd !== confirmPwd
                    ? '#dc2626' : '#e8e4df'
                }`,
                borderRadius: '8px', padding: '11px 14px',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', marginBottom: '12px',
              }}
            />

            {confirmPwd && newPwd !== confirmPwd && (
              <p style={{
                color: '#dc2626', fontSize: '12px',
                margin: '-8px 0 10px',
              }}>
                ✗ Passwords do not match
              </p>
            )}

            <button
              onClick={handleResetPassword}
              disabled={forgotLoading}
              style={{
                background: '#1a4a2e', color: '#fff',
                border: 'none', padding: '12px',
                borderRadius: '8px', fontSize: '14px',
                fontWeight: '700', cursor: 'pointer',
                width: '100%',
                opacity: forgotLoading ? 0.7 : 1,
              }}>
              {forgotLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}

        {/* Step 4 — Success */}
        {forgotStep === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '56px', marginBottom: '16px',
            }}>
              ✅
            </div>
            <h2 style={{
              fontSize: '20px', fontWeight: '700',
              margin: '0 0 8px',
            }}>
              Password Reset!
            </h2>
            <p style={{
              color: '#6b7280', fontSize: '14px',
              margin: '0 0 24px',
            }}>
              Your password has been updated successfully.
              Please login with your new password.
            </p>
            <button
              onClick={() => {
                setShowForgot(false);
                setForgotStep('email');
                setForgotEmail('');
                setOtpValue('');
                setNewPwd('');
                setConfirmPwd('');
              }}
              style={{
                background: '#1a4a2e', color: '#fff',
                border: 'none', padding: '12px',
                borderRadius: '8px', fontSize: '14px',
                fontWeight: '700', cursor: 'pointer',
                width: '100%',
              }}>
              Login Now →
            </button>
          </div>
        )}
      </div>
    </div>
  )}


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
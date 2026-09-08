import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

// OTP Store
let forgotOtpData: any = null;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState
    'email' | 'otp' | 'newpwd' | 'done'
  >('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [screenOtp, setScreenOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/auth/login`,
        { email, password },
        { timeout: 30000 }
      );
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
      if (err.code === 'ECONNABORTED' ||
          err.message?.includes('timeout')) {
        setError(
          'Server is starting up... Please try again in 30 seconds!'
        );
      } else {
        setError(
          err.response?.data?.detail ||
          'Wrong email or password!'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handlers
  const handleSendOtp = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Enter your email!');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await axios.post(
        `${API}/auth/forgot-password`,
        { email: forgotEmail },
        { timeout: 30000 }
      );
      if (res.data.otp) {
        setScreenOtp(res.data.otp);
      }
      setForgotStep('otp');
    } catch (err: any) {
      setForgotError(
        err.response?.data?.detail ||
        'Failed! Try again.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (forgotOtp.length !== 6) {
      setForgotError('Enter 6-digit OTP!');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await axios.post(
        `${API}/auth/verify-otp`,
        { email: forgotEmail, otp: forgotOtp },
        { timeout: 30000 }
      );
      setResetToken(res.data.reset_token);
      setForgotStep('newpwd');
    } catch (err: any) {
      setForgotError(
        err.response?.data?.detail ||
        'Wrong OTP!'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPwd = async () => {
    if (newPwd.length < 8) {
      setForgotError('Minimum 8 characters!');
      return;
    }
    if (newPwd !== confirmPwd) {
      setForgotError('Passwords do not match!');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await axios.post(
        `${API}/auth/reset-password-otp`,
        {
          reset_token: resetToken,
          new_password: newPwd,
          confirm_password: confirmPwd,
        },
        { timeout: 30000 }
      );
      setForgotStep('done');
    } catch (err: any) {
      setForgotError(
        err.response?.data?.detail ||
        'Reset failed!'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgot = () => {
    setShowForgot(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotOtp('');
    setScreenOtp('');
    setResetToken('');
    setNewPwd('');
    setConfirmPwd('');
    setForgotError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf9f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'sans-serif',
    }}>

      {/* Login Card */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '40px 32px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #e8e4df',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            border: '2px solid #d4a853',
            overflow: 'hidden',
            margin: '0 auto 12px',
            background: '#f9f7f0',
          }}>
            <img src="/logo.jpg" alt="Logo"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'top',
              }}
              onError={(e: any) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 style={{
            fontSize: '22px', fontWeight: '700',
            color: '#1a1a1a', margin: '0 0 4px',
          }}>
            Welcome Back!
          </h1>
          <p style={{
            color: '#6b7280', fontSize: '13px', margin: 0,
          }}>
            Login to Ayyanar Book Centre
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            color: '#dc2626',
            fontSize: '13px',
          }}>
            ❌ {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{
            fontSize: '12px', fontWeight: '700',
            color: '#374151', display: 'block',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && handleLogin()
            }
            placeholder="your@email.com"
            style={{
              width: '100%',
              border: '1px solid #e8e4df',
              borderRadius: '8px',
              padding: '11px 14px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1a4a2e';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e8e4df';
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{
            fontSize: '12px', fontWeight: '700',
            color: '#374151', display: 'block',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleLogin()
              }
              placeholder="Enter your password"
              style={{
                width: '100%',
                border: '1px solid #e8e4df',
                borderRadius: '8px',
                padding: '11px 44px 11px 14px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a4a2e';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8e4df';
              }}
            />
            <button
              onClick={() => setShowPwd(!showPwd)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#9ca3af',
                padding: 0,
              }}>
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div style={{
          textAlign: 'right', marginBottom: '20px',
        }}>
          <button
            onClick={() => {
              setShowForgot(true);
              setForgotEmail(email);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#1a4a2e',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}>
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            background: loading ? '#9ca3af' : '#1a4a2e',
            color: '#fff',
            border: 'none',
            padding: '13px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            marginBottom: '16px',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
          {loading ? (
            <>
              <div style={{
                width: '16px', height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              Logging in...
            </>
          ) : (
            'Login →'
          )}
        </button>

        {/* Server warming notice */}
        {loading && (
          <p style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px',
            margin: '0 0 16px',
          }}>
            ⚡ First login may take 30 seconds
            (server warming up)
          </p>
        )}

        {/* Register Link */}
        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px',
          margin: 0,
        }}>
          Don't have an account?{' '}
          <Link to="/register"
            style={{
              color: '#1a4a2e',
              fontWeight: '700',
              textDecoration: 'none',
            }}>
            Register here
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          }}>

            {/* Step 1 — Email */}
            {forgotStep === 'email' && (
              <div>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    fontSize: '40px', marginBottom: '8px',
                  }}>
                    🔑
                  </div>
                  <h2 style={{
                    fontSize: '18px', fontWeight: '700',
                    margin: '0 0 4px',
                  }}>
                    Forgot Password?
                  </h2>
                  <p style={{
                    color: '#6b7280', fontSize: '13px',
                    margin: 0,
                  }}>
                    Enter your email — we'll send an OTP
                  </p>
                </div>

                {forgotError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '12px',
                    color: '#dc2626',
                    fontSize: '13px',
                  }}>
                    ❌ {forgotError}
                  </div>
                )}

                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) =>
                    setForgotEmail(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleSendOtp()
                  }
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    border: '1px solid #e8e4df',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginBottom: '12px',
                  }}
                />

                <button
                  onClick={handleSendOtp}
                  disabled={forgotLoading}
                  style={{
                    background: forgotLoading
                      ? '#9ca3af' : '#1a4a2e',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}>
                  {forgotLoading ? (
                    <>
                      <div style={{
                        width: '14px', height: '14px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP →'
                  )}
                </button>

                <button
                  onClick={resetForgot}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '13px',
                    cursor: 'pointer',
                    width: '100%',
                  }}>
                  ← Back to Login
                </button>
              </div>
            )}

            {/* Step 2 — OTP */}
            {forgotStep === 'otp' && (
              <div>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    fontSize: '40px', marginBottom: '8px',
                  }}>
                    📱
                  </div>
                  <h2 style={{
                    fontSize: '18px', fontWeight: '700',
                    margin: '0 0 4px',
                  }}>
                    Enter OTP
                  </h2>
                  <p style={{
                    color: '#6b7280', fontSize: '13px',
                    margin: 0,
                  }}>
                    {screenOtp
                      ? 'Email failed. Use OTP below:'
                      : `OTP sent to ${forgotEmail}`}
                  </p>
                </div>

                {/* Screen OTP */}
                {screenOtp && (
                  <div style={{
                    background: '#fef3c7',
                    border: '2px solid #f59e0b',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                    marginBottom: '16px',
                  }}>
                    <p style={{
                      color: '#92400e', fontSize: '11px',
                      margin: '0 0 6px', fontWeight: '700',
                      letterSpacing: '1px',
                    }}>
                      YOUR OTP
                    </p>
                    <p style={{
                      color: '#78350f', fontSize: '42px',
                      fontWeight: '700',
                      letterSpacing: '10px',
                      margin: 0,
                      fontFamily: 'monospace',
                    }}>
                      {screenOtp}
                    </p>
                    <p style={{
                      color: '#92400e', fontSize: '11px',
                      margin: '6px 0 0',
                    }}>
                      ⏰ Valid 10 minutes
                    </p>
                  </div>
                )}

                {forgotError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '12px',
                    color: '#dc2626',
                    fontSize: '13px',
                  }}>
                    ❌ {forgotError}
                  </div>
                )}

                <input
                  type="text"
                  value={forgotOtp}
                  onChange={(e) => {
                    const v = e.target.value
                      .replace(/\D/g, '');
                    if (v.length <= 6) setForgotOtp(v);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  style={{
                    width: '100%',
                    border: '1px solid #e8e4df',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '32px',
                    outline: 'none',
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
                  disabled={
                    forgotLoading || forgotOtp.length !== 6
                  }
                  style={{
                    background:
                      forgotLoading || forgotOtp.length !== 6
                        ? '#9ca3af' : '#1a4a2e',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}>
                  {forgotLoading ? (
                    <>
                      <div style={{
                        width: '14px', height: '14px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP →'
                  )}
                </button>

                <button
                  onClick={() => {
                    setForgotStep('email');
                    setForgotOtp('');
                    setScreenOtp('');
                    setForgotError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '13px',
                    cursor: 'pointer',
                    width: '100%',
                  }}>
                  ← Resend OTP
                </button>
              </div>
            )}

            {/* Step 3 — New Password */}
            {forgotStep === 'newpwd' && (
              <div>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    fontSize: '40px', marginBottom: '8px',
                  }}>
                    🔒
                  </div>
                  <h2 style={{
                    fontSize: '18px', fontWeight: '700',
                    margin: '0 0 4px',
                  }}>
                    New Password
                  </h2>
                  <p style={{
                    color: '#6b7280', fontSize: '13px',
                    margin: 0,
                  }}>
                    Min 8 characters
                  </p>
                </div>

                {forgotError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '12px',
                    color: '#dc2626',
                    fontSize: '13px',
                  }}>
                    ❌ {forgotError}
                  </div>
                )}

                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  style={{
                    width: '100%',
                    border: '1px solid #e8e4df',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginBottom: '10px',
                  }}
                />

                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) =>
                    setConfirmPwd(e.target.value)
                  }
                  placeholder="Confirm password"
                  style={{
                    width: '100%',
                    border: `1px solid ${
                      confirmPwd && newPwd !== confirmPwd
                        ? '#dc2626' : '#e8e4df'
                    }`,
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    marginBottom: '8px',
                  }}
                />

                {confirmPwd && newPwd !== confirmPwd && (
                  <p style={{
                    color: '#dc2626', fontSize: '12px',
                    margin: '0 0 10px',
                  }}>
                    ✗ Passwords do not match
                  </p>
                )}
                {confirmPwd && newPwd === confirmPwd && (
                  <p style={{
                    color: '#16a34a', fontSize: '12px',
                    margin: '0 0 10px',
                  }}>
                    ✓ Passwords match
                  </p>
                )}

                <button
                  onClick={handleResetPwd}
                  disabled={forgotLoading}
                  style={{
                    background: forgotLoading
                      ? '#9ca3af' : '#1a4a2e',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}>
                  {forgotLoading ? (
                    <>
                      <div style={{
                        width: '14px', height: '14px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password ✓'
                  )}
                </button>
              </div>
            )}

            {/* Step 4 — Done */}
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
                  Your password has been updated.
                  Login with your new password.
                </p>
                <button
                  onClick={resetForgot}
                  style={{
                    background: '#1a4a2e',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%',
                  }}>
                  Login Now →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
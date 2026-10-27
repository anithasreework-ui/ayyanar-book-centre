import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

type Screen =
  | 'login'
  | 'register'
  | 'forgot_phone'
  | 'forgot_otp'
  | 'forgot_newpwd'
  | 'forgot_done';

const Login = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Login
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPwd, setLoginPwd] = useState('');

  // Register
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Forgot
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotToken, setForgotToken] = useState('');
  const [forgotNewPwd, setForgotNewPwd] = useState('');
  const [forgotConfirm, setForgotConfirm] = useState('');
  const [screenOtp, setScreenOtp] = useState('');
  const [timer, setTimer] = useState(0);

  const startTimer = () => {
    setTimer(30);
    const iv = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleLogin = async () => {
    if (!loginPhone || !loginPwd) {
      setError('Enter phone and password!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/auth/login`,
        { phone: loginPhone, password: loginPwd },
        { timeout: 30000 }
      );
      localStorage.setItem('token', res.data.token);
      localStorage.setItem(
        'refresh_token', res.data.refresh_token || ''
      );
      localStorage.setItem('user', JSON.stringify({
        name: res.data.name,
        role: res.data.role,
        phone: res.data.phone,
      }));
      navigate(
        res.data.role === 'admin' ? '/admin' : '/'
      );
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Wrong phone or password!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName || !regPhone || !regPwd) {
      setError('Fill all fields!');
      return;
    }
    if (regPwd !== regConfirm) {
      setError('Passwords do not match!');
      return;
    }
    if (regPwd.length < 6) {
      setError('Password min 6 characters!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/auth/register`,
        {
          name: regName,
          phone: regPhone,
          password: regPwd
        },
        { timeout: 30000 }
      );
      localStorage.setItem('token', res.data.token);
      localStorage.setItem(
        'refresh_token', res.data.refresh_token || ''
      );
      localStorage.setItem('user', JSON.stringify({
        name: res.data.name,
        role: res.data.role,
      }));
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Registration failed!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!forgotPhone || forgotPhone.length !== 10) {
      setError('Enter valid 10-digit phone!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/auth/forgot-password`,
        { phone: forgotPhone },
        { timeout: 30000 }
      );
      if (res.data.otp) setScreenOtp(res.data.otp);
      setScreen('forgot_otp');
      startTimer();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (forgotOtp.length !== 6) {
      setError('Enter 6-digit OTP!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/auth/verify-reset-otp`,
        { phone: forgotPhone, otp: forgotOtp },
        { timeout: 30000 }
      );
      setForgotToken(res.data.reset_token);
      setScreen('forgot_newpwd');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Wrong OTP!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPwd = async () => {
    if (forgotNewPwd.length < 6) {
      setError('Min 6 characters!');
      return;
    }
    if (forgotNewPwd !== forgotConfirm) {
      setError('Passwords do not match!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(
        `${API}/auth/reset-password`,
        {
          reset_token: forgotToken,
          new_password: forgotNewPwd,
          confirm_password: forgotConfirm,
        },
        { timeout: 30000 }
      );
      setScreen('forgot_done');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Reset failed!'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setScreen('login');
    setError('');
    setForgotPhone('');
    setForgotOtp('');
    setForgotToken('');
    setForgotNewPwd('');
    setForgotConfirm('');
    setScreenOtp('');
  };

  const card = {
    background: '#fff',
    borderRadius: '20px',
    padding: '36px 28px',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    border: '1px solid #f0ede8',
  };

  const input = {
    width: '100%',
    border: '1.5px solid #e8e4df',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'sans-serif',
  };

  const btn = (disabled = false) => ({
    background: disabled ? '#e8e4df' : '#1a4a2e',
    color: disabled ? '#9ca3af' : '#fff',
    border: 'none',
    padding: '13px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700' as const,
    cursor: disabled ? 'not-allowed' as const
                     : 'pointer' as const,
    width: '100%',
    fontFamily: 'sans-serif',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: '8px',
  });

  const spinner = (
    <div style={{
      width: '16px', height: '16px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );

  const Logo = () => (
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
        fontSize: '20px', fontWeight: '700',
        color: '#1a1a1a', margin: '0 0 2px',
        fontFamily: 'Georgia, serif',
      }}>
        Ayyanar Book Centre
      </h1>
    </div>
  );

  const ErrorBox = () => error ? (
    <div style={{
      background: '#fef2f2', border: '1px solid #fca5a5',
      borderRadius: '8px', padding: '10px 14px',
      marginBottom: '14px', color: '#dc2626',
      fontSize: '13px', fontFamily: 'sans-serif',
    }}>
      ❌ {error}
    </div>
  ) : null;

  return (
    <div style={{
      minHeight: '100vh', background: '#faf9f7',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
      fontFamily: 'sans-serif',
    }}>

      {/* ===== LOGIN ===== */}
      {screen === 'login' && (
        <div style={card}>
          <Logo />
          <ErrorBox />

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '12px', fontWeight: '700',
              color: '#374151', display: 'block',
              marginBottom: '6px',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px',
            }}>
              Phone Number
            </label>
            <div style={{
              display: 'flex',
              border: '1.5px solid #e8e4df',
              borderRadius: '10px', overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 12px',
                background: '#f9fafb',
                borderRight: '1px solid #e8e4df',
                fontSize: '14px', color: '#374151',
                fontWeight: '600', whiteSpace: 'nowrap',
              }}>
                🇮🇳 +91
              </div>
              <input
                type="tel"
                value={loginPhone}
                onChange={(e) => {
                  const v = e.target.value
                    .replace(/\D/g, '');
                  if (v.length <= 10) setLoginPhone(v);
                }}
                placeholder="10-digit number"
                style={{
                  flex: 1, border: 'none',
                  outline: 'none', padding: '12px 14px',
                  fontSize: '15px',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{
              fontSize: '12px', fontWeight: '700',
              color: '#374151', display: 'block',
              marginBottom: '6px',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={loginPwd}
                onChange={(e) => setLoginPwd(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleLogin()
                }
                placeholder="Enter password"
                style={{
                  ...input,
                  paddingRight: '44px',
                }}
              />
              <button
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '16px',
                  color: '#9ca3af', padding: 0,
                }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{
            textAlign: 'right', marginBottom: '20px',
          }}>
            <button
              onClick={() => {
                setScreen('forgot_phone');
                setError('');
              }}
              style={{
                background: 'none', border: 'none',
                color: '#1a4a2e', fontSize: '13px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}>
              Forgot Password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={btn(loading)}>
            {loading ? <>{spinner} Logging in...</>
                     : 'Login →'}
          </button>

          <p style={{
            textAlign: 'center', marginTop: '16px',
            fontSize: '14px', color: '#6b7280',
          }}>
            New customer?{' '}
            <button
              onClick={() => {
                setScreen('register');
                setError('');
              }}
              style={{
                background: 'none', border: 'none',
                color: '#1a4a2e', fontWeight: '700',
                cursor: 'pointer', fontSize: '14px',
              }}>
              Register here
            </button>
          </p>
        </div>
      )}

      {/* ===== REGISTER ===== */}
      {screen === 'register' && (
        <div style={card}>
          <Logo />
          <p style={{
            textAlign: 'center', color: '#6b7280',
            fontSize: '13px', margin: '-16px 0 20px',
          }}>
            Create your account
          </p>
          <ErrorBox />

          {[
            {
              label: 'Full Name',
              value: regName,
              set: setRegName,
              type: 'text',
              ph: 'Your name',
            },
            {
              label: 'Phone Number',
              value: regPhone,
              set: (v: string) => {
                const n = v.replace(/\D/g, '');
                if (n.length <= 10) setRegPhone(n);
              },
              type: 'tel',
              ph: '10-digit mobile number',
            },
            {
              label: 'Password',
              value: regPwd,
              set: setRegPwd,
              type: 'password',
              ph: 'Min 6 characters',
            },
            {
              label: 'Confirm Password',
              value: regConfirm,
              set: setRegConfirm,
              type: 'password',
              ph: 'Repeat password',
            },
          ].map((f) => (
            <div key={f.label}
              style={{ marginBottom: '12px' }}>
              <label style={{
                fontSize: '12px', fontWeight: '700',
                color: '#374151', display: 'block',
                marginBottom: '6px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
              }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.ph}
                style={input}
              />
            </div>
          ))}

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{ ...btn(loading), marginTop: '4px' }}>
            {loading ? <>{spinner} Creating account...</>
                     : 'Create Account →'}
          </button>

          <p style={{
            textAlign: 'center', marginTop: '14px',
            fontSize: '14px', color: '#6b7280',
          }}>
            Already have account?{' '}
            <button
              onClick={() => {
                setScreen('login');
                setError('');
              }}
              style={{
                background: 'none', border: 'none',
                color: '#1a4a2e', fontWeight: '700',
                cursor: 'pointer', fontSize: '14px',
              }}>
              Login
            </button>
          </p>
        </div>
      )}

      {/* ===== FORGOT — PHONE ===== */}
      {screen === 'forgot_phone' && (
        <div style={card}>
          <div style={{
            textAlign: 'center', marginBottom: '24px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>
              🔑
            </div>
            <h2 style={{
              fontSize: '20px', fontWeight: '700',
              margin: '0 0 4px',
            }}>
              Forgot Password?
            </h2>
            <p style={{
              color: '#6b7280', fontSize: '13px', margin: 0,
            }}>
              Enter your registered phone number
            </p>
          </div>
          <ErrorBox />

          <label style={{
            fontSize: '12px', fontWeight: '700',
            color: '#374151', display: 'block',
            marginBottom: '6px',
            textTransform: 'uppercase' as const,
          }}>
            Phone Number
          </label>
          <div style={{
            display: 'flex',
            border: '1.5px solid #e8e4df',
            borderRadius: '10px', overflow: 'hidden',
            marginBottom: '16px',
          }}>
            <div style={{
              padding: '12px', background: '#f9fafb',
              borderRight: '1px solid #e8e4df',
              fontSize: '14px', color: '#374151',
              fontWeight: '600',
            }}>
              🇮🇳 +91
            </div>
            <input
              type="tel"
              value={forgotPhone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                if (v.length <= 10) setForgotPhone(v);
              }}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleSendOtp()
              }
              placeholder="10-digit number"
              style={{
                flex: 1, border: 'none', outline: 'none',
                padding: '12px 14px', fontSize: '15px',
                fontFamily: 'monospace', fontWeight: '600',
              }}
            />
          </div>

          <button
            onClick={handleSendOtp}
            disabled={loading || forgotPhone.length !== 10}
            style={btn(loading || forgotPhone.length !== 10)}>
            {loading ? <>{spinner} Sending OTP...</>
                     : 'Send OTP →'}
          </button>

          <button
            onClick={resetAll}
            style={{
              background: 'none', border: 'none',
              color: '#6b7280', fontSize: '13px',
              cursor: 'pointer', width: '100%',
              marginTop: '10px',
            }}>
            ← Back to Login
          </button>
        </div>
      )}

      {/* ===== FORGOT — OTP ===== */}
      {screen === 'forgot_otp' && (
        <div style={card}>
          <div style={{
            textAlign: 'center', marginBottom: '20px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>
              📱
            </div>
            <h2 style={{
              fontSize: '20px', fontWeight: '700',
              margin: '0 0 4px',
            }}>
              Enter OTP
            </h2>
            <p style={{
              color: '#6b7280', fontSize: '13px', margin: 0,
            }}>
              {screenOtp
                ? 'SMS unavailable. Use OTP below:'
                : `OTP sent to +91 ${forgotPhone}`}
            </p>
          </div>
          <ErrorBox />

          {screenOtp && (
            <div style={{
              background: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '10px', padding: '16px',
              textAlign: 'center', marginBottom: '16px',
            }}>
              <p style={{
                color: '#92400e', fontSize: '11px',
                margin: '0 0 6px', fontWeight: '700',
              }}>
                YOUR OTP
              </p>
              <p style={{
                color: '#78350f', fontSize: '40px',
                fontWeight: '700', letterSpacing: '10px',
                margin: 0, fontFamily: 'monospace',
              }}>
                {screenOtp}
              </p>
            </div>
          )}

          <input
            type="text"
            value={forgotOtp}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '');
              if (v.length <= 6) setForgotOtp(v);
            }}
            placeholder="• • • • • •"
            maxLength={6}
            style={{
              ...input,
              fontSize: '32px',
              textAlign: 'center',
              letterSpacing: '14px',
              fontFamily: 'monospace',
              fontWeight: '700',
              marginBottom: '14px',
            }}
          />

          <button
            onClick={handleVerifyOtp}
            disabled={loading || forgotOtp.length !== 6}
            style={btn(loading || forgotOtp.length !== 6)}>
            {loading ? <>{spinner} Verifying...</>
                     : 'Verify OTP →'}
          </button>

          <div style={{
            textAlign: 'center', marginTop: '12px',
          }}>
            {timer > 0 ? (
              <p style={{
                color: '#9ca3af', fontSize: '13px', margin: 0,
              }}>
                Resend in {timer}s
              </p>
            ) : (
              <button
                onClick={() => {
                  setForgotOtp('');
                  setScreenOtp('');
                  setError('');
                  handleSendOtp();
                }}
                style={{
                  background: 'none', border: 'none',
                  color: '#1a4a2e', fontSize: '13px',
                  cursor: 'pointer', fontWeight: '600',
                }}>
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===== FORGOT — NEW PASSWORD ===== */}
      {screen === 'forgot_newpwd' && (
        <div style={card}>
          <div style={{
            textAlign: 'center', marginBottom: '20px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>
              🔒
            </div>
            <h2 style={{
              fontSize: '20px', fontWeight: '700',
              margin: '0 0 4px',
            }}>
              Set New Password
            </h2>
            <p style={{
              color: '#6b7280', fontSize: '13px', margin: 0,
            }}>
              Choose a strong password
            </p>
          </div>
          <ErrorBox />

          <input
            type="password"
            value={forgotNewPwd}
            onChange={(e) => setForgotNewPwd(e.target.value)}
            placeholder="New password (min 6 chars)"
            style={{ ...input, marginBottom: '12px' }}
          />

          <input
            type="password"
            value={forgotConfirm}
            onChange={(e) => setForgotConfirm(e.target.value)}
            placeholder="Confirm new password"
            style={{
              ...input,
              marginBottom: '8px',
              borderColor: forgotConfirm &&
                forgotNewPwd !== forgotConfirm
                ? '#dc2626' : '#e8e4df',
            }}
          />

          {forgotConfirm && forgotNewPwd !== forgotConfirm && (
            <p style={{
              color: '#dc2626', fontSize: '12px',
              margin: '0 0 12px',
            }}>
              ✗ Passwords do not match
            </p>
          )}
          {forgotConfirm &&
           forgotNewPwd === forgotConfirm && (
            <p style={{
              color: '#16a34a', fontSize: '12px',
              margin: '0 0 12px',
            }}>
              ✓ Passwords match
            </p>
          )}

          <button
            onClick={handleResetPwd}
            disabled={loading}
            style={btn(loading)}>
            {loading ? <>{spinner} Resetting...</>
                     : 'Set New Password ✓'}
          </button>
        </div>
      )}

      {/* ===== FORGOT — DONE ===== */}
      {screen === 'forgot_done' && (
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            ✅
          </div>
          <h2 style={{
            fontSize: '22px', fontWeight: '700',
            margin: '0 0 8px',
          }}>
            Password Reset!
          </h2>
          <p style={{
            color: '#6b7280', fontSize: '14px',
            margin: '0 0 24px',
          }}>
            Your password has been updated successfully.
            Login with your new password.
          </p>
          <button
            onClick={resetAll}
            style={btn()}>
            Login Now →
          </button>
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
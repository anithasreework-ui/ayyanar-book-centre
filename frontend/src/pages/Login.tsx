import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fallbackOtp, setFallbackOtp] = useState('');
  const [timer, setTimer] = useState(0);

  const startTimer = () => {
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Enter valid 10-digit phone number!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/auth/send-otp`,
        { phone: cleaned },
        { timeout: 30000 }
      );
      if (res.data.otp) {
        setFallbackOtp(res.data.otp);
      }
      setStep('otp');
      startTimer();
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Failed to send OTP. Try again!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Enter 6-digit OTP!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${API}/auth/verify-otp`,
        { phone: phone.replace(/\D/g, ''), otp },
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
        phone: res.data.phone,
      }));
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Wrong OTP! Try again.'
      );
    } finally {
      setLoading(false);
    }
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
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '40px 32px',
        width: '100%',
        maxWidth: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid #f0ede8',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            border: '3px solid #d4a853',
            overflow: 'hidden',
            margin: '0 auto 16px',
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
            Ayyanar Book Centre
          </h1>
          <p style={{
            color: '#9ca3af', fontSize: '13px', margin: 0,
          }}>
            {step === 'phone'
              ? 'Enter your phone number to login'
              : 'Enter the OTP sent to your phone'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            color: '#dc2626',
            fontSize: '13px',
          }}>
            ❌ {error}
          </div>
        )}

        {/* STEP 1 — Phone */}
        {step === 'phone' && (
          <div>
            <label style={{
              fontSize: '12px', fontWeight: '700',
              color: '#374151', display: 'block',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Mobile Number
            </label>

            <div style={{
              display: 'flex',
              border: '1.5px solid #e8e4df',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              <div style={{
                padding: '12px 14px',
                background: '#f9fafb',
                borderRight: '1px solid #e8e4df',
                fontSize: '14px',
                color: '#374151',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}>
                🇮🇳 +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  if (v.length <= 10) setPhone(v);
                }}
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleSendOtp()
                }
                placeholder="Enter 10-digit number"
                maxLength={10}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '12px 14px',
                  fontSize: '16px',
                  letterSpacing: '1px',
                  fontFamily: 'monospace',
                  fontWeight: '600',
                }}
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10}
              style={{
                background: loading || phone.length !== 10
                  ? '#e8e4df' : '#1a4a2e',
                color: loading || phone.length !== 10
                  ? '#9ca3af' : '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading || phone.length !== 10
                  ? 'not-allowed' : 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
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
                  Sending OTP...
                </>
              ) : (
                'Send OTP →'
              )}
            </button>

            <p style={{
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '12px',
              marginTop: '16px',
            }}>
              🔒 OTP will be sent via SMS
            </p>
          </div>
        )}

        {/* STEP 2 — OTP */}
        {step === 'otp' && (
          <div>
            <div style={{
              background: '#f0f7f4',
              border: '1px solid #a8d5b5',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              <p style={{
                color: '#1a4a2e', fontSize: '13px',
                margin: 0, fontWeight: '600',
              }}>
                📱 OTP sent to +91 {phone}
              </p>
              <button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                  setFallbackOtp('');
                }}
                style={{
                  background: 'none', border: 'none',
                  color: '#6b7280', fontSize: '12px',
                  cursor: 'pointer', marginTop: '4px',
                  textDecoration: 'underline',
                }}>
                Change number
              </button>
            </div>

            {/* Fallback OTP display */}
            {fallbackOtp && (
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
                  YOUR OTP (SMS unavailable)
                </p>
                <p style={{
                  color: '#78350f', fontSize: '40px',
                  fontWeight: '700', letterSpacing: '10px',
                  margin: 0, fontFamily: 'monospace',
                }}>
                  {fallbackOtp}
                </p>
              </div>
            )}

            <label style={{
              fontSize: '12px', fontWeight: '700',
              color: '#374151', display: 'block',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Enter 6-Digit OTP
            </label>

            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                if (v.length <= 6) setOtp(v);
              }}
              onKeyDown={(e) =>
                e.key === 'Enter' && handleVerifyOtp()
              }
              placeholder="• • • • • •"
              maxLength={6}
              style={{
                width: '100%',
                border: '1.5px solid #e8e4df',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '32px',
                outline: 'none',
                boxSizing: 'border-box',
                textAlign: 'center',
                letterSpacing: '16px',
                fontFamily: 'monospace',
                fontWeight: '700',
                marginBottom: '16px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a4a2e';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8e4df';
              }}
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              style={{
                background: loading || otp.length !== 6
                  ? '#e8e4df' : '#1a4a2e',
                color: loading || otp.length !== 6
                  ? '#9ca3af' : '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading || otp.length !== 6
                  ? 'not-allowed' : 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '12px',
                transition: 'all 0.2s',
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
                  Verifying...
                </>
              ) : (
                '✓ Verify & Login'
              )}
            </button>

            {/* Resend */}
            <div style={{ textAlign: 'center' }}>
              {timer > 0 ? (
                <p style={{
                  color: '#9ca3af', fontSize: '13px',
                  margin: 0,
                }}>
                  Resend OTP in {timer}s
                </p>
              ) : (
                <button
                  onClick={() => {
                    setOtp('');
                    setError('');
                    setFallbackOtp('');
                    handleSendOtp();
                  }}
                  style={{
                    background: 'none', border: 'none',
                    color: '#1a4a2e', fontSize: '13px',
                    cursor: 'pointer', fontWeight: '600',
                    textDecoration: 'underline',
                  }}>
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        <p style={{
          textAlign: 'center',
          color: '#d1d5db',
          fontSize: '11px',
          margin: '20px 0 0',
        }}>
          By logging in, you agree to our{' '}
          <a href="/terms"
            style={{ color: '#1a4a2e' }}>
            Terms & Conditions
          </a>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
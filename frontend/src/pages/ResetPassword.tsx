import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [step, setStep] = useState
    'verifying' | 'form' | 'success' | 'error'
  >('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!token) {
      setStep('error');
      setErrorMsg('Invalid reset link!');
      return;
    }
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      await axios.get(
        `${API}/auth/verify-reset-token/${token}`
      );
      setStep('form');
    } catch (err: any) {
      setStep('error');
      setErrorMsg(
        err.response?.data?.detail ||
        'Invalid or expired reset link!'
      );
    }
  };

  const handleReset = async () => {
    if (!form.new_password || !form.confirm_password) {
      alert('Please fill both fields!');
      return;
    }
    if (form.new_password !== form.confirm_password) {
      alert('Passwords do not match!');
      return;
    }
    if (form.new_password.length < 8) {
      alert('Password must be at least 8 characters!');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      });
      setStep('success');
    } catch (err: any) {
      alert(
        err.response?.data?.detail ||
        'Reset failed! Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = (pwd: string) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { label: 'Weak', color: '#dc2626' };
    if (pwd.length < 8) return { label: 'Fair', color: '#f59e0b' };
    if (
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      pwd.length >= 8
    ) return { label: 'Strong', color: '#16a34a' };
    return { label: 'Good', color: '#1a4a2e' };
  };

  const pwdStrength = strength(form.new_password);

  // Verifying...
  if (step === 'verifying') {
    return (
      <div style={{
        minHeight: '100vh', background: '#faf9f7',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            border: '3px solid #e8e4df',
            borderTopColor: '#1a4a2e',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Verifying your reset link...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error
  if (step === 'error') {
    return (
      <div style={{
        minHeight: '100vh', background: '#faf9f7',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '40px 32px', maxWidth: '420px',
          width: '100%', textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e8e4df',
        }}>
          <div style={{
            fontSize: '48px', marginBottom: '16px',
          }}>
            ❌
          </div>
          <h2 style={{
            fontSize: '20px', fontWeight: '700',
            color: '#1a1a1a', margin: '0 0 8px',
          }}>
            Link Expired or Invalid
          </h2>
          <p style={{
            color: '#6b7280', fontSize: '14px',
            margin: '0 0 24px', lineHeight: '1.5',
          }}>
            {errorMsg}
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#1a4a2e', color: '#fff',
              border: 'none', padding: '12px 28px',
              borderRadius: '8px', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer',
              width: '100%',
            }}>
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  // Success
  if (step === 'success') {
    return (
      <div style={{
        minHeight: '100vh', background: '#faf9f7',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '40px 32px', maxWidth: '420px',
          width: '100%', textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e8e4df',
        }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: '#f0fdf4',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '32px',
          }}>
            ✅
          </div>
          <h2 style={{
            fontSize: '22px', fontWeight: '700',
            color: '#1a1a1a', margin: '0 0 8px',
          }}>
            Password Reset Successful!
          </h2>
          <p style={{
            color: '#6b7280', fontSize: '14px',
            margin: '0 0 28px', lineHeight: '1.6',
          }}>
            Your password has been updated successfully.
            You can now login with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#1a4a2e', color: '#fff',
              border: 'none', padding: '13px',
              borderRadius: '10px', fontSize: '15px',
              fontWeight: '700', cursor: 'pointer',
              width: '100%',
            }}>
            Login Now →
          </button>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div style={{
      minHeight: '100vh', background: '#faf9f7',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        padding: '36px 32px', maxWidth: '420px',
        width: '100%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        border: '1px solid #e8e4df',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px',
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
            color: '#1a1a1a', margin: '0 0 4px',
          }}>
            Create New Password
          </h1>
          <p style={{
            color: '#6b7280', fontSize: '13px', margin: 0,
          }}>
            Choose a strong password for your account
          </p>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column',
          gap: '16px',
        }}>

          {/* New Password */}
          <div>
            <label style={{
              fontSize: '12px', fontWeight: '700',
              color: '#374151', display: 'block',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.new_password}
                onChange={(e) => setForm({
                  ...form, new_password: e.target.value
                })}
                placeholder="Minimum 8 characters"
                style={{
                  width: '100%',
                  border: '1px solid #e8e4df',
                  borderRadius: '8px',
                  padding: '11px 44px 11px 14px',
                  fontSize: '14px', outline: 'none',
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
                  position: 'absolute', right: '12px',
                  top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '16px',
                  color: '#9ca3af', padding: 0,
                }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Strength indicator */}
            {pwdStrength && (
              <div style={{
                marginTop: '6px', display: 'flex',
                alignItems: 'center', gap: '8px',
              }}>
                <div style={{
                  flex: 1, height: '4px',
                  background: '#e8e4df',
                  borderRadius: '2px', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    background: pwdStrength.color,
                    width: pwdStrength.label === 'Weak'
                      ? '25%'
                      : pwdStrength.label === 'Fair'
                      ? '50%'
                      : pwdStrength.label === 'Good'
                      ? '75%'
                      : '100%',
                    transition: 'width 0.3s',
                  }} />
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: '600',
                  color: pwdStrength.color,
                }}>
                  {pwdStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{
              fontSize: '12px', fontWeight: '700',
              color: '#374151', display: 'block',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={form.confirm_password}
              onChange={(e) => setForm({
                ...form, confirm_password: e.target.value
              })}
              placeholder="Repeat your new password"
              style={{
                width: '100%',
                border: `1px solid ${
                  form.confirm_password &&
                  form.new_password !== form.confirm_password
                    ? '#dc2626' : '#e8e4df'
                }`,
                borderRadius: '8px',
                padding: '11px 14px',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a4a2e';
              }}
              onBlur={(e) => {
                e.target.style.borderColor =
                  form.confirm_password &&
                  form.new_password !== form.confirm_password
                    ? '#dc2626' : '#e8e4df';
              }}
            />
            {form.confirm_password &&
             form.new_password !== form.confirm_password && (
              <p style={{
                color: '#dc2626', fontSize: '12px',
                margin: '4px 0 0',
              }}>
                ✗ Passwords do not match
              </p>
            )}
            {form.confirm_password &&
             form.new_password === form.confirm_password && (
              <p style={{
                color: '#16a34a', fontSize: '12px',
                margin: '4px 0 0',
              }}>
                ✓ Passwords match
              </p>
            )}
          </div>

          {/* Requirements */}
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e8e4df',
            borderRadius: '8px', padding: '12px 14px',
          }}>
            <p style={{
              fontSize: '12px', fontWeight: '600',
              color: '#374151', margin: '0 0 6px',
            }}>
              Password requirements:
            </p>
            {[
              {
                ok: form.new_password.length >= 8,
                text: 'At least 8 characters'
              },
              {
                ok: /[A-Z]/.test(form.new_password),
                text: 'One uppercase letter (A-Z)'
              },
              {
                ok: /[0-9]/.test(form.new_password),
                text: 'One number (0-9)'
              },
            ].map((req) => (
              <p key={req.text} style={{
                fontSize: '12px', margin: '3px 0',
                color: req.ok ? '#16a34a' : '#9ca3af',
              }}>
                {req.ok ? '✓' : '○'} {req.text}
              </p>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleReset}
            disabled={loading}
            style={{
              background: '#1a4a2e', color: '#fff',
              border: 'none', padding: '13px',
              borderRadius: '10px', fontSize: '15px',
              fontWeight: '700', cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '4px',
            }}>
            {loading
              ? 'Resetting...'
              : 'Reset Password'}
          </button>

          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none', border: 'none',
              color: '#6b7280', fontSize: '13px',
              cursor: 'pointer', padding: 0,
              textAlign: 'center',
            }}>
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
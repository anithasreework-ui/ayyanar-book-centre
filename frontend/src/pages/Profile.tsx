import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>(
    'success'
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: '', email: '', phone: '',
    address: '', pincode: '', city: '',
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchProfile();
    fetchOrders();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${API}/auth/profile`, { headers }
      );
      setProfile({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        pincode: res.data.pincode || '',
        city: res.data.city || '',
      });
    } catch { }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get(
        `${API}/orders/my-orders`, { headers }
      );
      setOrders(res.data);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const showMsg = (
    text: string, type: 'success' | 'error' = 'success'
  ) => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const saveProfile = async () => {
    if (!profile.name.trim()) {
      showMsg('Name is required!', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${API}/auth/profile`, profile, { headers }
      );
      // Update localStorage
      const u = JSON.parse(
        localStorage.getItem('user') || '{}'
      );
      u.name = profile.name;
      localStorage.setItem('user', JSON.stringify(u));
      showMsg('✅ Profile updated successfully!');
    } catch (err: any) {
      showMsg(
        err.response?.data?.detail || 'Save failed!',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!passwords.current_password ||
        !passwords.new_password) {
      showMsg('Fill all password fields!', 'error');
      return;
    }
    if (passwords.new_password !==
        passwords.confirm_password) {
      showMsg('New passwords do not match!', 'error');
      return;
    }
    if (passwords.new_password.length < 6) {
      showMsg('Minimum 6 characters!', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${API}/auth/change-password`,
        {
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        },
        { headers }
      );
      showMsg('✅ Password changed! Please login again.');
      setPasswords({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      // Logout after 2 seconds
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      showMsg(
        err.response?.data?.detail ||
          'Password change failed!',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { key: 'profile', label: 'My Profile' },
    { key: 'password', label: 'Change Password' },
    { key: 'orders', label: `Orders (${orders.length})` },
  ];

  const STATUS_STYLE: any = {
    pending: { bg: '#fef3c7', color: '#92400e' },
    confirmed: { bg: '#d1fae5', color: '#065f46' },
    packed: { bg: '#dbeafe', color: '#1e40af' },
    shipped: { bg: '#ede9fe', color: '#5b21b6' },
    delivered: { bg: '#dcfce7', color: '#166534' },
    cancelled: { bg: '#fee2e2', color: '#991b1b' },
  };

  return (
    <div style={{
      background: '#faf9f7', minHeight: '100vh',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        maxWidth: '680px', margin: '0 auto',
        padding: '32px 16px',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '16px', marginBottom: '32px',
        }}>
          <div style={{
            width: '60px', height: '60px',
            borderRadius: '50%',
            background: '#1a4a2e',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            color: '#d4a853', fontSize: '24px',
            fontWeight: '700', flexShrink: 0,
          }}>
            {profile.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: '20px', fontWeight: '700',
              color: '#1a1a1a', margin: '0 0 2px',
            }}>
              {profile.name || 'My Account'}
            </h1>
            <p style={{
              color: '#6b7280', fontSize: '13px', margin: 0,
            }}>
              {profile.email}
            </p>
          </div>
          {storedUser.role === 'admin' && (
            <button onClick={() => navigate('/admin')}
              style={{
                background: '#1a4a2e', color: '#fff',
                border: 'none', padding: '8px 16px',
                borderRadius: '8px', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer',
              }}>
              Admin Panel →
            </button>
          )}
        </div>

        {/* Message */}
        {msg && (
          <div style={{
            background: msgType === 'success'
              ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${msgType === 'success'
              ? '#a8d5b5' : '#fca5a5'}`,
            color: msgType === 'success'
              ? '#1a4a2e' : '#dc2626',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '14px', fontWeight: '600',
          }}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e8e4df',
          marginBottom: '24px',
          overflowX: 'auto',
        }}>
          {TABS.map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderBottom: activeTab === tab.key
                  ? '2px solid #1a4a2e'
                  : '2px solid transparent',
                marginBottom: '-2px',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.key
                  ? '700' : '400',
                color: activeTab === tab.key
                  ? '#1a4a2e' : '#6b7280',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== PROFILE TAB ===== */}
        {activeTab === 'profile' && (
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid #e8e4df',
          }}>
            <h2 style={{
              fontSize: '16px', fontWeight: '700',
              margin: '0 0 20px', color: '#1a1a1a',
            }}>
              Personal Information
            </h2>

            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: '14px',
            }}>
              {/* Name */}
              <div>
                <label style={{
                  fontSize: '12px', fontWeight: '700',
                  color: '#374151', display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Full Name *
                </label>
                <input type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({
                    ...profile, name: e.target.value
                  })}
                  placeholder="Your full name"
                  style={{
                    width: '100%', border: '1px solid #e8e4df',
                    borderRadius: '8px', padding: '10px 14px',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1a4a2e';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e8e4df';
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{
                  fontSize: '12px', fontWeight: '700',
                  color: '#374151', display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Phone Number
                </label>
                <input type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({
                    ...profile, phone: e.target.value
                  })}
                  placeholder="+91 9486208869"
                  style={{
                    width: '100%', border: '1px solid #e8e4df',
                    borderRadius: '8px', padding: '10px 14px',
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
              </div>

              {/* Address */}
              <div>
                <label style={{
                  fontSize: '12px', fontWeight: '700',
                  color: '#374151', display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Default Delivery Address
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({
                    ...profile, address: e.target.value
                  })}
                  placeholder="Door no, Street, Area..."
                  rows={3}
                  style={{
                    width: '100%', border: '1px solid #e8e4df',
                    borderRadius: '8px', padding: '10px 14px',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box', resize: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1a4a2e';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e8e4df';
                  }}
                />
              </div>

              {/* City + Pincode */}
              <div style={{ display: 'grid',
                gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    fontSize: '12px', fontWeight: '700',
                    color: '#374151', display: 'block',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    City
                  </label>
                  <input type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({
                      ...profile, city: e.target.value
                    })}
                    placeholder="e.g. Dindigul"
                    style={{
                      width: '100%',
                      border: '1px solid #e8e4df',
                      borderRadius: '8px',
                      padding: '10px 14px', fontSize: '14px',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1a4a2e';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e8e4df';
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: '12px', fontWeight: '700',
                    color: '#374151', display: 'block',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Pincode
                  </label>
                  <input type="text"
                    value={profile.pincode}
                    maxLength={6}
                    onChange={(e) => setProfile({
                      ...profile, pincode: e.target.value
                    })}
                    placeholder="624001"
                    style={{
                      width: '100%',
                      border: '1px solid #e8e4df',
                      borderRadius: '8px',
                      padding: '10px 14px', fontSize: '14px',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1a4a2e';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e8e4df';
                    }}
                  />
                </div>
              </div>

              {/* Save Button */}
              <button onClick={saveProfile}
                disabled={loading}
                style={{
                  background: '#1a4a2e', color: '#fff',
                  border: 'none', padding: '13px',
                  borderRadius: '10px', fontSize: '14px',
                  fontWeight: '700', cursor: 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginTop: '4px',
                }}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            {/* Profile Info Note */}
            <div style={{
              marginTop: '16px',
              background: '#f0f7f4',
              border: '1px solid #a8d5b5',
              borderRadius: '8px', padding: '10px 14px',
              fontSize: '12px', color: '#374151',
            }}>
              💡 Your saved address will auto-fill at checkout!
            </div>
          </div>
        )}

        {/* ===== PASSWORD TAB ===== */}
        {activeTab === 'password' && (
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid #e8e4df',
          }}>
            <h2 style={{
              fontSize: '16px', fontWeight: '700',
              margin: '0 0 6px', color: '#1a1a1a',
            }}>
              Change Password
            </h2>
            <p style={{
              color: '#6b7280', fontSize: '13px',
              margin: '0 0 20px', lineHeight: '1.5',
            }}>
              If you used "Forgot Password", enter the
              <strong> temporary password</strong> as your
              current password, then set a new one.
            </p>

            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: '14px',
            }}>
              {[
                {
                  key: 'current_password',
                  label: 'Current / Temporary Password',
                  ph: 'Enter current or temp password',
                },
                {
                  key: 'new_password',
                  label: 'New Password',
                  ph: 'Minimum 6 characters',
                },
                {
                  key: 'confirm_password',
                  label: 'Confirm New Password',
                  ph: 'Repeat new password',
                },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{
                    fontSize: '12px', fontWeight: '700',
                    color: '#374151', display: 'block',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {f.label}
                  </label>
                  <input type="password"
                    value={(passwords as any)[f.key]}
                    placeholder={f.ph}
                    onChange={(e) => setPasswords({
                      ...passwords, [f.key]: e.target.value
                    })}
                    style={{
                      width: '100%', border: '1px solid #e8e4df',
                      borderRadius: '8px', padding: '10px 14px',
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
                </div>
              ))}

              {/* Password Strength */}
              {passwords.new_password && (
                <div style={{ fontSize: '12px' }}>
                  <p style={{
                    margin: '0 0 4px',
                    color: passwords.new_password.length >= 8
                      ? '#1a4a2e' : '#dc2626',
                    fontWeight: '600',
                  }}>
                    {passwords.new_password.length >= 8
                      ? '✓ Strong password'
                      : `✗ ${8 - passwords.new_password.length} more characters needed`}
                  </p>
                  {passwords.confirm_password && (
                    <p style={{
                      margin: 0,
                      color: passwords.new_password ===
                        passwords.confirm_password
                        ? '#1a4a2e' : '#dc2626',
                      fontWeight: '600',
                    }}>
                      {passwords.new_password ===
                      passwords.confirm_password
                        ? '✓ Passwords match'
                        : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              )}

              <button onClick={changePassword}
                disabled={loading}
                style={{
                  background: '#1a4a2e', color: '#fff',
                  border: 'none', padding: '13px',
                  borderRadius: '10px', fontSize: '14px',
                  fontWeight: '700', cursor: 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginTop: '4px',
                }}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}

        {/* ===== ORDERS TAB ===== */}
        {activeTab === 'orders' && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            gap: '12px',
          }}>
            {ordersLoading ? (
              <div style={{
                textAlign: 'center', padding: '40px',
                background: '#fff', borderRadius: '16px',
                border: '1px solid #e8e4df',
              }}>
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  border: '3px solid #e8e4df',
                  borderTopColor: '#1a4a2e',
                  margin: '0 auto 12px',
                  animation: 'spin 1s linear infinite',
                }} />
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Loading orders...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{
                background: '#fff', borderRadius: '16px',
                padding: '48px 24px', textAlign: 'center',
                border: '1px solid #e8e4df',
              }}>
                <p style={{
                  fontSize: '48px', margin: '0 0 12px',
                }}>
                  📭
                </p>
                <p style={{
                  color: '#6b7280', fontSize: '16px',
                  margin: '0 0 16px',
                }}>
                  No orders yet!
                </p>
                <button onClick={() => navigate('/products')}
                  style={{
                    background: '#1a4a2e', color: '#fff',
                    border: 'none', padding: '10px 24px',
                    borderRadius: '8px', fontSize: '14px',
                    cursor: 'pointer', fontWeight: '600',
                  }}>
                  Start Shopping →
                </button>
              </div>
            ) : (
              orders.map((order: any) => {
                const sc = STATUS_STYLE[order.status] ||
                  { bg: '#f3f4f6', color: '#374151' };
                return (
                  <div key={order.id} style={{
                    background: '#fff',
                    borderRadius: '16px', padding: '20px',
                    border: '1px solid #e8e4df',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}>
                    {/* Order Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                      flexWrap: 'wrap', gap: '8px',
                    }}>
                      <div>
                        <p style={{
                          fontWeight: '700', fontSize: '15px',
                          margin: '0 0 2px', color: '#1a1a1a',
                        }}>
                          Order #{order.id}
                        </p>
                        <p style={{
                          color: '#9ca3af', fontSize: '12px',
                          margin: 0,
                        }}>
                          {new Date(order.created_at)
                            .toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short',
                              year: 'numeric',
                            })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontWeight: '700', fontSize: '18px',
                          margin: '0 0 4px', color: '#1a4a2e',
                        }}>
                          Rs.{order.total_amount}
                        </p>
                        <span style={{
                          background: sc.bg, color: sc.color,
                          fontSize: '11px', fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '20px',
                        }}>
                          {order.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Type */}
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        background: order.delivery_type ===
                          'store_pickup' ? '#f5f3ff' : '#eff6ff',
                        color: order.delivery_type ===
                          'store_pickup' ? '#7c3aed' : '#1d4ed8',
                        fontSize: '11px', fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: '20px',
                      }}>
                        {order.delivery_type === 'store_pickup'
                          ? '🏪 Store Pickup'
                          : '🚚 Home Delivery'}
                      </span>
                    </div>

                    {/* OTP */}
                    {order.otp_code && (
                      <div style={{
                        background: '#f5f3ff',
                        border: '1px solid #ddd6fe',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '10px',
                        textAlign: 'center',
                      }}>
                        <p style={{
                          fontSize: '11px', color: '#7c3aed',
                          fontWeight: '700', margin: '0 0 4px',
                          letterSpacing: '1px',
                        }}>
                          STORE PICKUP OTP
                        </p>
                        <p style={{
                          fontSize: '28px', fontWeight: '700',
                          color: '#5b21b6',
                          letterSpacing: '6px',
                          margin: 0,
                          fontFamily: 'monospace',
                        }}>
                          {order.otp_code}
                        </p>
                        <p style={{
                          fontSize: '11px', color: '#6b7280',
                          margin: '4px 0 0',
                        }}>
                          Show at Ayyanar Book Centre, Dindigul
                        </p>
                      </div>
                    )}

                    {/* Tracking ID */}
                    {order.tracking_id && (
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #a8d5b5',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '10px',
                        textAlign: 'center',
                      }}>
                        <p style={{
                          fontSize: '11px', color: '#1a4a2e',
                          fontWeight: '700', margin: '0 0 4px',
                          letterSpacing: '1px',
                        }}>
                          TRACKING ID
                        </p>
                        <p style={{
                          fontSize: '24px', fontWeight: '700',
                          color: '#1a4a2e',
                          letterSpacing: '4px',
                          margin: '0 0 6px',
                          fontFamily: 'monospace',
                        }}>
                          {order.tracking_id}
                        </p>
                        <button
                          onClick={() => navigate('/orders')}
                          style={{
                            background: '#1a4a2e', color: '#fff',
                            border: 'none', padding: '6px 16px',
                            borderRadius: '6px', fontSize: '12px',
                            cursor: 'pointer', fontWeight: '600',
                          }}>
                          Track Order →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Profile;
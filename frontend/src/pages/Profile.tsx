import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const Profile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchOrders();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${API}/auth/profile`, { headers }
      );
      setProfileForm({
        name: res.data.name || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
      });
    } catch { }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        `${API}/orders/my-orders`, { headers }
      );
      setOrders(res.data);
    } catch { setOrders([]); }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${API}/auth/profile`,
        profileForm,
        { headers }
      );
      const updatedUser = { ...user, name: profileForm.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSaved('profile');
      setTimeout(() => setSaved(''), 2500);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Save failed!');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!passwordForm.current_password ||
        !passwordForm.new_password) {
      alert('Fill all password fields!');
      return;
    }
    if (passwordForm.new_password !==
        passwordForm.confirm_password) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${API}/auth/change-password`,
        {
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        },
        { headers }
      );
      setSaved('password');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setSaved(''), 2500);
    } catch (err: any) {
      alert(err.response?.data?.detail ||
        'Password change failed!');
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { key: 'profile', label: 'My Profile' },
    { key: 'password', label: 'Change Password' },
    { key: 'orders', label: `My Orders (${orders.length})` },
  ];

  const STATUS_COLORS: any = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    confirmed: { bg: '#d1fae5', text: '#065f46' },
    packed: { bg: '#dbeafe', text: '#1e40af' },
    shipped: { bg: '#ede9fe', text: '#5b21b6' },
    delivered: { bg: '#dcfce7', text: '#166534' },
    cancelled: { bg: '#fee2e2', text: '#991b1b' },
  };

  return (
    <div style={{
      background: '#faf9f7', minHeight: '100vh',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        maxWidth: '720px', margin: '0 auto', padding: '32px 16px',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '16px', marginBottom: '32px',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#1a4a2e', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#d4a853', fontSize: '22px', fontWeight: '700',
            flexShrink: 0,
          }}>
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={{
              fontSize: '22px', fontWeight: '700',
              color: '#1a1a1a', margin: '0 0 2px',
            }}>
              {user.name || 'My Account'}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '13px',
              margin: 0 }}>
              {user.role === 'admin' ? 'Shop Owner' : 'Customer'}
            </p>
          </div>
          {user.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              style={{
                marginLeft: 'auto',
                background: '#1a4a2e', color: '#fff',
                border: 'none', padding: '8px 16px',
                borderRadius: '8px', fontSize: '13px',
                fontWeight: '600', cursor: 'pointer',
              }}>
              Admin Panel →
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '2px solid #e8e4df',
          marginBottom: '24px', gap: '4px',
        }}>
          {TABS.map((tab) => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                borderBottom: activeTab === tab.key
                  ? '2px solid #1a4a2e' : '2px solid transparent',
                marginBottom: '-2px',
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: '14px',
                fontWeight: activeTab === tab.key ? '700' : '400',
                color: activeTab === tab.key
                  ? '#1a4a2e' : '#6b7280',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== PROFILE TAB ===== */}
        {activeTab === 'profile' && (
          <div style={{
            background: '#fff', borderRadius: '12px',
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

            {saved === 'profile' && (
              <div style={{
                background: '#f0fdf4', border: '1px solid #a8d5b5',
                borderRadius: '8px', padding: '10px 14px',
                marginBottom: '16px', color: '#1a4a2e',
                fontSize: '13px', fontWeight: '600',
              }}>
                ✅ Profile updated successfully!
              </div>
            )}

            <div style={{ display: 'flex',
              flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'name', label: 'Full Name',
                  type: 'text', ph: 'Your full name' },
                { key: 'phone', label: 'Phone Number',
                  type: 'tel', ph: '+91 XXXXXXXXXX' },
                { key: 'address', label: 'Default Delivery Address',
                  type: 'text',
                  ph: 'Door no, Street, City, Pincode' },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{
                    fontSize: '13px', fontWeight: '600',
                    color: '#374151', display: 'block',
                    marginBottom: '6px',
                  }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={(profileForm as any)[f.key]}
                    placeholder={f.ph}
                    onChange={(e) => setProfileForm({
                      ...profileForm,
                      [f.key]: e.target.value,
                    })}
                    style={{
                      width: '100%', border: '1px solid #e8e4df',
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
              ))}

              <button
                onClick={saveProfile}
                disabled={loading}
                style={{
                  background: '#1a4a2e', color: '#fff',
                  border: 'none', padding: '12px',
                  borderRadius: '8px', fontSize: '14px',
                  fontWeight: '700', cursor: 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {/* ===== PASSWORD TAB ===== */}
        {activeTab === 'password' && (
          <div style={{
            background: '#fff', borderRadius: '12px',
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
              margin: '0 0 20px',
            }}>
              If you used forgot password, enter the temporary
              password as current password.
            </p>

            {saved === 'password' && (
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #a8d5b5',
                borderRadius: '8px', padding: '10px 14px',
                marginBottom: '16px', color: '#1a4a2e',
                fontSize: '13px', fontWeight: '600',
              }}>
                ✅ Password changed successfully! Please login again.
              </div>
            )}

            <div style={{ display: 'flex',
              flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'current_password',
                  label: 'Current Password (or Temp Password)',
                  ph: 'Enter current password' },
                { key: 'new_password',
                  label: 'New Password',
                  ph: 'Minimum 6 characters' },
                { key: 'confirm_password',
                  label: 'Confirm New Password',
                  ph: 'Repeat new password' },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{
                    fontSize: '13px', fontWeight: '600',
                    color: '#374151', display: 'block',
                    marginBottom: '6px',
                  }}>
                    {f.label}
                  </label>
                  <input
                    type="password"
                    value={(passwordForm as any)[f.key]}
                    placeholder={f.ph}
                    onChange={(e) => setPasswordForm({
                      ...passwordForm,
                      [f.key]: e.target.value,
                    })}
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
              ))}

              {/* Password strength */}
              {passwordForm.new_password && (
                <div style={{ fontSize: '12px' }}>
                  <p style={{
                    margin: '0 0 4px',
                    color: passwordForm.new_password.length >= 8
                      ? '#1a4a2e' : '#dc2626',
                    fontWeight: '600',
                  }}>
                    {passwordForm.new_password.length >= 8
                      ? '✓ Strong password'
                      : '✗ Use at least 8 characters'}
                  </p>
                  {passwordForm.confirm_password && (
                    <p style={{
                      margin: 0,
                      color: passwordForm.new_password ===
                        passwordForm.confirm_password
                        ? '#1a4a2e' : '#dc2626',
                      fontWeight: '600',
                    }}>
                      {passwordForm.new_password ===
                        passwordForm.confirm_password
                        ? '✓ Passwords match'
                        : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={changePassword}
                disabled={loading}
                style={{
                  background: '#1a4a2e', color: '#fff',
                  border: 'none', padding: '12px',
                  borderRadius: '8px', fontSize: '14px',
                  fontWeight: '700', cursor: 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}>
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}

        {/* ===== ORDERS TAB ===== */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex',
            flexDirection: 'column', gap: '12px' }}>
            {orders.length === 0 ? (
              <div style={{
                background: '#fff', borderRadius: '12px',
                padding: '48px', textAlign: 'center',
                border: '1px solid #e8e4df',
              }}>
                <p style={{ fontSize: '48px', margin: '0 0 12px' }}>
                  📭
                </p>
                <p style={{ color: '#6b7280', fontSize: '16px',
                  margin: 0 }}>
                  No orders yet!
                </p>
                <button
                  onClick={() => navigate('/products')}
                  style={{
                    marginTop: '16px',
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
                const sc = STATUS_COLORS[order.status] ||
                  { bg: '#f3f4f6', text: '#374151' };
                return (
                  <div key={order.id} style={{
                    background: '#fff', borderRadius: '12px',
                    padding: '20px', border: '1px solid #e8e4df',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: '12px',
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
                          background: sc.bg, color: sc.text,
                          fontSize: '11px', fontWeight: '700',
                          padding: '3px 8px', borderRadius: '20px',
                        }}>
                          {order.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', gap: '8px',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        background: order.delivery_type ===
                          'store_pickup'
                          ? '#f5f3ff' : '#eff6ff',
                        color: order.delivery_type ===
                          'store_pickup'
                          ? '#7c3aed' : '#1d4ed8',
                        fontSize: '11px', fontWeight: '600',
                        padding: '4px 10px', borderRadius: '20px',
                      }}>
                        {order.delivery_type === 'store_pickup'
                          ? 'Store Pickup' : 'Home Delivery'}
                      </span>
                    </div>

                    {/* OTP / Tracking */}
                    {order.otp_code && (
                      <div style={{
                        marginTop: '12px',
                        background: '#f5f3ff',
                        border: '1px solid #ddd6fe',
                        borderRadius: '8px',
                        padding: '10px 14px',
                      }}>
                        <p style={{
                          fontSize: '11px', color: '#7c3aed',
                          fontWeight: '600', margin: '0 0 2px',
                        }}>
                          STORE PICKUP OTP
                        </p>
                        <p style={{
                          fontSize: '24px', fontWeight: '700',
                          color: '#5b21b6', letterSpacing: '4px',
                          margin: 0, fontFamily: 'monospace',
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

                    {order.tracking_id && (
                      <div style={{
                        marginTop: '12px',
                        background: '#f0fdf4',
                        border: '1px solid #a8d5b5',
                        borderRadius: '8px',
                        padding: '10px 14px',
                      }}>
                        <p style={{
                          fontSize: '11px', color: '#1a4a2e',
                          fontWeight: '600', margin: '0 0 2px',
                        }}>
                          TRACKING ID
                        </p>
                        <p style={{
                          fontSize: '20px', fontWeight: '700',
                          color: '#1a4a2e', letterSpacing: '2px',
                          margin: 0, fontFamily: 'monospace',
                        }}>
                          {order.tracking_id}
                        </p>
                        <button
                          onClick={() => navigate('/orders')}
                          style={{
                            marginTop: '6px',
                            background: 'none', border: 'none',
                            color: '#1a4a2e', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '600',
                            padding: 0,
                          }}>
                          Track this order →
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
    </div>
  );
};

export default Profile;
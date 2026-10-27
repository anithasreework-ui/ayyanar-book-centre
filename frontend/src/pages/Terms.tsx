import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const Terms = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    phone: '+91 9894235330',
    customer_care: '+91 9894235330',
    email: 'ayyanarbookcentredgl1@gmail.com',
    shop_address:
      '14, Dudley School Building, AMC Road, Dindigul, Tamil Nadu 624001',
    working_hours:
      'Monday to Saturday, 9:00 AM to 9:00 PM',
  });

  useEffect(() => {
    axios.get(`${API}/settings/public`)
      .then((res) => {
        if (res.data) setSettings(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{
      maxWidth: '800px', margin: '0 auto',
      padding: '32px 16px',
      fontFamily: 'sans-serif',
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: 'none',
          color: '#1a4a2e', cursor: 'pointer',
          fontSize: '14px', marginBottom: '16px',
          display: 'block',
        }}>
        ← Back
      </button>

      <h1 style={{
        fontSize: '28px', fontWeight: '700',
        color: '#1a1a1a', margin: '0 0 4px',
      }}>
        Terms & Conditions
      </h1>
      <p style={{
        color: '#6b7280', marginBottom: '32px',
        fontSize: '14px',
      }}>
        Ayyanar Book Centre — Dindigul, Tamil Nadu
      </p>

      <div style={{ display: 'flex',
        flexDirection: 'column', gap: '20px' }}>

        {/* Delivery */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '24px', border: '1px solid #e8e4df',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{
            fontSize: '18px', fontWeight: '700',
            margin: '0 0 16px', color: '#1a1a1a',
          }}>
            🚚 Delivery Policy
          </h2>

          <div style={{
            background: '#f0fdf4',
            border: '1px solid #a8d5b5',
            borderRadius: '10px', padding: '14px',
            marginBottom: '12px',
          }}>
            <p style={{
              fontWeight: '700', color: '#1a4a2e',
              margin: '0 0 8px',
            }}>
              ✅ FREE Delivery
            </p>
            <ul style={{
              color: '#374151', fontSize: '14px',
              margin: 0, paddingLeft: '16px',
              lineHeight: '1.8',
            }}>
              <li>Books and items under 1 kg — FREE across India</li>
              <li>Lightweight stationery items — FREE delivery</li>
            </ul>
          </div>

          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px', padding: '14px',
            marginBottom: '12px',
          }}>
            <p style={{
              fontWeight: '700', color: '#1d4ed8',
              margin: '0 0 12px',
            }}>
              📦 Weight-Based Charges (Above 1kg)
            </p>
            <table style={{
              width: '100%', fontSize: '13px',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{ background: '#dbeafe' }}>
                  {['Weight', 'Charge', 'Note'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 10px',
                      color: '#1e40af',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Under 1 kg', 'FREE 🎉', 'Pan India'],
                  ['1 – 2 kg', 'Rs.80', 'Approx'],
                  ['2 – 5 kg', 'Rs.150', 'Approx'],
                  ['Above 5 kg', 'Rs.200+', 'Varies'],
                  ['International', 'Rs.800+', 'Weight based'],
                ].map(row => (
                  <tr key={row[0]} style={{
                    borderTop: '1px solid #dbeafe',
                  }}>
                    <td style={{ padding: '8px 10px',
                      fontWeight: '500' }}>
                      {row[0]}
                    </td>
                    <td style={{ padding: '8px 10px',
                      color: '#1d4ed8', fontWeight: '700' }}>
                      {row[1]}
                    </td>
                    <td style={{ padding: '8px 10px',
                      color: '#6b7280', fontSize: '12px' }}>
                      {row[2]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{
              color: '#6b7280', fontSize: '11px',
              margin: '8px 0 0', fontStyle: 'italic',
            }}>
              * Final charges may vary by actual weight and location.
              We will contact you if there is any difference.
            </p>
          </div>

          <div style={{
            background: '#faf5ff',
            border: '1px solid #d8b4fe',
            borderRadius: '10px', padding: '14px',
          }}>
            <p style={{
              fontWeight: '700', color: '#7c3aed',
              margin: '0 0 8px',
            }}>
              🏪 Store Pickup — Dindigul
            </p>
            <ul style={{
              color: '#374151', fontSize: '14px',
              margin: 0, paddingLeft: '16px',
              lineHeight: '1.8',
            }}>
              <li>No delivery charges</li>
              <li>Show OTP at store counter</li>
              <li>Prepaid orders only</li>
              <li>Timing: {settings.working_hours}</li>
              <li>Address: {settings.shop_address}</li>
            </ul>
          </div>
        </div>

        {/* Order Policy */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '24px', border: '1px solid #e8e4df',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{
            fontSize: '18px', fontWeight: '700',
            margin: '0 0 16px', color: '#1a1a1a',
          }}>
            📋 Order Policy
          </h2>
          <ul style={{
            color: '#374151', fontSize: '14px',
            paddingLeft: '16px', lineHeight: '2',
            margin: 0,
          }}>
            {[
              'Orders processed within 1–2 business days',
              'Tamil Nadu delivery: 2–3 business days',
              'Other states: 4–7 business days',
              'International: 10–20 business days',
              'Cancellation: Contact within 24 hours',
              'Wholesale orders: Contact us for pricing',
              'All orders verified before dispatch',
            ].map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Return Policy */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '24px', border: '1px solid #e8e4df',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{
            fontSize: '18px', fontWeight: '700',
            margin: '0 0 16px', color: '#1a1a1a',
          }}>
            🔄 Return & Refund Policy
          </h2>

          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '10px', padding: '14px',
            marginBottom: '12px',
          }}>
            <p style={{
              fontWeight: '700', color: '#92400e',
              margin: '0 0 6px',
            }}>
              ⚠️ Important Notice
            </p>
            <p style={{
              color: '#78350f', fontSize: '14px', margin: 0,
            }}>
              All orders are carefully checked and verified
              before dispatch. Hassle-free shopping guaranteed!
            </p>
          </div>

          <div style={{
            background: '#f0fdf4',
            border: '1px solid #a8d5b5',
            borderRadius: '10px', padding: '14px',
            marginBottom: '12px',
          }}>
            <p style={{
              fontWeight: '700', color: '#1a4a2e',
              margin: '0 0 8px',
            }}>
              ✅ Eligible for Return
            </p>
            <ul style={{
              color: '#374151', fontSize: '14px',
              margin: 0, paddingLeft: '16px',
              lineHeight: '1.8',
            }}>
              <li>Print/paper defects → Replacement</li>
              <li>Wrong item delivered → Free replacement</li>
            </ul>
          </div>

          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '10px', padding: '14px',
            marginBottom: '12px',
          }}>
            <p style={{
              fontWeight: '700', color: '#dc2626',
              margin: '0 0 8px',
            }}>
              ❌ NOT Eligible
            </p>
            <ul style={{
              color: '#374151', fontSize: '14px',
              margin: 0, paddingLeft: '16px',
              lineHeight: '1.8',
            }}>
              <li>Books cannot be replaced with different title</li>
              <li>No refund for wrong selection</li>
              <li>Normal wear not eligible</li>
            </ul>
          </div>

          <div style={{
            background: '#1a4a2e', borderRadius: '10px',
            padding: '16px', color: '#fff',
          }}>
            <p style={{
              fontWeight: '700', margin: '0 0 10px',
              color: '#d4a853',
            }}>
              📹 Mandatory: Unboxing Video Required
            </p>
            <ul style={{
              fontSize: '14px', margin: 0,
              paddingLeft: '16px', lineHeight: '1.8',
              color: 'rgba(255,255,255,0.85)',
            }}>
              <li>Record video while opening package</li>
              <li>Without video, return NOT accepted</li>
              <li>
                Email within <strong style={{color:'#d4a853'}}>
                  24 hours
                </strong> of delivery
              </li>
              <li>Email: {settings.email}</li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div style={{
          background: '#1a4a2e', borderRadius: '16px',
          padding: '24px', color: '#fff', textAlign: 'center',
        }}>
          <p style={{
            fontWeight: '700', fontSize: '18px',
            margin: '0 0 12px',
          }}>
            Questions? Contact Us!
          </p>
          <div style={{
            display: 'flex', flexDirection: 'column',
            gap: '4px',
          }}>
            <p style={{ color: '#d4a853', margin: 0 }}>
              📞 {settings.customer_care || '+91 9894235330'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)',
              margin: 0, fontSize: '14px' }}>
              ✉️ {settings.email}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)',
              margin: 0, fontSize: '14px' }}>
              📍 {settings.shop_address}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)',
              margin: 0, fontSize: '14px' }}>
              🕐 {settings.working_hours}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
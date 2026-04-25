import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const API = 'https://ayyanar-book-centre-1.onrender.com';

const CATEGORIES = [
  { label: 'State Board Textbooks', value: 'state_board',
    bg: '#1a4a2e', abbr: 'SB' },
  { label: 'TNPSC Competitive', value: 'tnpsc',
    bg: '#1e3a5f', abbr: 'TN' },
  { label: 'CBSE Textbooks', value: 'cbse',
    bg: '#5a2d82', abbr: 'CB' },
  { label: 'Central Competitive', value: 'central_competitive',
    bg: '#7c2d12', abbr: 'CC' },
  { label: 'NCERT / NEET', value: 'ncert',
    bg: '#c2410c', abbr: 'NE' },
  { label: 'Medical Books', value: 'medical',
    bg: '#0e7490', abbr: 'MD' },
  { label: 'Stationery', value: 'stationery',
    bg: '#b45309', abbr: 'ST' },
  { label: 'Children Books', value: 'children',
    bg: '#be185d', abbr: 'CH' },
  { label: 'Novels', value: 'novels',
    bg: '#374151', abbr: 'NV' },
  { label: 'Motivational', value: 'motivational',
    bg: '#065f46', abbr: 'MO' },
  { label: 'Gifts & Hampers', value: 'gifts',
    bg: '#9d174d', abbr: 'GH' },
  { label: 'School Projects', value: 'projects',
    bg: '#1d4ed8', abbr: 'SP' },
  { label: 'Combos', value: 'combos',
    bg: '#6b21a8', abbr: 'CO' },
  { label: 'Wholesale', value: 'wholesale',
    bg: '#1a4a2e', abbr: 'WS' },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({
    shop_name: 'Ayyanar Book Centre',
    phone: '+91 9894235330',
    email: 'ayyanarbookcentredgl1@gmail.com',
    shop_address: '14, Dudley School Building, AMC Road, Dindigul',
    working_hours: 'Monday to Saturday, 9:00 AM to 9:00 PM',
    tagline: 'Knowledge is the floor of success',
    instagram: '@ayyanarbookcentre',
    branch_2_name: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));

    axios.get(`${API}/settings/public`)
      .then((res) => { if (res.data) setSettings(res.data); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: '#faf9f7', minHeight: '100vh',
      fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* ===== HERO ===== */}
      <div style={{
        background: 'linear-gradient(160deg, #0f2d1a 0%, #1a4a2e 60%, #2d6b45 100%)',
        position: 'relative', overflow: 'hidden',
        padding: '60px 24px 80px',
      }}>
        {/* Decorative lines */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `repeating-linear-gradient(
            90deg, transparent, transparent 80px,
            rgba(255,255,255,0.02) 80px, rgba(255,255,255,0.02) 81px
          )`,
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto',
          position: 'relative', zIndex: 1 }}>

          <div style={{ display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '28px',
            flexWrap: 'wrap', marginBottom: '28px' }}>

            {/* Thiruvalluvar */}
            <div style={{
              width: '110px', height: '110px', borderRadius: '50%',
              border: '3px solid #d4a853',
              overflow: 'hidden', flexShrink: 0,
              boxShadow: '0 0 0 6px rgba(212,168,83,0.15)',
            }}>
              <img src="/logo.jpg" alt="Thiruvalluvar"
                style={{ width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'top' }}
                onError={(e: any) => {
                  e.target.parentElement.style.background = '#1a4a2e';
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(212,168,83,0.15)',
                border: '1px solid rgba(212,168,83,0.3)',
                borderRadius: '4px',
                padding: '4px 14px',
                marginBottom: '10px',
              }}>
                <span style={{ color: '#d4a853', fontSize: '11px',
                  letterSpacing: '3px', fontFamily: 'sans-serif',
                  textTransform: 'uppercase' }}>
                  Est. Dindigul, Tamil Nadu
                </span>
              </div>

              <h1 style={{
                color: '#ffffff', fontSize: 'clamp(28px, 5vw, 52px)',
                fontWeight: '700', lineHeight: '1.1',
                margin: '0 0 8px',
                letterSpacing: '-0.5px',
              }}>
                {settings.shop_name || 'Ayyanar Book Centre'}
              </h1>

              <p style={{
                color: '#d4a853', fontStyle: 'italic',
                fontSize: 'clamp(13px, 2vw, 16px)',
                margin: '0 0 4px',
              }}>
                "{settings.tagline ||
                  'Knowledge is the floor of success'}"
              </p>

              <p style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px', fontFamily: 'sans-serif',
                letterSpacing: '1px',
              }}>
                DINDIGUL'S MOST TRUSTED BOOKSHOP
              </p>
            </div>
          </div>

          {/* Address bar */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '12px 20px',
            textAlign: 'center', marginBottom: '28px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.7)',
              fontSize: '13px', fontFamily: 'sans-serif',
              margin: 0 }}>
              <span style={{ color: '#d4a853' }}>&#9679;</span>
              {' '}14, Dudley School Building, AMC Road,
              Dindigul — 624001
              {' '}<span style={{ color: '#d4a853' }}>&#9679;</span>
              {' '}{settings.phone || '+91 9894235330'}
            </p>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '12px',
            justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: '#d4a853', color: '#0f2d1a',
                border: 'none', padding: '14px 36px',
                borderRadius: '6px', fontSize: '15px',
                fontWeight: '700', cursor: 'pointer',
                fontFamily: 'sans-serif', letterSpacing: '0.5px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background =
                  '#e6be6b';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background =
                  '#d4a853';
              }}>
              Browse Collection
            </button>
            <button
              onClick={() => navigate('/wholesale')}
              style={{
                background: 'transparent',
                color: '#d4a853',
                border: '1.5px solid #d4a853',
                padding: '14px 32px', borderRadius: '6px',
                fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'sans-serif',
                letterSpacing: '0.5px', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background =
                  'rgba(212,168,83,0.1)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background =
                  'transparent';
              }}>
              Wholesale Enquiry
            </button>
          </div>
        </div>
      </div>

      {/* ===== FEATURES BAR ===== */}
      <div style={{
        background: '#1a4a2e',
        borderTop: '1px solid rgba(212,168,83,0.3)',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          padding: '14px 24px',
          display: 'flex', justifyContent: 'center',
          flexWrap: 'wrap', gap: '8px 32px',
        }}>
          {[
            'Free Delivery under 1kg',
            'Worldwide Shipping',
            'Store Pickup — Dindigul',
            'Wholesale for Schools & Colleges',
          ].map((text, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              gap: '8px',
            }}>
              {i > 0 && (
                <span style={{
                  color: 'rgba(212,168,83,0.4)',
                  fontSize: '16px',
                  display: window.innerWidth < 600
                    ? 'none' : 'block',
                }}>|</span>
              )}
              <span style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '12px',
                fontFamily: 'sans-serif',
                letterSpacing: '0.5px',
              }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto',
        padding: '48px 24px' }}>

        {/* ===== CATEGORIES ===== */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: '24px',
            borderBottom: '2px solid #1a4a2e',
            paddingBottom: '12px',
          }}>
            <h2 style={{
              fontSize: '24px', fontWeight: '700',
              color: '#1a1a1a', margin: 0,
            }}>
              Browse by Category
            </h2>
            <button
              onClick={() => navigate('/products')}
              style={{
                color: '#1a4a2e', background: 'none',
                border: 'none', cursor: 'pointer',
                fontSize: '13px', fontFamily: 'sans-serif',
                letterSpacing: '0.5px', fontWeight: '600',
              }}>
              VIEW ALL →
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() =>
                  navigate(`/products?category=${cat.value}`)
                }
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8e4df',
                  borderRadius: '8px',
                  padding: '16px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = cat.bg;
                  el.style.transform = 'translateY(-2px)';
                  el.style.boxShadow =
                    `0 4px 12px rgba(0,0,0,0.1)`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = '#e8e4df';
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow =
                    '0 1px 3px rgba(0,0,0,0.04)';
                }}
              >
                {/* Colored initial badge */}
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '8px',
                  background: cat.bg,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '14px', fontWeight: '700',
                  fontFamily: 'sans-serif',
                  letterSpacing: '0.5px',
                  flexShrink: 0,
                }}>
                  {cat.abbr}
                </div>
                <span style={{
                  fontSize: '11px',
                  color: '#374151',
                  textAlign: 'center',
                  lineHeight: '1.3',
                  fontFamily: 'sans-serif',
                  fontWeight: '600',
                }}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== FEATURED PRODUCTS ===== */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: '24px',
            borderBottom: '2px solid #1a4a2e',
            paddingBottom: '12px',
          }}>
            <h2 style={{
              fontSize: '24px', fontWeight: '700',
              color: '#1a1a1a', margin: 0,
            }}>
              Featured Books
            </h2>
            <button
              onClick={() => navigate('/products')}
              style={{
                color: '#1a4a2e', background: 'none',
                border: 'none', cursor: 'pointer',
                fontSize: '13px', fontFamily: 'sans-serif',
                letterSpacing: '0.5px', fontWeight: '600',
              }}>
              VIEW ALL →
            </button>
          </div>

          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px',
            }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #e8e4df',
                }}>
                  <div style={{
                    height: '200px',
                    background: 'linear-gradient(90deg, #f0ede8 25%, #faf9f7 50%, #f0ede8 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                  }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{
                      height: '12px', background: '#f0ede8',
                      borderRadius: '4px', marginBottom: '8px',
                    }} />
                    <div style={{
                      height: '12px', background: '#f0ede8',
                      borderRadius: '4px', width: '60%',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px',
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e8e4df' }}>
              <div style={{
                width: '60px', height: '80px', margin: '0 auto 16px',
                background: '#1a4a2e', borderRadius: '4px 4px 0 0',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', bottom: '8px',
                  left: '8px', right: '8px',
                  height: '3px', background: '#d4a853',
                  borderRadius: '2px',
                }} />
              </div>
              <p style={{
                color: '#374151', fontSize: '16px',
                fontFamily: 'sans-serif', margin: 0,
              }}>
                Products coming soon!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px',
            }}>
              {products.slice(0, 8).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* ===== WHY US — Editorial Style ===== */}
        <div style={{
          background: '#1a4a2e',
          borderRadius: '12px',
          padding: '40px 32px',
          marginBottom: '48px',
        }}>
          <h2 style={{
            color: '#d4a853', fontSize: '13px',
            letterSpacing: '3px', fontFamily: 'sans-serif',
            textTransform: 'uppercase', margin: '0 0 8px',
          }}>
            WHY CHOOSE US
          </h2>
          <h3 style={{
            color: '#ffffff', fontSize: '26px',
            margin: '0 0 32px', fontWeight: '700',
          }}>
            Dindigul's most trusted book store since years
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '24px',
          }}>
            {[
              { title: 'Free Delivery',
                desc: 'Books under 1kg ship free across India' },
              { title: 'Worldwide Shipping',
                desc: 'International delivery available' },
              { title: 'Store Pickup',
                desc: 'Collect at our Dindigul shop — 9AM to 9PM' },
              { title: 'School Wholesale',
                desc: 'MOU agreements for schools & colleges' },
              { title: 'All Boards',
                desc: 'State Board, CBSE, NCERT & competitive' },
              { title: 'AI Assistant',
                desc: '24/7 chatbot for queries & help' },
            ].map((item) => (
              <div key={item.title} style={{
                borderLeft: '2px solid #d4a853',
                paddingLeft: '16px',
              }}>
                <p style={{
                  color: '#d4a853', fontWeight: '700',
                  fontSize: '14px', margin: '0 0 4px',
                  fontFamily: 'sans-serif',
                }}>
                  {item.title}
                </p>
                <p style={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: '13px', margin: 0,
                  fontFamily: 'sans-serif', lineHeight: '1.4',
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== WHOLESALE CTA ===== */}
        <div style={{
          border: '2px solid #1a4a2e',
          borderRadius: '12px',
          padding: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '48px',
        }}>
          <div>
            <p style={{
              color: '#1a4a2e', fontSize: '13px',
              letterSpacing: '2px', fontFamily: 'sans-serif',
              margin: '0 0 6px', textTransform: 'uppercase',
            }}>
              FOR SCHOOLS & COLLEGES
            </p>
            <h3 style={{
              color: '#1a1a1a', fontSize: '22px',
              margin: 0, fontWeight: '700',
            }}>
              Wholesale & Bulk Orders Available
            </h3>
            <p style={{
              color: '#6b7280', fontSize: '14px',
              fontFamily: 'sans-serif', margin: '6px 0 0',
            }}>
              Special pricing · MOU agreements · Dedicated support
            </p>
          </div>
          <button
            onClick={() => navigate('/wholesale')}
            style={{
              background: '#1a4a2e', color: '#ffffff',
              border: 'none', padding: '14px 28px',
              borderRadius: '6px', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer',
              fontFamily: 'sans-serif', letterSpacing: '0.5px',
              flexShrink: 0,
            }}>
            Enquire Now →
          </button>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: '#0f2d1a',
        borderTop: '1px solid rgba(212,168,83,0.2)',
        padding: '48px 24px 24px',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '32px', marginBottom: '40px',
          }}>

            {/* Brand */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '10px', marginBottom: '12px',
              }}>
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  border: '2px solid #d4a853',
                  overflow: 'hidden',
                }}>
                  <img src="/logo.jpg" alt="Logo"
                    style={{ width: '100%', height: '100%',
                      objectFit: 'cover', objectPosition: 'top' }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <span style={{
                  color: '#ffffff', fontWeight: '700',
                  fontSize: '14px',
                }}>
                  {settings.shop_name || 'Ayyanar Book Centre'}
                </span>
              </div>
              <p style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '12px', fontFamily: 'sans-serif',
                lineHeight: '1.6', margin: 0,
              }}>
                {settings.shop_address ||
                  '14, Dudley School Building, AMC Road, Dindigul'}
              </p>
            </div>

            {/* Contact */}
            <div>
              <p style={{
                color: '#d4a853', fontSize: '11px',
                letterSpacing: '2px', fontFamily: 'sans-serif',
                textTransform: 'uppercase', margin: '0 0 12px',
              }}>
                Contact
              </p>
              <div style={{ display: 'flex', flexDirection: 'column',
                gap: '6px' }}>
                {[
                  settings.phone || '+91 9894235330',
                  settings.email ||
                    'ayyanarbookcentredgl1@gmail.com',
                  settings.instagram || '@ayyanarbookcentre',
                  settings.working_hours ||
                    'Mon–Sat: 9AM–9PM',
                ].map((item, i) => (
                  <p key={i} style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: '12px', fontFamily: 'sans-serif',
                    margin: 0,
                  }}>
                    {item}
                  </p>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <p style={{
                color: '#d4a853', fontSize: '11px',
                letterSpacing: '2px', fontFamily: 'sans-serif',
                textTransform: 'uppercase', margin: '0 0 12px',
              }}>
                Quick Links
              </p>
              <div style={{ display: 'flex',
                flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: 'Products', path: '/products' },
                  { label: 'Wholesale', path: '/wholesale' },
                  { label: 'Track Order', path: '/orders' },
                  { label: 'My Orders', path: '/my-orders' },
                  { label: 'Terms & Conditions',
                    path: '/terms' },
                ].map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    style={{
                      color: 'rgba(255,255,255,0.55)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '12px',
                      fontFamily: 'sans-serif',
                      textAlign: 'left', padding: 0,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.color =
                        '#d4a853';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.color =
                        'rgba(255,255,255,0.55)';
                    }}>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery */}
            <div>
              <p style={{
                color: '#d4a853', fontSize: '11px',
                letterSpacing: '2px', fontFamily: 'sans-serif',
                textTransform: 'uppercase', margin: '0 0 12px',
              }}>
                Delivery
              </p>
              <div style={{ display: 'flex',
                flexDirection: 'column', gap: '6px' }}>
                {[
                  'Under 1kg — FREE',
                  'Tamil Nadu — Rs.80',
                  'Other States — Rs.150',
                  'International — Rs.800+',
                ].map((item) => (
                  <p key={item} style={{
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: '12px', fontFamily: 'sans-serif',
                    margin: 0,
                  }}>
                    {item}
                  </p>
                ))}
                <button
                  onClick={() => navigate('/terms')}
                  style={{
                    color: '#d4a853', background: 'none',
                    border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontFamily: 'sans-serif',
                    textAlign: 'left', padding: 0,
                    marginTop: '4px',
                  }}>
                  Full policy →
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap', gap: '8px',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '11px', fontFamily: 'sans-serif',
              margin: 0,
            }}>
              © 2025 {settings.shop_name ||
                'Ayyanar Book Centre'}. All rights reserved.
            </p>
            <p style={{
              color: '#d4a853', fontSize: '11px',
              fontStyle: 'italic', margin: 0,
              opacity: 0.7,
            }}>
              "{settings.tagline ||
                'Knowledge is the floor of success'}"
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default Home;
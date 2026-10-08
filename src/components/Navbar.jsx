import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Sparkles, LogOut, Package, ChevronDown, Repeat, LogIn } from 'lucide-react';
import { useAuth, friendlyAuthError } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { DEMO_USERS } from '../data/seed';
import Avatar from './Avatar';

export const openAssistant = (prompt) =>
  window.dispatchEvent(new CustomEvent('shopassist:open', { detail: { prompt } }));

export function Logo({ light = false }) {
  return (
    <Link to="/" className={`logo ${light ? 'light' : ''}`} aria-label="ShopAssist AI home">
      <span className="logo-mark">
        <Sparkles size={16} strokeWidth={2.5} />
      </span>
      <span>
        ShopAssist<em> AI</em>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { user, signInDemo, signOut } = useAuth();
  const { totals } = useShop();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMenu(false);
    setDrawer(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onDoc = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  const search = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
    setDrawer(false);
  };

  const switchTo = async (key) => {
    try {
      await signInDemo(key);
      toast.success(`Signed in as ${DEMO_USERS[key].name}`);
      setMenu(false);
    } catch (e) {
      toast.error(friendlyAuthError(e));
    }
  };

  const doSignOut = async () => {
    await signOut();
    setMenu(false);
    setDrawer(false);
    toast.info('Signed out');
    navigate('/');
  };

  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/shop', label: 'Shop' },
    { to: '/orders', label: 'Orders' },
  ];

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <button className="icon-btn nav-burger" onClick={() => setDrawer(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <Logo />

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form className="nav-search" onSubmit={search} role="search">
          <Search size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" aria-label="Search products" />
        </form>

        <div className="nav-actions">
          <Link to="/cart" className="icon-btn cart-btn" aria-label={`Cart, ${totals.count} items`}>
            <ShoppingBag size={20} />
            {totals.count > 0 && (
              <span key={totals.count} className="cart-count">
                {totals.count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button className="user-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
                <Avatar user={user} size={32} />
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <ChevronDown size={15} />
              </button>
              {menu && (
                <div className="dropdown">
                  <div className="dd-head">
                    <Avatar user={user} size={40} />
                    <div>
                      <b>{user.name}</b>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <Link to="/orders" className="dd-item">
                    <Package size={16} /> My orders
                  </Link>
                  <div className="dd-label">
                    <Repeat size={13} /> Switch demo user
                  </div>
                  {Object.values(DEMO_USERS).map((d) => (
                    <button
                      key={d.key}
                      className={`dd-item ${user.email === d.email ? 'current' : ''}`}
                      onClick={() => switchTo(d.key)}
                      disabled={user.email === d.email}
                    >
                      <Avatar user={d} size={22} /> {d.name}
                      {user.email === d.email && <small>current</small>}
                    </button>
                  ))}
                  <button className="dd-item danger" onClick={doSignOut}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-sm btn-dark">
              <LogIn size={15} /> Sign in
            </Link>
          )}
        </div>
      </div>

      {drawer && (
        <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && setDrawer(false)}>
          <aside className="drawer" aria-label="Mobile menu">
            <div className="drawer-head">
              <Logo />
              <button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <form className="nav-search mobile" onSubmit={search} role="search">
              <Search size={17} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" aria-label="Search products" />
            </form>
            <nav className="drawer-links">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end}>
                  {l.label}
                </NavLink>
              ))}
              <NavLink to="/cart">Cart{totals.count > 0 ? ` (${totals.count})` : ''}</NavLink>
              <NavLink to="/policies">Policies</NavLink>
            </nav>
            <button
              className="btn btn-primary"
              onClick={() => {
                setDrawer(false);
                openAssistant();
              }}
            >
              <Sparkles size={16} /> Ask ShopAssist
            </button>
            {user ? (
              <div className="drawer-user">
                <Avatar user={user} size={36} />
                <div>
                  <b>{user.name}</b>
                  <span>{user.email}</span>
                </div>
                <button className="icon-btn" onClick={doSignOut} aria-label="Sign out">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-dark">
                <LogIn size={16} /> Sign in
              </Link>
            )}
          </aside>
        </div>
      )}
    </header>
  );
}

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useAuth, friendlyAuthError } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEMO_USERS } from '../data/seed';
import Avatar from '../components/Avatar';

export default function Login() {
  const { user, ready, signInDemo, signIn, signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  if (ready && user) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const demo = async (key) => {
    setBusy(key);
    setError('');
    try {
      await signInDemo(key);
      toast.success(`Welcome, ${DEMO_USERS[key].name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy('');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy('form');
    setError('');
    try {
      if (mode === 'signin') await signIn(form.email.trim(), form.password);
      else await signUp(form.name.trim(), form.email.trim(), form.password);
      toast.success(mode === 'signin' ? 'Welcome back!' : 'Account created');
      navigate(from, { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="container auth-wrap">
      <div className="auth-card">
        <div className="auth-head">
          <span className="logo-mark big">
            <Sparkles size={20} strokeWidth={2.5} />
          </span>
          <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="muted">Sign in to see your orders, returns and personalised ShopAssist answers.</p>
        </div>

        <div className="demo-users">
          <span className="divider-label">Quick demo login</span>
          {Object.values(DEMO_USERS).map((d) => (
            <button key={d.key} className="demo-user" onClick={() => demo(d.key)} disabled={Boolean(busy)}>
              <Avatar user={d} size={42} />
              <span>
                <b>Continue as {d.name.split(' ')[0]}</b>
                <small>{d.tagline}</small>
              </span>
              {busy === d.key ? <Loader2 size={18} className="spin" /> : <ArrowRight size={18} />}
            </button>
          ))}
        </div>

        <span className="divider-label">or use your email</span>

        <form onSubmit={submit} className="auth-form">
          {mode === 'signup' && (
            <label>
              Full name
              <input required value={form.name} onChange={set('name')} autoComplete="name" />
            </label>
          )}
          <label>
            Email
            <input required type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={set('password')}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-dark btn-lg block" type="submit" disabled={Boolean(busy)}>
            {busy === 'form' ? <Loader2 size={18} className="spin" /> : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
        <p className="auth-switch">
          <Link to="/">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}

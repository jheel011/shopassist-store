import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Banknote, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { placeOrder } from '../services/db';
import { inr } from '../lib/format';
import { Summary } from './Cart';
import { EmptyState } from '../components/States';
import ProductImage from '../components/ProductImage';
import { ShoppingBag } from 'lucide-react';

const METHODS = [
  { value: 'UPI', icon: Wallet, title: 'UPI', text: 'Pay instantly with any UPI app' },
  { value: 'Card', icon: CreditCard, title: 'Credit / Debit card', text: 'Visa, Mastercard, RuPay' },
  { value: 'Cash on Delivery', icon: Banknote, title: 'Cash on delivery', text: 'Pay when it arrives (up to ₹20,000)' },
];

export default function Checkout() {
  const { user, ready } = useAuth();
  const { items, totals, clear } = useShop();
  const toast = useToast();
  const navigate = useNavigate();
  const [method, setMethod] = useState('UPI');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: '', line: '', city: '', pincode: '' });

  if (!ready) return <div className="container page-pad"><div className="skel" style={{ height: 320, borderRadius: 24 }} /></div>;
  if (!user) return <Navigate to="/login" state={{ from: '/checkout' }} replace />;

  if (items.length === 0) {
    return (
      <div className="container page-pad">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out"
          text="Add a few products to your cart first."
          action={<Link to="/shop" className="btn btn-dark">Browse products</Link>}
        />
      </div>
    );
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const codTooBig = method === 'Cash on Delivery' && totals.total > 20000;

  const submit = async (e) => {
    e.preventDefault();
    if (codTooBig) {
      toast.error('Cash on delivery is available up to ₹20,000. Please choose UPI or card.');
      return;
    }
    setBusy(true);
    try {
      const id = await placeOrder({ user, items, paymentMethod: method, address: form });
      clear();
      toast.success(`Order ${id} placed successfully`);
      navigate('/orders', { state: { highlight: id } });
    } catch (err) {
      toast.error(err.message || 'Could not place your order. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page-pad">
      <header className="page-head">
        <div>
          <span className="eyebrow">Almost there</span>
          <h1>Checkout</h1>
        </div>
      </header>

      <form className="cart-layout" onSubmit={submit}>
        <div className="stack-lg">
          <section className="card">
            <h3>Delivery address</h3>
            <div className="form-grid">
              <label>
                Full name
                <input required value={form.name} onChange={set('name')} autoComplete="name" />
              </label>
              <label>
                Phone
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  title="10-digit mobile number"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                />
              </label>
              <label className="span-2">
                Address
                <input required value={form.line} onChange={set('line')} autoComplete="street-address" placeholder="House no., street, area" />
              </label>
              <label>
                City
                <input required value={form.city} onChange={set('city')} autoComplete="address-level2" />
              </label>
              <label>
                PIN code
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  title="6-digit PIN code"
                  value={form.pincode}
                  onChange={set('pincode')}
                  autoComplete="postal-code"
                />
              </label>
            </div>
          </section>

          <section className="card">
            <h3>Payment method</h3>
            <div className="methods">
              {METHODS.map((m) => (
                <label key={m.value} className={`method ${method === m.value ? 'active' : ''}`}>
                  <input type="radio" name="method" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} />
                  <span className="method-icon">
                    <m.icon size={20} />
                  </span>
                  <span>
                    <b>{m.title}</b>
                    <small>{m.text}</small>
                  </span>
                </label>
              ))}
            </div>
            <p className="demo-note">
              <ShieldCheck size={15} /> Demo checkout — no real payment is processed and no card details are collected.
            </p>
          </section>

          <section className="card">
            <h3>Review items</h3>
            <ul className="mini-list">
              {items.map((i) => (
                <li key={i.id}>
                  <div className="mini-img">
                    <ProductImage src={i.image} alt={i.name} category={i.category} />
                  </div>
                  <span>
                    {i.name} <small>× {i.qty}</small>
                  </span>
                  <b>{inr(i.price * i.qty)}</b>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <Summary totals={totals}>
          <button className="btn btn-primary btn-lg block" type="submit" disabled={busy}>
            {busy ? (
              <>
                <Loader2 size={18} className="spin" /> Placing order…
              </>
            ) : (
              `Place order · ${inr(totals.total)}`
            )}
          </button>
          <Link to="/cart" className="link-center">
            Back to cart
          </Link>
        </Summary>
      </form>
    </div>
  );
}

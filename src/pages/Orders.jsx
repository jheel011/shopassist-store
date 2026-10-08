import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Package,
  ChevronDown,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Ban,
  Wallet,
  Clock,
  Undo2,
  LogIn,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cancelOrder, fetchOrders, fetchReturns, requestReturn } from '../services/db';
import { fmtDate, inr, toDate, RETURN_WINDOW_DAYS } from '../lib/format';
import ProductImage from '../components/ProductImage';
import { Skeleton } from '../components/Skeleton';
import { EmptyState, ErrorState } from '../components/States';
import { openAssistant } from '../components/Navbar';

const STEPS = ['Order placed', 'Processing', 'Shipped', 'Out for delivery', 'Delivered'];
const STEP_INDEX = { Processing: 1, Shipped: 2, 'Out for Delivery': 3, Delivered: 4 };
const ACTIVE = ['Processing', 'Shipped', 'Out for Delivery'];
const REASONS = [
  'Damaged or defective',
  'Wrong item received',
  'Size / fit issue',
  'Not as described',
  'Changed my mind',
];

const slug = (s) => String(s).toLowerCase().replace(/[^a-z]+/g, '-');

function Timeline({ order }) {
  if (order.status === 'Cancelled') {
    return (
      <div className="cancelled-note">
        <Ban size={16} /> This order was cancelled.{' '}
        {order.paymentStatus === 'Refund Initiated'
          ? 'Your refund has been initiated and will reach you in 3–5 business days.'
          : 'You were not charged.'}
      </div>
    );
  }
  const idx = STEP_INDEX[order.status] ?? 1;
  return (
    <ol className="timeline">
      {STEPS.map((label, i) => (
        <li key={label} className={i < idx ? 'done' : i === idx ? 'current' : ''}>
          <span className="tl-dot">{i < idx ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
          <b>{label}</b>
          <small>
            {i === 0 && fmtDate(order.orderDate, { day: 'numeric', month: 'short' })}
            {i === 4 && (idx === 4 ? fmtDate(order.deliveryDate, { day: 'numeric', month: 'short' }) : `Est. ${fmtDate(order.deliveryDate, { day: 'numeric', month: 'short' })}`)}
          </small>
        </li>
      ))}
    </ol>
  );
}

function ReturnModal({ order, onClose, onSubmit }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await onSubmit(reason, note);
    setBusy(false);
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal return-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-label="Request a return">
        <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h2>Request a return</h2>
        <p className="muted">
          Order <b>{order.id}</b> · {order.products.map((p) => p.name).join(', ')}
        </p>
        <label>
          Reason for return
          <select className="select full" value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          Additional details <small>(optional)</small>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Tell us what went wrong…" />
        </label>
        <p className="demo-note">Refunds are issued to your original payment method within 5–7 business days after pickup.</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <Loader2 size={16} className="spin" /> : <RotateCcw size={16} />} Submit return
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Orders() {
  const { user, ready } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [orders, setOrders] = useState(null);
  const [returns, setReturns] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(location.state?.highlight || null);
  const [returning, setReturning] = useState(null);
  const [cancelling, setCancelling] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setError('');
    try {
      const [o, r] = await Promise.all([fetchOrders(user.uid), fetchReturns(user.uid)]);
      setOrders(o);
      setReturns(r);
      setOpen((cur) => cur ?? o.find((x) => ACTIVE.includes(x.status))?.id ?? null);
    } catch (e) {
      setError(e.message);
    }
  }, [user]);

  useEffect(() => {
    setOrders(null);
    load();
  }, [load]);

  const returnedOrderIds = useMemo(() => new Set(returns.map((r) => r.orderId)), [returns]);

  const stats = useMemo(() => {
    const list = orders || [];
    const sum = (fn) => list.filter(fn).reduce((s, o) => s + o.total, 0);
    return {
      paid: sum((o) => o.paymentStatus === 'Paid'),
      pending: sum((o) => o.paymentStatus === 'Pending' && o.status !== 'Cancelled'),
      refunds: sum((o) => ['Refunded', 'Refund Initiated'].includes(o.paymentStatus)),
      active: list.filter((o) => ACTIVE.includes(o.status)).length,
    };
  }, [orders]);

  const shown = useMemo(() => {
    const list = orders || [];
    if (filter === 'Active') return list.filter((o) => ACTIVE.includes(o.status));
    if (filter === 'Delivered') return list.filter((o) => o.status === 'Delivered');
    if (filter === 'Cancelled') return list.filter((o) => o.status === 'Cancelled');
    return list;
  }, [orders, filter]);

  const canReturn = (o) => {
    if (o.status !== 'Delivered' || returnedOrderIds.has(o.id)) return false;
    const d = toDate(o.deliveryDate);
    return d && Date.now() - d.getTime() <= RETURN_WINDOW_DAYS * 864e5;
  };

  const doCancel = async (o) => {
    setCancelling(o.id);
    try {
      await cancelOrder(o);
      toast.success(`Order ${o.id} cancelled`);
      await load();
    } catch (e) {
      toast.error(e.message || 'Could not cancel this order.');
    } finally {
      setCancelling('');
    }
  };

  const doReturn = async (reason, note) => {
    try {
      const id = await requestReturn({ order: returning, user, reason, note });
      toast.success(`Return ${id} requested`);
      setReturning(null);
      await load();
    } catch (e) {
      toast.error(e.message || 'Could not submit your return.');
    }
  };

  if (!ready) return <div className="container page-pad"><Skeleton h={260} r={24} /></div>;

  if (!user) {
    return (
      <div className="container page-pad">
        <EmptyState
          icon={Package}
          title="Sign in to see your orders"
          text="Track deliveries, request returns and review payments. Use a demo user for a quick tour."
          action={
            <Link to="/login" state={{ from: '/orders' }} className="btn btn-dark">
              <LogIn size={16} /> Sign in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container page-pad">
      <header className="page-head">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>My orders</h1>
          <p className="muted">Signed in as {user.name}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => openAssistant('Where is my latest order?')}>
          <Sparkles size={16} /> Ask about my orders
        </button>
      </header>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !orders ? (
        <div className="stack-lg">
          <Skeleton h={90} r={20} />
          <Skeleton h={180} r={24} />
          <Skeleton h={180} r={24} />
        </div>
      ) : (
        <>
          <div className="pay-stats">
            <div>
              <span className="ps-icon"><Wallet size={18} /></span>
              <small>Paid</small>
              <b>{inr(stats.paid)}</b>
            </div>
            <div>
              <span className="ps-icon amber"><Clock size={18} /></span>
              <small>Pay on delivery</small>
              <b>{inr(stats.pending)}</b>
            </div>
            <div>
              <span className="ps-icon green"><Undo2 size={18} /></span>
              <small>Refunds</small>
              <b>{inr(stats.refunds)}</b>
            </div>
            <div>
              <span className="ps-icon violet"><Package size={18} /></span>
              <small>Active orders</small>
              <b>{stats.active}</b>
            </div>
          </div>

          <div className="chips" role="tablist">
            {['All', 'Active', 'Delivered', 'Cancelled'].map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          {orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders yet"
              text="When you place an order it will show up here with live tracking."
              action={<Link to="/shop" className="btn btn-dark">Start shopping</Link>}
            />
          ) : shown.length === 0 ? (
            <EmptyState icon={Package} title={`No ${filter.toLowerCase()} orders`} text="Try a different filter." />
          ) : (
            <div className="order-list">
              {shown.map((o) => {
                const isOpen = open === o.id;
                const ret = returns.find((r) => r.orderId === o.id);
                return (
                  <article key={o.id} className={`order ${isOpen ? 'open' : ''}`}>
                    <button className="order-head" onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen}>
                      <div className="oh-id">
                        <small>Order</small>
                        <b>{o.id}</b>
                      </div>
                      <div className="oh-thumbs">
                        {o.products.slice(0, 3).map((p) => (
                          <span key={p.productId} className="oh-thumb">
                            <ProductImage src={p.image} alt={p.name} />
                          </span>
                        ))}
                        <span className="oh-names">
                          {o.products[0].name}
                          {o.products.length > 1 && <em> +{o.products.length - 1} more</em>}
                        </span>
                      </div>
                      <div className="oh-meta">
                        <small>Placed</small>
                        <b>{fmtDate(o.orderDate)}</b>
                      </div>
                      <div className="oh-meta">
                        <small>Total</small>
                        <b>{inr(o.total)}</b>
                      </div>
                      <span className={`status ${slug(o.status)}`}>{o.status}</span>
                      <ChevronDown size={18} className="oh-chev" />
                    </button>

                    {isOpen && (
                      <div className="order-body">
                        <Timeline order={o} />

                        <div className="order-cols">
                          <div>
                            <h4>Items</h4>
                            <ul className="mini-list">
                              {o.products.map((p) => (
                                <li key={p.productId}>
                                  <div className="mini-img">
                                    <ProductImage src={p.image} alt={p.name} />
                                  </div>
                                  <span>
                                    <Link to={`/product/${p.productId}`}>{p.name}</Link> <small>× {p.quantity}</small>
                                  </span>
                                  <b>{inr(p.price * p.quantity)}</b>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4>Payment</h4>
                            <dl className="kv">
                              <div><dt>Method</dt><dd>{o.paymentMethod}</dd></div>
                              <div><dt>Status</dt><dd><span className={`status small ${slug(o.paymentStatus)}`}>{o.paymentStatus}</span></dd></div>
                              {o.subtotal != null && <div><dt>Subtotal</dt><dd>{inr(o.subtotal)}</dd></div>}
                              <div><dt>Delivery</dt><dd>{o.deliveryFee ? inr(o.deliveryFee) : 'Free'}</dd></div>
                              <div className="strong"><dt>Total</dt><dd>{inr(o.total)}</dd></div>
                            </dl>
                          </div>

                          <div>
                            <h4>Delivery</h4>
                            <dl className="kv">
                              <div>
                                <dt>{o.status === 'Delivered' ? 'Delivered on' : 'Expected by'}</dt>
                                <dd>{fmtDate(o.deliveryDate)}</dd>
                              </div>
                              {o.address && (
                                <div className="addr">
                                  <dt>Ship to</dt>
                                  <dd>
                                    {o.address.name}
                                    <br />
                                    {o.address.line}, {o.address.city} {o.address.pincode}
                                  </dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        </div>

                        {ret && (
                          <div className="return-banner">
                            <RotateCcw size={16} />
                            <span>
                              Return <b>{ret.id}</b> · {ret.reason}
                            </span>
                            <span className={`status small ${slug(ret.status)}`}>{ret.status}</span>
                          </div>
                        )}

                        <div className="order-actions">
                          {canReturn(o) && (
                            <button className="btn btn-dark btn-sm" onClick={() => setReturning(o)}>
                              <RotateCcw size={15} /> Request return
                            </button>
                          )}
                          {o.status === 'Processing' && (
                            <button className="btn btn-ghost btn-sm danger" onClick={() => doCancel(o)} disabled={cancelling === o.id}>
                              {cancelling === o.id ? <Loader2 size={15} className="spin" /> : <Ban size={15} />} Cancel order
                            </button>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={() => openAssistant(`What is the status of order ${o.id}?`)}>
                            <Sparkles size={15} /> Ask ShopAssist
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {returns.length > 0 && (
            <section className="section-tight">
              <h2>Returns</h2>
              <div className="returns-list">
                {returns.map((r) => (
                  <div key={r.id} className="return-row">
                    <span className="ps-icon violet"><RotateCcw size={16} /></span>
                    <div>
                      <b>{r.id}</b>
                      <small>
                        Order {r.orderId} · {(r.items || []).join(', ')}
                      </small>
                    </div>
                    <span className="muted">{r.reason}</span>
                    <span className="muted">{fmtDate(r.createdAt)}</span>
                    <span className={`status small ${slug(r.status)}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {returning && <ReturnModal order={returning} onClose={() => setReturning(null)} onSubmit={doReturn} />}
    </div>
  );
}

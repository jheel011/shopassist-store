import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, X, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchOrders, fetchPolicies, fetchProducts, fetchReturns } from '../services/db';
import { fmtDate, inr, isoDate } from '../lib/format';
import ProductImage from './ProductImage';

const GREETING =
  "Hi! I'm ShopAssist AI. Ask me about products, your orders, returns or payments — I can look things up for you.";

const SUGGESTIONS = [
  'Where is my latest order?',
  'Recommend headphones under ₹15,000',
  'How do returns work?',
  'Which payment methods do you accept?',
];

// Renders **bold** and [[product:ID]] tokens from the model's reply.
function Rich({ text, products }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[\[product:[^\]]+\]\])/g).filter(Boolean);
  return parts.map((s, i) => {
    if (s.startsWith('**') && s.endsWith('**')) return <strong key={i}>{s.slice(2, -2)}</strong>;
    const m = s.match(/^\[\[product:(.+)\]\]$/);
    if (m) {
      const p = products.find((x) => x.id === m[1].trim());
      if (!p) return null;
      return (
        <Link key={i} to={`/product/${p.id}`} className="chat-product">
          <ProductImage src={p.image} alt={p.name} category={p.category} />
          <span>
            <b>{p.name}</b>
            <em>{inr(p.price)}</em>
          </span>
        </Link>
      );
    }
    return <span key={i}>{s}</span>;
  });
}

// Used only when the AI function can't be reached (e.g. plain `npm run dev`
// without Netlify). Answers a few common questions straight from Firestore data.
function fallbackReply(question, ctx, user) {
  const q = question.toLowerCase();
  const policy = (id) => ctx.policies.find((p) => p.id === id)?.content;

  if (/order|track|deliver|where|status/.test(q)) {
    if (!user) return 'Please sign in so I can look up your orders.';
    if (!ctx.orders.length) return "You don't have any orders yet.";
    return ctx.orders
      .slice(0, 3)
      .map((o) => `**${o.id}** — ${o.status}, arriving ${fmtDate(o.deliveryDate)} (${inr(o.total)}, payment ${o.paymentStatus})`)
      .join('\n');
  }
  if (/return|refund|replace/.test(q)) {
    const mine = ctx.returns.map((r) => `**${r.id}**: ${r.status}`).join('\n');
    return `${policy('returns') || 'Returns are accepted within 10 days of delivery.'}${mine ? `\n\nYour returns:\n${mine}` : ''}`;
  }
  if (/pay|upi|card|cod|cash/.test(q)) return policy('payments') || 'We accept UPI, cards and Cash on Delivery.';

  const budget = q.match(/(?:under|below|less than)\s*₹?\s*([\d,]+)/);
  const max = budget ? Number(budget[1].replace(/,/g, '')) : Infinity;
  const words = q.split(/\W+/).filter((w) => w.length > 3);
  const hits = ctx.products
    .filter((p) => p.price <= max && words.some((w) => `${p.name} ${p.category}`.toLowerCase().includes(w.replace(/s$/, ''))))
    .slice(0, 3);
  if (hits.length) return `Here are some options:\n${hits.map((p) => `[[product:${p.id}]]`).join('\n')}`;
  return "I couldn't find that. Try asking about your orders, returns, payments, or a product type like 'headphones under ₹10,000'.";
}

export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', text: GREETING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [ctx, setCtx] = useState({ products: [], orders: [], returns: [], policies: [] });
  const [ctxReady, setCtxReady] = useState(false);
  const [pending, setPending] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  // Let any "Ask ShopAssist" button open the panel (optionally with a prompt).
  useEffect(() => {
    const onOpen = (e) => {
      setOpen(true);
      if (e.detail?.prompt) setPending(e.detail.prompt);
    };
    window.addEventListener('shopassist:open', onOpen);
    return () => window.removeEventListener('shopassist:open', onOpen);
  }, []);

  // Load the store data the assistant answers from. Reloads when the user changes.
  useEffect(() => {
    if (!open) return undefined;
    let live = true;
    setCtxReady(false);
    Promise.all([
      fetchProducts(),
      fetchPolicies(),
      user ? fetchOrders(user.uid) : [],
      user ? fetchReturns(user.uid) : [],
    ])
      .then(([products, policies, orders, returns]) => {
        if (!live) return;
        setCtx({ products, policies, orders, returns });
        setCtxReady(true);
      })
      .catch(() => live && setCtxReady(true));
    return () => {
      live = false;
    };
  }, [open, user?.uid]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const buildContext = useCallback(
    () => ({
      user: user ? { name: user.name } : null,
      today: new Date().toISOString().slice(0, 10),
      products: ctx.products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        oldPrice: p.oldPrice,
        rating: p.rating,
        stock: p.stock,
        badge: p.badge || null,
      })),
      orders: ctx.orders.map((o) => ({
        id: o.id,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        total: o.total,
        orderDate: isoDate(o.orderDate),
        deliveryDate: isoDate(o.deliveryDate),
        items: o.products.map((i) => `${i.name} x${i.quantity}`),
      })),
      returns: ctx.returns.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        status: r.status,
        reason: r.reason,
        createdAt: isoDate(r.createdAt),
      })),
      policies: ctx.policies.map((p) => ({ title: p.title, content: p.content })),
    }),
    [ctx, user]
  );

  const send = async (raw) => {
    const text = raw.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(({ role, text: t }) => ({ role, text: t })),
          context: buildContext(),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { reply } = await res.json();
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: fallbackReply(text, ctx, user), offline: true },
      ]);
    } finally {
      setBusy(false);
    }
  };

  // Send a prompt that arrived via an "Ask ShopAssist" button once data is ready.
  useEffect(() => {
    if (pending && ctxReady && !busy) {
      const t = pending;
      setPending(null);
      send(t);
    }
  }, [pending, ctxReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => setMessages([{ role: 'assistant', text: GREETING }]);

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Open ShopAssist chat">
          <span className="chat-fab-pulse" />
          <Sparkles size={22} />
          <span className="chat-fab-label">Ask ShopAssist</span>
        </button>
      )}

      <section className={`chat ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="ShopAssist AI chat">
        <header className="chat-head">
          <div className="chat-avatar">
            <Sparkles size={18} />
          </div>
          <div>
            <b>ShopAssist AI</b>
            <span>
              <i className="dot" /> Online · replies instantly
            </span>
          </div>
          <button className="icon-btn" onClick={reset} aria-label="Clear conversation" title="New chat">
            <RotateCcw size={16} />
          </button>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
            <X size={18} />
          </button>
        </header>

        <div className="chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="bubble">
                {m.role === 'assistant' ? <Rich text={m.text} products={ctx.products} /> : m.text}
                {m.offline && <small className="offline-note">Offline mode — AI service unreachable</small>}
              </div>
            </div>
          ))}
          {busy && (
            <div className="msg assistant">
              <div className="bubble typing" aria-label="ShopAssist is typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          {messages.length === 1 && !busy && (
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={user ? 'Ask about products, orders, returns…' : 'Ask about products, returns, payments…'}
            aria-label="Message ShopAssist"
            maxLength={500}
          />
          <button type="submit" className="send" disabled={busy || !input.trim()} aria-label="Send">
            <Send size={17} />
          </button>
        </form>
      </section>
    </>
  );
}

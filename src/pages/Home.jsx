import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headset,
  Star,
  Quote,
  Bot,
  User,
  PackageCheck,
} from 'lucide-react';
import { fetchProducts } from '../services/db';
import { CATEGORIES } from '../data/categories';
import { inr } from '../lib/format';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import QuickView from '../components/QuickView';
import Reveal from '../components/Reveal';
import { ProductGridSkeleton, Skeleton } from '../components/Skeleton';
import { ErrorState, EmptyCatalog } from '../components/States';
import { openAssistant } from '../components/Navbar';

const STATS = [
  { value: '50K+', label: 'Products' },
  { value: '4.9/5', label: 'Customer rating' },
  { value: '24/7', label: 'AI assistance' },
  { value: '2M+', label: 'Happy customers' },
];

const BENEFITS = [
  { icon: Truck, title: 'Fast Delivery', text: 'Free shipping over ₹999, most orders at your door in 3–5 days.' },
  { icon: ShieldCheck, title: 'Secure Payments', text: 'UPI, cards and cash on delivery with end-to-end protection.' },
  { icon: RotateCcw, title: 'Easy Returns', text: '10-day no-fuss returns, requested in two taps from your orders.' },
  { icon: Headset, title: 'AI Support', text: 'ShopAssist answers order, return and payment questions instantly.' },
];

const TESTIMONIALS = [
  {
    name: 'Ananya Mehta',
    role: 'Product designer, Pune',
    quote:
      'I asked ShopAssist for noise-cancelling headphones under my budget and it found the perfect pair in seconds. Genuinely faster than browsing.',
  },
  {
    name: 'Karan Verma',
    role: 'Software engineer, Bengaluru',
    quote:
      'Tracking my laptop order was just a chat message away. The return flow was the smoothest I have ever used on any store.',
  },
  {
    name: 'Sneha Iyer',
    role: 'Photographer, Chennai',
    quote:
      'The site feels premium and everything loads instantly. Support actually knew what I had ordered — that never happens.',
  },
];

export default function Home() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [quick, setQuick] = useState(null);

  const load = () => {
    setError('');
    setProducts(null);
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const trending = useMemo(
    () => (products ? [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 4) : []),
    [products]
  );
  const counts = useMemo(() => {
    const c = {};
    (products || []).forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
    return c;
  }, [products]);
  const hero = trending[0];

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="pill">
              <Sparkles size={14} /> Now with AI shopping assistant
            </span>
            <h1>
              Shopping made <span className="grad-text">smarter.</span>
            </h1>
            <p>
              ShopAssist AI helps you discover products, track orders, handle returns and answer every shopping
              question — all in one conversation.
            </p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-dark btn-lg">
                Explore Products <ArrowRight size={18} />
              </Link>
              <button className="btn btn-ghost btn-lg" onClick={() => openAssistant()}>
                <Sparkles size={18} /> Ask ShopAssist
              </button>
            </div>
            <div className="hero-proof">
              <div className="proof-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <span>
                <b>4.9/5</b> from 12,000+ verified reviews
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hv-card">
              {hero ? (
                <>
                  <ProductImage key={hero.image} src={hero.image} alt={hero.name} category={hero.category} />
                  <div className="hv-meta">
                    <span className="eyebrow">{hero.category}</span>
                    <b>{hero.name}</b>
                    <span>{inr(hero.price)}</span>
                  </div>
                </>
              ) : (
                <Skeleton h="100%" r={28} />
              )}
            </div>
            <div className="hv-bubble">
              <div className="hv-ai">
                <Sparkles size={14} />
              </div>
              <div>
                <b>ShopAssist</b>
                <span>Found 3 matches under your budget. Want the top pick?</span>
              </div>
            </div>
            <div className="hv-chip">
              <PackageCheck size={18} />
              <div>
                <b>Order shipped</b>
                <span>Arriving in 2 days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- stats */}
      <section className="container stats">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} className="stat">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </Reveal>
        ))}
      </section>

      {/* ------------------------------------------------------------ benefits */}
      <section className="container section">
        <div className="benefits">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 80} className="benefit">
              <span className="benefit-icon">
                <b.icon size={22} />
              </span>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ trending */}
      <section className="container section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Hot right now</span>
            <h2>Trending products</h2>
          </div>
          <Link to="/shop" className="link-arrow">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !products ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          <EmptyCatalog onLoaded={load} />
        ) : (
          <div className="grid-products">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} onQuickView={setQuick} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------- categories */}
      <section className="container section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Browse</span>
            <h2>Shop by category</h2>
          </div>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.name} delay={i * 60}>
              <Link
                to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="cat-card"
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
              >
                <span className="cat-icon">
                  <c.icon size={26} strokeWidth={1.6} />
                </span>
                <div>
                  <b>{c.name}</b>
                  <span>{products ? `${counts[c.name] || 0} products` : c.blurb}</span>
                </div>
                <ArrowRight size={18} className="cat-arrow" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ AI */}
      <section className="container section">
        <div className="ai-promo">
          <div className="ai-copy">
            <span className="pill dark">
              <Sparkles size={14} /> ShopAssist AI
            </span>
            <h2>
              Don’t search. <span className="grad-text">Just ask.</span>
            </h2>
            <p>
              Skip the filters. Tell ShopAssist what you need in plain language — it knows the catalogue, your
              orders, our return policy and payment options.
            </p>
            <ul className="ai-points">
              <li>Product recommendations that respect your budget</li>
              <li>Live order tracking and delivery dates</li>
              <li>Return and refund help in seconds</li>
            </ul>
            <button className="btn btn-primary btn-lg" onClick={() => openAssistant()}>
              <Sparkles size={18} /> Try it now
            </button>
          </div>
          <div className="ai-demo" aria-label="Sample conversation">
            <div className="demo-msg user">
              <span className="demo-ico">
                <User size={14} />
              </span>
              <p>I need noise-cancelling headphones under ₹15,000.</p>
            </div>
            <div className="demo-msg ai">
              <span className="demo-ico">
                <Bot size={14} />
              </span>
              <p>
                Top pick: the <b>Sonic Pro X1</b> — hybrid ANC, 40-hour battery, ₹12,999 and rated 4.8★. Shall I add
                it to your cart?
              </p>
            </div>
            <div className="demo-msg user">
              <span className="demo-ico">
                <User size={14} />
              </span>
              <p>Great. And where’s my last order?</p>
            </div>
            <div className="demo-msg ai">
              <span className="demo-ico">
                <Bot size={14} />
              </span>
              <p>
                Your order is <b>shipped</b> and arrives in 2 days. Need to change anything?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- testimonials */}
      <section className="container section">
        <div className="section-head center">
          <div>
            <span className="eyebrow">Loved by shoppers</span>
            <h2>What customers say</h2>
          </div>
        </div>
        <div className="testimonials">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100} className="testimonial">
              <Quote size={22} className="quote-ico" />
              <p>{t.quote}</p>
              <div className="t-foot">
                <span className="t-avatar">{t.name[0]}</span>
                <div>
                  <b>{t.name}</b>
                  <span>{t.role}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {quick && <QuickView product={quick} onClose={() => setQuick(null)} />}
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  PackageX,
  Sparkles,
} from 'lucide-react';
import { fetchPolicies, fetchProduct, fetchProducts } from '../services/db';
import { useShop } from '../context/ShopContext';
import { addDays, discountPct, fmtDate, inr } from '../lib/format';
import ProductImage from '../components/ProductImage';
import ProductCard from '../components/ProductCard';
import Stars from '../components/Stars';
import { Skeleton } from '../components/Skeleton';
import { EmptyState, ErrorState } from '../components/States';
import { openAssistant } from '../components/Navbar';

const pretty = (k) => k.replace(/_/g, ' ');

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, toggleWish, isWished } = useShop();

  const [product, setProduct] = useState(undefined); // undefined = loading, null = not found
  const [all, setAll] = useState([]);
  const [returnPolicy, setReturnPolicy] = useState('');
  const [error, setError] = useState('');
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  const load = () => {
    setError('');
    setProduct(undefined);
    setActive(0);
    setQty(1);
    fetchProduct(id)
      .then(setProduct)
      .catch((e) => setError(e.message));
    fetchProducts()
      .then(setAll)
      .catch(() => {});
    fetchPolicies()
      .then((ps) => setReturnPolicy(ps.find((p) => p.id === 'returns')?.content || ''))
      .catch(() => {});
  };
  useEffect(load, [id]);

  const related = useMemo(
    () =>
      product
        ? all
            .filter((p) => p.category === product.category && p.id !== product.id)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4)
        : [],
    [all, product]
  );

  if (error) return <div className="container page-pad"><ErrorState message={error} onRetry={load} /></div>;

  if (product === undefined) {
    return (
      <div className="container page-pad">
        <div className="detail-grid">
          <Skeleton h={520} r={28} />
          <div className="stack">
            <Skeleton w="30%" h={12} />
            <Skeleton w="80%" h={34} />
            <Skeleton w="40%" h={16} />
            <Skeleton w="35%" h={30} />
            <Skeleton h={90} />
            <Skeleton h={52} r={999} />
          </div>
        </div>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="container page-pad">
        <EmptyState
          icon={PackageX}
          title="Product not found"
          text="This product may have been removed or the link is incorrect."
          action={<Link to="/shop" className="btn btn-dark">Back to shop</Link>}
        />
      </div>
    );
  }

  const p = product;
  const images = (p.images?.length ? p.images : [p.image]).filter(Boolean);
  const off = discountPct(p.price, p.oldPrice);
  const out = p.stock <= 0;
  const low = !out && p.stock <= 10;
  const eta = `${fmtDate(addDays(3), { day: 'numeric', month: 'short' })} – ${fmtDate(addDays(5), { day: 'numeric', month: 'short' })}`;
  const specs = Object.entries(p.specifications || {});

  const buyNow = () => {
    if (add(p, qty, { silent: true })) navigate('/checkout');
  };

  return (
    <div className="container page-pad">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop">Shop</Link>
        <ChevronRight size={14} />
        <Link to={`/shop?category=${encodeURIComponent(p.category)}`}>{p.category}</Link>
        <ChevronRight size={14} />
        <span>{p.name}</span>
      </nav>

      <div className="detail-grid">
        <div className="gallery">
          <div className="gallery-main">
            <ProductImage key={images[active]} src={images[active]} alt={p.name} category={p.category} />
            {p.badge && <span className="badge">{p.badge}</span>}
          </div>
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((src, i) => (
                <button
                  key={src}
                  className={`thumb ${i === active ? 'active' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <ProductImage src={src} alt="" category={p.category} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <Link to={`/shop?category=${encodeURIComponent(p.category)}`} className="eyebrow">
            {p.category}
          </Link>
          <h1>{p.name}</h1>
          <div className="rating-row">
            <Stars rating={p.rating} full size={17} />
            <span className="muted">{p.reviews.toLocaleString('en-IN')} reviews</span>
          </div>

          <div className="price-row big">
            <b>{inr(p.price)}</b>
            {p.oldPrice > p.price && <s>{inr(p.oldPrice)}</s>}
            {off > 0 && <span className="off-pill">{off}% off</span>}
          </div>
          <p className="tax-note">Inclusive of all taxes</p>

          <span className={`stock-pill ${out ? 'out' : low ? 'low' : 'in'}`}>
            <i />
            {out ? 'Out of stock' : low ? `Only ${p.stock} left — order soon` : `In stock (${p.stock} available)`}
          </span>

          <p className="detail-desc">{p.description}</p>

          <div className="qty-row">
            <div className="qty" aria-label="Quantity">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={out} aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(p.stock, q + 1))}
                disabled={out || qty >= p.stock}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className={`icon-btn square ${isWished(p.id) ? 'wish on' : ''}`}
              onClick={() => toggleWish(p)}
              aria-label="Toggle wishlist"
              aria-pressed={isWished(p.id)}
            >
              <Heart size={20} />
            </button>
          </div>

          <div className="cta-row">
            <button className="btn btn-dark btn-lg grow" disabled={out} onClick={() => add(p, qty)}>
              <ShoppingBag size={18} /> Add to cart
            </button>
            <button className="btn btn-primary btn-lg grow" disabled={out} onClick={buyNow}>
              <Zap size={18} /> Buy now
            </button>
          </div>

          <button
            className="ask-link"
            onClick={() => openAssistant(`Tell me more about the ${p.name}. Is it a good buy?`)}
          >
            <Sparkles size={15} /> Ask ShopAssist about this product
          </button>

          <div className="info-cards">
            <div>
              <Truck size={20} />
              <div>
                <b>Delivery</b>
                <span>
                  Get it by {eta}. {p.price >= 999 ? 'Free delivery.' : 'Delivery fee ₹79.'}
                </span>
              </div>
            </div>
            <div>
              <RotateCcw size={20} />
              <div>
                <b>10-day returns</b>
                <span>{returnPolicy ? returnPolicy.split('. ').slice(0, 2).join('. ') + '.' : 'Easy returns within 10 days of delivery.'}</span>
              </div>
            </div>
            <div>
              <ShieldCheck size={20} />
              <div>
                <b>Secure payment</b>
                <span>UPI, cards and cash on delivery are all supported.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {specs.length > 0 && (
        <section className="section-tight">
          <h2>Specifications</h2>
          <dl className="specs">
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt>{pretty(k)}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {related.length > 0 && (
        <section className="section-tight">
          <h2>You may also like</h2>
          <div className="grid-products">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

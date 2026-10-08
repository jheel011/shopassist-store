import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import ProductImage from './ProductImage';
import Stars from './Stars';
import { useShop } from '../context/ShopContext';
import { inr, discountPct } from '../lib/format';

export default function ProductCard({ product: p, onQuickView }) {
  const { add, toggleWish, isWished } = useShop();
  const off = discountPct(p.price, p.oldPrice);
  const out = p.stock <= 0;
  const low = p.stock > 0 && p.stock <= 10;

  return (
    <article className="pcard">
      <Link to={`/product/${p.id}`} className="pcard-media" aria-label={p.name}>
        <ProductImage key={p.image} src={p.image} alt={p.name} category={p.category} />
        {p.badge && <span className="badge">{p.badge}</span>}
        {off > 0 && <span className="off">-{off}%</span>}
        {out && <span className="sold-out">Sold out</span>}
      </Link>

      <button
        className={`icon-btn wish ${isWished(p.id) ? 'on' : ''}`}
        onClick={() => toggleWish(p)}
        aria-label={isWished(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={isWished(p.id)}
      >
        <Heart size={18} />
      </button>
      {onQuickView && (
        <button className="icon-btn quick" onClick={() => onQuickView(p)} aria-label={`Quick view ${p.name}`}>
          <Eye size={18} />
        </button>
      )}

      <div className="pcard-body">
        <span className="eyebrow">{p.category}</span>
        <Link to={`/product/${p.id}`} className="pcard-title">
          {p.name}
        </Link>
        <Stars rating={p.rating} reviews={p.reviews} />
        <div className="price-row">
          <b>{inr(p.price)}</b>
          {p.oldPrice > p.price && <s>{inr(p.oldPrice)}</s>}
        </div>
        <div className="pcard-foot">
          <span className={`stock ${out ? 'out' : low ? 'low' : 'in'}`}>
            {out ? 'Out of stock' : low ? `Only ${p.stock} left` : 'In stock'}
          </span>
          <button className="btn btn-sm btn-dark" disabled={out} onClick={() => add(p)}>
            <ShoppingBag size={15} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}

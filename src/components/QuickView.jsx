import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import ProductImage from './ProductImage';
import Stars from './Stars';
import { useShop } from '../context/ShopContext';
import { inr, discountPct } from '../lib/format';

export default function QuickView({ product: p, onClose }) {
  const { add } = useShop();
  const [qty, setQty] = useState(1);
  const out = p.stock <= 0;
  const off = discountPct(p.price, p.oldPrice);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal quickview" role="dialog" aria-modal="true" aria-label={p.name}>
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="qv-media">
          <ProductImage key={p.image} src={p.image} alt={p.name} category={p.category} />
        </div>
        <div className="qv-info">
          <span className="eyebrow">{p.category}</span>
          <h2>{p.name}</h2>
          <Stars rating={p.rating} reviews={p.reviews} full />
          <div className="price-row big">
            <b>{inr(p.price)}</b>
            {p.oldPrice > p.price && <s>{inr(p.oldPrice)}</s>}
            {off > 0 && <span className="off-pill">{off}% off</span>}
          </div>
          <p className="muted">{p.description}</p>
          <div className="qty-row">
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock || 1, q + 1))} aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
            <button
              className="btn btn-primary grow"
              disabled={out}
              onClick={() => {
                if (add(p, qty)) onClose();
              }}
            >
              <ShoppingBag size={17} /> {out ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
          <Link to={`/product/${p.id}`} className="link-arrow" onClick={onClose}>
            View full details <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
